// services/ai.service.js
const { v4: uuidv4 } = require("uuid")
const axios = require("axios")
const fs = require("fs")
const path = require("path")
const { GoogleGenerativeAI } = require("@google/generative-ai")
const { OpenAI } = require("openai")
const Anthropic = require("@anthropic-ai/sdk")
const aiConfig = require("../config/ai.config")
const AIGenerationLog = require("../models/aiGenerationLog")
const EventTemplate = require("../models/eventTemplate")
const User = require("../models/user")
const RateLimiter = require("../utils/rateLimiter")

class AIService {
  constructor() {
    this.rateLimiter = new RateLimiter(aiConfig.rateLimit)
    this.setupLogging()
  }

  /**
   * Set up logging
   */
  setupLogging() {
    this.logger = {
      log: (message) => {
        if (aiConfig.logging.enabled) {
          console.log(`[AI Service] ${message}`)

          if (aiConfig.logging.logToFile) {
            const logDir = path.dirname(aiConfig.logging.logFilePath)
            if (!fs.existsSync(logDir)) {
              fs.mkdirSync(logDir, { recursive: true })
            }

            fs.appendFileSync(aiConfig.logging.logFilePath, `${new Date().toISOString()} - ${message}\n`)
          }
        }
      },
      error: (message, error) => {
        if (aiConfig.logging.enabled && aiConfig.logging.logErrors) {
          console.error(`[AI Service Error] ${message}`, error)

          if (aiConfig.logging.logToFile) {
            const logDir = path.dirname(aiConfig.logging.logFilePath)
            if (!fs.existsSync(logDir)) {
              fs.mkdirSync(logDir, { recursive: true })
            }

            fs.appendFileSync(
              aiConfig.logging.logFilePath,
              `${new Date().toISOString()} - ERROR: ${message} - ${error.message}\n`,
            )
          }
        }
      },
    }
  }

  /**
   * Get AI client based on provider
   * @returns {Object} AI client
   */
  getAIClient() {
    const provider = aiConfig.defaultProvider

    switch (provider) {
      case "gemini":
        return new GeminiAIClient(this.logger)
      case "openai":
        return new OpenAIClient(this.logger)
      case "anthropic":
        return new AnthropicAIClient(this.logger)
      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }
  }

  /**
   * Generate event content
   * @param {Object} params - Generation parameters
   * @param {Object} user - User object
   * @returns {Object} Generated content
   */
  async generateEventContent(params, user) {
    let logId;  // Define logId variable at the beginning
    
    try {
      // Check rate limits
      const canProceed = await this.rateLimiter.checkRateLimit(user.id, user.subscription || "free")
      if (!canProceed) {
        throw new Error("Rate limit exceeded. Please try again later.")
      }

      // Validate parameters
      this.validateEventParams(params)

      // Apply content moderation to inputs
      if (aiConfig.moderation.enabled && aiConfig.moderation.moderatePrompts) {
        this.moderateContent(params)
      }

      // Build the prompt
      const prompt = this.buildEventGenerationPrompt(params)

      // Create a log entry
      logId = uuidv4()
      await AIGenerationLog.create({
        id: logId,
        userId: user.id,
        prompt,
        parameters: params,
        status: "pending",
        model: aiConfig.providers[aiConfig.defaultProvider].model,
      })

      this.logger.log(`Starting event generation for user ${user.id} with params: ${JSON.stringify(params)}`)

      // Get the AI client
      const aiClient = this.getAIClient()

      // Generate content
      const result = await aiClient.generateContent(prompt)

      // Parse the JSON response
      let eventTemplate
      try {
        // Extract JSON from the response (it might be wrapped in markdown code blocks)
        const jsonMatch = result.text.match(/```json\n([\s\S]*?)\n```/) ||
          result.text.match(/```\n([\s\S]*?)\n```/) || [null, result.text]
        const jsonString = jsonMatch[1] || result.text
        eventTemplate = JSON.parse(jsonString)

        // Apply content moderation to response
        if (aiConfig.moderation.enabled && aiConfig.moderation.moderateResponses) {
          this.moderateContent(eventTemplate)
        }

        // Update log with success
        await AIGenerationLog.update(
          {
            status: "success",
            result: eventTemplate,
            tokensUsed: result.tokensUsed || 0,
          },
          { where: { id: logId } },
        )

        this.logger.log(`Successfully generated event content for user ${user.id}`)

        return {
          success: true,
          eventTemplate,
          logId,
        }
      } catch (parseError) {
        this.logger.error("Error parsing AI response:", parseError)

        // Update log with error
        await AIGenerationLog.update(
          {
            status: "error",
            errorMessage: `Failed to parse AI response: ${parseError.message}`,
            result: result.text,
          },
          { where: { id: logId } },
        )

        throw new Error(`Failed to parse AI response: ${parseError.message}`)
      }
    } catch (error) {
      this.logger.error("Error generating event content:", error)

      // Update log with error if it exists
      if (logId) {
        await AIGenerationLog.update(
          {
            status: "error",
            errorMessage: error.message,
          },
          { where: { id: logId } },
        )
      }

      // Ensure logId is returned even if there's an error
      throw Object.assign(error, { logId });
    }
  }

