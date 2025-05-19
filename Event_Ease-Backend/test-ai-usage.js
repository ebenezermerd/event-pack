// test-ai-usage.js
require('dotenv').config();
const axios = require('axios');

// Test retrieving AI usage statistics
async function testAIUsageStats() {
  console.log('Testing AI usage statistics retrieval...');
  
  try {
    // Use our admin token to call the AI usage endpoint
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRjODk4MjFmLTUxMzYtNDJmMy1iMWI4LTRmYTVhYzkzNTQ5ZiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NzQyMjczMSwiZXhwIjoxNzQ3NTA5MTMxfQ.e4wrzqyZd4nOdRZifPtFLV6VSVOs9oJv3IwU6lcU0Jg';
    
    // Make the API call
    const response = await axios.get('http://localhost:3000/api/organizers/ai/usage', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\nSuccess! AI usage statistics retrieved:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('\nError retrieving AI usage statistics:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Test retrieving AI logs
async function testAILogs() {
  console.log('\nTesting AI logs retrieval...');
  
  try {
    // Use our admin token to call the AI logs endpoint
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRjODk4MjFmLTUxMzYtNDJmMy1iMWI4LTRmYTVhYzkzNTQ5ZiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NzQyMjczMSwiZXhwIjoxNzQ3NTA5MTMxfQ.e4wrzqyZd4nOdRZifPtFLV6VSVOs9oJv3IwU6lcU0Jg';
    
    // Make the API call
    const response = await axios.get('http://localhost:3000/api/organizers/ai/logs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\nSuccess! AI logs retrieved:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('\nError retrieving AI logs:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Run all tests in sequence
async function runTests() {
  try {
    // Test AI usage statistics
    await testAIUsageStats();
    
    // Test AI logs retrieval
    await testAILogs();
    
    console.log('\nAll tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\nTests failed!');
    process.exit(1);
  }
}

// Run the tests
runTests(); 