// test-gemini.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Function to test different models
async function testGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY not found in environment variables!");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro-001",
    "gemini-1.5-pro-002"
  ];

  console.log("Testing Gemini Models...");
  
  for (const modelName of models) {
    console.log(`\nTesting model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const prompt = "Generate a short event description for a tech conference";
      console.log(`Sending prompt: "${prompt}"`);
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 200,
        },
      });

      const response = result.response;
      console.log(`\nSuccess! Response: ${response.text().substring(0, 200)}...`);
    } catch (error) {
      console.error(`Error with model ${modelName}:`, error.message);
    }
  }
}

// Run the test
testGeminiModels()
  .then(() => console.log("Testing complete!"))
  .catch(err => console.error("Fatal error:", err)); 