  /**
   * Generate image for event
   * @param {Object} params - Image generation parameters
   * @param {Object} user - User object
   * @returns {Object} Generated image URL
   */
  async generateEventImage(params, user) {
    try {
      // Check rate limits
      const canProceed = await this.rateLimiter.checkRateLimit(user.id, user.subscription || "free")
      if (!canProceed) {
        throw new Error("Rate limit exceeded. Please try again later.")
      }

      // Validate parameters
      if (!params.prompt) {
        throw new Error("Image prompt is required")
      }

      // Apply content moderation to inputs
      if (aiConfig.moderation.enabled && aiConfig.moderation.moderatePrompts) {
        this.moderateContent(params)
      }

      // Create a log entry
      const logId = uuidv4()
      await AIGenerationLog.create({
        id: logId,
        userId: user.id,
        prompt: params.prompt,
        parameters: params,
        status: "pending",
        model: `${aiConfig.imageGeneration.provider}-image`,
      })

      this.logger.log(`Starting image generation for user ${user.id} with prompt: ${params.prompt}`)

      // Generate image
      const imageResult = await this.generateImage(params.prompt, params.size || "1024x1024")

      if (!imageResult.success) {
        // Update log with error
        await AIGenerationLog.update(
          {
            status: "error",
            errorMessage: imageResult.error,
          },
          { where: { id: logId } },
        )

        throw new Error(`Failed to generate image: ${imageResult.error}`)
      }

      // Update log with success
      await AIGenerationLog.update(
        {
          status: "success",
          result: { imageUrl: imageResult.imageUrl },
        },
        { where: { id: logId } },
      )

      this.logger.log(`Successfully generated image for user ${user.id}`)

      return {
        success: true,
        imageUrl: imageResult.imageUrl,
        logId,
      }
    } catch (error) {
      this.logger.error("Error generating image:", error)

      // Update log with error if it exists
      if (logId) {
        await AIGenerationLog.update(
          {
            status: "error",
            errorMessage: error.message,
          },
          { where: { id: logId } },
        )
      }

      throw error
    }
  }

  /**
   * Save event template
   * @param {Object} templateData - Template data
   * @param {Object} user - User object
   * @returns {Object} Saved template
   */
  async saveEventTemplate(templateData, user) {
    try {
      const { name, eventType, template } = templateData

      // Validate template data
      if (!name || !eventType || !template) {
        throw new Error("Name, event type, and template data are required")
      }

      // Create template
      const eventTemplate = await EventTemplate.create({
        id: uuidv4(),
        userId: user.id,
        name,
        eventType,
        templateData: template,
      })

      this.logger.log(`Template saved for user ${user.id}: ${name}`)

      return {
        success: true,
        templateId: eventTemplate.id,
        template: eventTemplate,
      }
    } catch (error) {
      this.logger.error("Error saving template:", error)
      throw error
    }
  }

