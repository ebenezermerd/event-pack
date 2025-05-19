// test-image-generation.js
require('dotenv').config();
const aiService = require('./services/ai-service');

// Mock user object
const mockUser = {
  id: 'test-user-id',
  subscription: 'free'
};

// Test parameters
const testParams = {
  prompt: "A professional tech conference in Addis Ababa with Ethiopian entrepreneurs networking",
  eventType: 'conference',
  size: "1024x1024",
  additionalDetails: "Include elements of Ethiopian culture and modern technology"
};

// Test image generation
async function testImageGeneration() {
  console.log('Testing image generation...');
  console.log('Parameters:', JSON.stringify(testParams, null, 2));
  
  try {
    // Generate image
    const result = await aiService.generateEventImage(testParams, mockUser);
    
    console.log('\nSuccess! Generated image URL:');
    console.log(result.imageUrl);
    
    return result;
  } catch (error) {
    console.error('\nError generating image:');
    console.error(error.message);
    
    if (error.logId) {
      console.log(`Log ID: ${error.logId}`);
    }
    
    throw error;
  }
}

// Run the test
testImageGeneration()
  .then(() => {
    console.log('\nTest completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\nTest failed:', err);
    process.exit(1);
  }); 