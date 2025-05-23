// JavaScript script to register an organizer
// Usage: node register-organizer.js

const axios = require('axios');

// Configuration
const apiUrl = 'http://localhost:3000/api/auth/organizer/register';
const organizerData = {
  name: 'John Doe',
  email: 'john.organizer@example.com',
  password: 'Password123!',
  phone: '+251912345678',
  role: 'organizer',
  companyName: 'EventPro Solutions',
  description: 'Professional event planning and management services',
  tinNumber: '1234567890',
  address: 'Main Street',
  region: 'Addis Ababa'
};

// Function to register the organizer
async function registerOrganizer() {
  console.log('Registering organizer...');
  
  try {
    const response = await axios.post(apiUrl, organizerData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\x1b[32m%s\x1b[0m', 'Registration successful!');
    console.log('User ID:', response.data.user.id);
    console.log('Name:', response.data.user.name);
    console.log('Email:', response.data.user.email);
    console.log('Role:', response.data.user.role);
    
    if (response.data.organizer) {
      console.log('Company Name:', response.data.organizer.companyName);
      console.log('Approval Status:', response.data.organizer.approvalStatus);
    }
    
    console.log('Token:', response.data.token);
    return response.data;
  } catch (error) {
    console.log('\x1b[31m%s\x1b[0m', 'Registration failed!');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('Status Code:', error.response.status);
      console.log('Error:', error.response.data.message || error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.log('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error:', error.message);
    }
    
    return null;
  }
}

// Call the function
registerOrganizer().catch(console.error); 