  /**
   * Get event templates for user
   * @param {Object} user - User object
   * @returns {Array} User's templates
   */
  async getEventTemplates(user) {
    try {
      const templates = await EventTemplate.findAll({
        where: { userId: user.id },
        order: [["createdAt", "DESC"]],
      })

      return {
        success: true,
        templates: templates.map((t) => ({
          id: t.id,
          name: t.name,
          eventType: t.eventType,
          createdAt: t.createdAt,
        })),
      }
    } catch (error) {
      this.logger.error("Error fetching templates:", error)
      throw error
    }
  }

  /**
   * Get event template by ID
   * @param {String} id - Template ID
   * @param {Object} user - User object
   * @returns {Object} Template
   */
  async getEventTemplateById(id, user) {
    try {
      const template = await EventTemplate.findOne({
        where: { id, userId: user.id },
      })

      if (!template) {
        throw new Error("Template not found")
      }

      return {
        success: true,
        template,
      }
    } catch (error) {
      this.logger.error("Error fetching template:", error)
      throw error
    }
  }

  /**
   * Delete event template
   * @param {String} id - Template ID
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async deleteEventTemplate(id, user) {
    try {
      const template = await EventTemplate.findOne({
        where: { id, userId: user.id },
      })

      if (!template) {
        throw new Error("Template not found")
      }

      await template.destroy()

      this.logger.log(`Template deleted by user ${user.id}: ${id}`)

      return {
        success: true,
        message: "Template deleted successfully",
      }
    } catch (error) {
      this.logger.error("Error deleting template:", error)
      throw error
    }
  }

  /**
   * Get AI generation logs for user
   * @param {Object} user - User object
   * @param {Object} options - Query options
   * @returns {Array} User's logs
   */
  async getAIGenerationLogs(user, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options

      // Build where clause
      const whereClause = { userId: user.id }

      if (status) {
        whereClause.status = status
      }

      // Calculate pagination
      const offset = (page - 1) * limit

      // Get logs
      const { count, rows: logs } = await AIGenerationLog.findAndCountAll({
        where: whereClause,
        order: [["createdAt", "DESC"]],
        offset,
        limit: Number.parseInt(limit),
      })

      // Format logs
      const formattedLogs = logs.map((log) => ({
        id: log.id,
        status: log.status,
        model: log.model,
        tokensUsed: log.tokensUsed,
        createdAt: log.createdAt,
        parameters: log.parameters,
        errorMessage: log.errorMessage,
      }))

      // Calculate pagination data
      const totalPages = Math.ceil(count / limit)

      return {
        success: true,
        logs: formattedLogs,
        pagination: {
          total: count,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          pages: totalPages,
        },
      }
    } catch (error) {
      this.logger.error("Error fetching AI generation logs:", error)
      throw error
    }
  }

  /**
   * Get AI generation log by ID
   * @param {String} id - Log ID
   * @param {Object} user - User object
   * @returns {Object} Log
   */
  async getAIGenerationLogById(id, user) {
    try {
      const log = await AIGenerationLog.findOne({
        where: { id, userId: user.id },
      })

      if (!log) {
        throw new Error("Log not found")
      }

      return {
        success: true,
        log,
      }
    } catch (error) {
      this.logger.error("Error fetching AI generation log:", error)
      throw error
    }
  }

  /**
   * Build event generation prompt
   * @param {Object} params - Generation parameters
   * @returns {String} Prompt
   */
  buildEventGenerationPrompt(params) {
    let prompt = aiConfig.templates.defaultPromptTemplate

    // Replace template variables
    prompt = prompt.replace(/{{eventType}}/g, params.eventType || "event")

    if (params.topic) {
      prompt = prompt.replace(/{{#topic}}(.*?){{\/topic}}/g, `$1`)
      prompt = prompt.replace(/{{topic}}/g, params.topic)
    } else {
      prompt = prompt.replace(/{{#topic}}(.*?){{\/topic}}/g, "")
    }

    if (params.location) {
      prompt = prompt.replace(/{{#location}}(.*?){{\/location}}/g, `$1`)
      prompt = prompt.replace(/{{location}}/g, params.location)
    } else {
      prompt = prompt.replace(/{{#location}}(.*?){{\/location}}/g, "")
    }

    if (params.targetAudience) {
      prompt = prompt.replace(/{{#targetAudience}}(.*?){{\/targetAudience}}/g, `$1`)
      prompt = prompt.replace(/{{targetAudience}}/g, params.targetAudience)
    } else {
      prompt = prompt.replace(/{{#targetAudience}}(.*?){{\/targetAudience}}/g, "")
    }

    if (params.additionalDetails) {
      prompt = prompt.replace(/{{#additionalDetails}}(.*?){{\/additionalDetails}}/g, `$1`)
      prompt = prompt.replace(/{{additionalDetails}}/g, params.additionalDetails)
    } else {
      prompt = prompt.replace(/{{#additionalDetails}}(.*?){{\/additionalDetails}}/g, "")
    }

    return prompt
  }

  /**
   * Build image generation prompt
   * @param {Object} params - Generation parameters
   * @returns {String} Prompt
   */
  buildImageGenerationPrompt(params) {
    let prompt = aiConfig.templates.imagePromptTemplate

    // Replace template variables
    prompt = prompt.replace(/{{eventType}}/g, params.eventType || "event")

    if (params.description) {
      prompt = prompt.replace(/{{#description}}(.*?){{\/description}}/g, `$1`)
      prompt = prompt.replace(/{{description}}/g, params.description)
    } else {
      prompt = prompt.replace(/{{#description}}(.*?){{\/description}}/g, "")
    }

    if (params.additionalDetails) {
      prompt = prompt.replace(/{{#additionalDetails}}(.*?){{\/additionalDetails}}/g, `$1`)
      prompt = prompt.replace(/{{additionalDetails}}/g, params.additionalDetails)
    } else {
      prompt = prompt.replace(/{{#additionalDetails}}(.*?){{\/additionalDetails}}/g, "")
    }

    return prompt
  }

  /**
   * Generate image
   * @param {String} prompt - Image prompt
   * @param {String} size - Image size
   * @returns {Object} Generated image URL
   */
  async generateImage(prompt, size = "1024x1024") {
    const provider = aiConfig.imageGeneration.provider

    switch (provider) {
      case "stability":
        return await this.generateStabilityImage(prompt, size)
      case "openai":
        return await this.generateOpenAIImage(prompt, size)
      case "midjourney":
        return await this.generateMidjourneyImage(prompt, size)
      default:
        throw new Error(`Unsupported image generation provider: ${provider}`)
    }
  }

  /**
   * Generate image with Stability AI
   * @param {String} prompt - Image prompt
   * @param {String} size - Image size
   * @returns {Object} Generated image URL
   */
  async generateStabilityImage(prompt, size) {
    try {
      const config = aiConfig.imageGeneration.stability

      if (!config.enabled) {
        throw new Error("Stability AI image generation is not enabled")
      }

      if (!config.apiKey) {
        throw new Error("Stability AI API key is not configured")
      }

      const dimensions = size.split("x").map((s) => Number.parseInt(s, 10))

      this.logger.log(`Generating image with Stability AI: ${prompt}`)

      // In a real implementation, you would call the Stability AI API
      // For now, we'll simulate a successful response

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Return a mock image URL
      return {
        success: true,
        imageUrl: `https://example.com/generated-images/${Date.now()}.png`,
      }
    } catch (error) {
      this.logger.error("Error generating image with Stability AI:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Generate image with OpenAI
   * @param {String} prompt - Image prompt
   * @param {String} size - Image size
   * @returns {Object} Generated image URL
   */
  async generateOpenAIImage(prompt, size) {
    try {
      const config = aiConfig.imageGeneration.openai

      if (!config.enabled) {
        throw new Error("OpenAI image generation is not enabled")
      }

      if (!config.apiKey) {
        throw new Error("OpenAI API key is not configured")
      }

      this.logger.log(`Generating image with OpenAI: ${prompt}`)

      // In a real implementation, you would call the OpenAI API
      // For now, we'll simulate a successful response

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Return a mock image URL
      return {
        success: true,
        imageUrl: `https://example.com/generated-images/${Date.now()}.png`,
      }
    } catch (error) {
      this.logger.error("Error generating image with OpenAI:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Generate image with Midjourney
   * @param {String} prompt - Image prompt
   * @param {String} size - Image size
   * @returns {Object} Generated image URL
   */
  async generateMidjourneyImage(prompt, size) {
    try {
      const config = aiConfig.imageGeneration.midjourney

      if (!config.enabled) {
        throw new Error("Midjourney image generation is not enabled")
      }

      if (!config.apiKey) {
        throw new Error("Midjourney API key is not configured")
      }

      this.logger.log(`Generating image with Midjourney: ${prompt}`)

      // In a real implementation, you would call the Midjourney API
      // For now, we'll simulate a successful response

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 5000))

      // Return a mock image URL
      return {
        success: true,
        imageUrl: `https://example.com/generated-images/${Date.now()}.png`,
      }
    } catch (error) {
      this.logger.error("Error generating image with Midjourney:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Validate event parameters
   * @param {Object} params - Event parameters
   */
  validateEventParams(params) {
    if (!params.eventType) {
      throw new Error("Event type is required")
    }

    if (!aiConfig.templates.eventTypes.includes(params.eventType)) {
      throw new Error(`Invalid event type. Must be one of: ${aiConfig.templates.eventTypes.join(", ")}`)
    }
  }

  /**
   * Moderate content
   * @param {Object|String} content - Content to moderate
   */
  moderateContent(content) {
    const blockList = aiConfig.moderation.blockList

    if (typeof content === "string") {
      // Check if content contains any blocked words
      for (const word of blockList) {
        if (content.toLowerCase().includes(word)) {
          throw new Error(`Content contains inappropriate language: ${word}`)
        }
      }
    } else if (typeof content === "object") {
      // Check each string property
      for (const key in content) {
        if (typeof content[key] === "string") {
          for (const word of blockList) {
            if (content[key].toLowerCase().includes(word)) {
              throw new Error(`Content contains inappropriate language in ${key}: ${word}`)
            }
          }
        } else if (typeof content[key] === "object") {
          // Recursively check nested objects
          this.moderateContent(content[key])
        }
      }
    }
  }
}

/**
 * Gemini AI Client
 */
class GeminiAIClient {
  constructor(logger) {
    this.logger = logger
    this.config = aiConfig.providers.gemini

    if (!this.config.enabled) {
      throw new Error("Gemini AI is not enabled")
    }

    if (!this.config.apiKey) {
      throw new Error("Gemini API key is not configured")
    }

    try {
      this.genAI = new GoogleGenerativeAI(this.config.apiKey)
      this.model = this.genAI.getGenerativeModel({ model: this.config.model })
      this.fallbackModels = this.config.fallbackModels || []
      this.currentModelName = this.config.model
    } catch (error) {
      this.logger.error("Error initializing Gemini AI client:", error)
      throw new Error(`Failed to initialize Gemini AI client: ${error.message}`)
    }
  }

  async generateContent(prompt) {
    // Try with primary model first, then fallbacks if configured
    const models = [this.currentModelName, ...this.fallbackModels]
    let lastError = null;

    for (const modelName of models) {
      try {
        this.logger.log(`Generating content with Gemini model: ${modelName}`)

        if (aiConfig.logging.logPrompts) {
          this.logger.log(`Prompt: ${prompt}`)
        }

        // Get the model instance
        const modelInstance = this.genAI.getGenerativeModel({ model: modelName })

        const result = await modelInstance.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: this.config.temperature,
            topP: this.config.topP,
            maxOutputTokens: this.config.maxTokens,
          },
        })

        const response = result.response
        const responseText = response.text()

        if (aiConfig.logging.logResponses) {
          this.logger.log(`Response: ${responseText.substring(0, 500)}...`)
        }

        // If successful, update the current model being used
        this.currentModelName = modelName;
        this.model = modelInstance;

        return {
          text: responseText,
          tokensUsed: response.usageMetadata?.totalTokens || 0,
          model: modelName,
        }
      } catch (error) {
        lastError = error;
        this.logger.error(`Error generating content with Gemini model ${modelName}:`, error)
        
        // If this is the last model to try, rethrow the error
        if (modelName === models[models.length - 1]) {
          throw error;
        }
        
        // Otherwise log that we're trying the next model
        this.logger.log(`Trying fallback model: ${models[models.indexOf(modelName) + 1]}`)
      }
    }

    // This should not be reached, but just in case
    throw lastError;
  }
}

/**
 * OpenAI Client
 */
class OpenAIClient {
  constructor(logger) {
    this.logger = logger
    this.config = aiConfig.providers.openai

    if (!this.config.enabled) {
      throw new Error("OpenAI is not enabled")
    }

    if (!this.config.apiKey) {
      throw new Error("OpenAI API key is not configured")
    }

    try {
      this.client = new OpenAI({ apiKey: this.config.apiKey })
    } catch (error) {
      this.logger.error("Error initializing OpenAI client:", error)
      throw new Error(`Failed to initialize OpenAI client: ${error.message}`)
    }
  }

  async generateContent(prompt) {
    try {
      this.logger.log(`Generating content with OpenAI model: ${this.config.model}`)

      if (aiConfig.logging.logPrompts) {
        this.logger.log(`Prompt: ${prompt}`)
      }

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: "user", content: prompt }],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP,
      })

      const responseText = response.choices[0].message.content

      if (aiConfig.logging.logResponses) {
        this.logger.log(`Response: ${responseText.substring(0, 500)}...`)
      }

      return {
        text: responseText,
        tokensUsed: response.usage?.total_tokens || 0,
      }
    } catch (error) {
      this.logger.error("Error generating content with OpenAI:", error)
      throw error
    }
  }
}

/**
 * Anthropic AI Client
 */
class AnthropicAIClient {
  constructor(logger) {
    this.logger = logger
    this.config = aiConfig.providers.anthropic

    if (!this.config.enabled) {
      throw new Error("Anthropic AI is not enabled")
    }

    if (!this.config.apiKey) {
      throw new Error("Anthropic API key is not configured")
    }

    try {
      this.client = new Anthropic({ apiKey: this.config.apiKey })
    } catch (error) {
      this.logger.error("Error initializing Anthropic AI client:", error)
      throw new Error(`Failed to initialize Anthropic AI client: ${error.message}`)
    }
  }

  async generateContent(prompt) {
    try {
      this.logger.log(`Generating content with Anthropic model: ${this.config.model}`)

      if (aiConfig.logging.logPrompts) {
        this.logger.log(`Prompt: ${prompt}`)
      }

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        messages: [{ role: "user", content: prompt }],
        temperature: this.config.temperature,
      })

      const responseText = response.content[0].text

      if (aiConfig.logging.logResponses) {
        this.logger.log(`Response: ${responseText.substring(0, 500)}...`)
      }

      return {
        text: responseText,
        tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens || 0,
      }
    } catch (error) {
      this.logger.error("Error generating content with Anthropic:", error)
      throw error
    }
  }
}

module.exports = new AIService()
