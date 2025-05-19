// config/ai.config.js
module.exports = {
  defaultProvider: process.env.AI_PROVIDER || "gemini",

  providers: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      maxTokens: 8192,
      temperature: 0.7,
      topP: 0.95,
      enabled: true,
      timeout: 30000, // 30 seconds
    },

    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-4o",
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.95,
      enabled: process.env.OPENAI_API_KEY ? true : false,
      timeout: 60000, // 60 seconds
    },

    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || "claude-3-opus",
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.95,
      enabled: process.env.ANTHROPIC_API_KEY ? true : false,
      timeout: 60000, // 60 seconds
    },
  },

  imageGeneration: {
    provider: "disabled",
    stability: {
      enabled: false,
    },
    openai: {
      enabled: false,
    },
    midjourney: {
      enabled: false,
    },
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequestsPerHour: {
      free: 10,
      premium: 50,
      enterprise: 200,
    },
    maxTokensPerDay: {
      free: 100000,
      premium: 500000,
      enterprise: 2000000,
    },
    enabled: true,
  },

  // Logging configuration
  logging: {
    enabled: true,
    logPrompts: true,
    logResponses: process.env.NODE_ENV === "development",
    logTokenUsage: true,
    logErrors: true,
    logToDatabase: true,
    logToFile: process.env.NODE_ENV === "production",
    logFilePath: "./logs/ai-requests.log",
  },

  // Event generation templates
  templates: {
    eventTypes: [
      "conference",
      "workshop",
      "concert",
      "exhibition",
      "festival",
      "networking",
      "seminar",
      "webinar",
      "training",
      "party",
      "fundraiser",
      "other",
    ],
    defaultPromptTemplate: `
You are an expert event planner with years of experience creating professional events in Ethiopia. 
Your task is to create detailed content for a {{eventType}} event{{#topic}} about {{topic}}{{/topic}}{{#location}} in {{location}}{{/location}}{{#targetAudience}} targeted at {{targetAudience}}{{/targetAudience}}.

{{#additionalDetails}}Additional context: {{additionalDetails}}{{/additionalDetails}}

Please generate the following content for this event:

1. A catchy, professional title (max 10 words)
2. A brief caption/tagline (max 15 words)
3. A concise description (2-3 sentences)
4. A detailed description (3-4 paragraphs)
5. A schedule with 4-6 time slots, each with a title and description
6. 5-7 frequently asked questions with answers
7. 2-3 ticket types with names, descriptions, and bullet points for benefits
8. 3 image suggestions with descriptions and generation prompts

Format your response as a valid JSON object with the following structure:
{
 "title": "Event Title",
 "caption": "Event Tagline",
 "description": "Brief description",
 "longDescription": "Detailed description...",
 "schedule": [
   {
     "time": "9:00 AM - 10:00 AM",
     "title": "Activity Title",
     "description": "Activity description"
   }
 ],
 "faqs": [
   {
     "question": "Question text?",
     "answer": "Answer text"
   }
 ],
 "ticketTypes": [
   {
     "name": "Ticket Name",
     "description": "Ticket description",
     "benefits": ["Benefit 1", "Benefit 2"],
     "price": 500
   }
 ],
 "suggestedImages": [
   {
     "description": "Image description",
     "prompt": "Detailed image generation prompt"
   }
 ]
}

Make sure the content is professional, engaging, and appropriate for the Ethiopian market. Include local cultural references where appropriate.
    `,
    imagePromptTemplate: ``,
  },

  // Content moderation
  moderation: {
    enabled: true,
    blockList: ["inappropriate", "offensive", "explicit", "violent", "illegal"],
    moderatePrompts: true,
    moderateResponses: true,
  },
}
