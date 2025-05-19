// test-ai-service.js
require('dotenv').config();
const aiService = require('./services/ai-service');

// Mock user object
const mockUser = {
  id: 'test-user-id',
  subscription: 'free'
};

// Test parameters
const testParams = {
  eventType: 'conference',
  topic: 'Technology and Innovation',
  location: 'Addis Ababa',
  targetAudience: 'Entrepreneurs and Tech Professionals'
};

// Test event generation
async function testEventGeneration() {
  console.log('Testing event generation...');
  console.log('Parameters:', JSON.stringify(testParams, null, 2));
  
  try {
    // Generate event content
    const result = await aiService.generateEventContent(testParams, mockUser);
    
    console.log('\nSuccess! Generated event content:');
    console.log(JSON.stringify(result.eventTemplate, null, 2));
    
    return result;
  } catch (error) {
    console.error('\nError generating event content:');
    console.error(error.message);
    
    if (error.logId) {
      console.log(`Log ID: ${error.logId}`);
    }
    
    throw error;
  }
}

// Run the test
testEventGeneration()
  .then(() => {
    console.log('\nTest completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\nTest failed:', err);
    process.exit(1);
  }); 