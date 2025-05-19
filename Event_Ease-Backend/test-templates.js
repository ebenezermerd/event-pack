// test-templates.js
require('dotenv').config();
const aiService = require('./services/ai-service');

// Mock user object
const mockUser = {
  id: 'test-user-id',
  subscription: 'free'
};

// Sample event template
const sampleTemplate = {
  title: "Ethiopia Tech Summit 2025",
  caption: "Shaping the future of Ethiopian technology",
  description: "Join us for the premier technology conference in Addis Ababa.",
  longDescription: "The Ethiopia Tech Summit is the country's leading technology conference, bringing together innovators, entrepreneurs, and industry leaders.",
  schedule: [
    {
      time: "9:00 AM - 10:00 AM",
      title: "Opening Keynote",
      description: "Welcome address and vision for the future of tech in Ethiopia"
    },
    {
      time: "10:30 AM - 12:00 PM",
      title: "Panel Discussion",
      description: "Industry leaders discuss emerging technologies and market trends"
    }
  ],
  faqs: [
    {
      question: "Who should attend?",
      answer: "Tech professionals, entrepreneurs, investors, and anyone interested in technology"
    }
  ]
};

// Test saving a template
async function testSaveTemplate() {
  console.log('Testing template saving...');
  
  const templateData = {
    name: "Tech Summit Template",
    eventType: "conference",
    template: sampleTemplate
  };
  
  try {
    // Save template
    const result = await aiService.saveEventTemplate(templateData, mockUser);
    
    console.log('\nSuccess! Template saved:');
    console.log(`Template ID: ${result.templateId}`);
    
    return result.templateId;
  } catch (error) {
    console.error('\nError saving template:');
    console.error(error.message);
    throw error;
  }
}

// Test retrieving templates
async function testGetTemplates() {
  console.log('\nTesting template retrieval...');
  
  try {
    // Get templates
    const result = await aiService.getEventTemplates(mockUser);
    
    console.log('\nSuccess! Templates retrieved:');
    console.log(JSON.stringify(result.templates, null, 2));
    
    return result.templates;
  } catch (error) {
    console.error('\nError retrieving templates:');
    console.error(error.message);
    throw error;
  }
}

// Test retrieving a specific template
async function testGetTemplateById(templateId) {
  console.log(`\nTesting template retrieval by ID: ${templateId}`);
  
  try {
    // Get template by ID
    const result = await aiService.getEventTemplateById(templateId, mockUser);
    
    console.log('\nSuccess! Template retrieved:');
    console.log(JSON.stringify(result.template, null, 2));
    
    return result.template;
  } catch (error) {
    console.error('\nError retrieving template:');
    console.error(error.message);
    throw error;
  }
}

// Run all tests in sequence
async function runTests() {
  try {
    // Save a template
    const templateId = await testSaveTemplate();
    
    // Get all templates
    await testGetTemplates();
    
    // Get template by ID
    if (templateId) {
      await testGetTemplateById(templateId);
    }
    
    console.log('\nAll tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\nTests failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests(); 