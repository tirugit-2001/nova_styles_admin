/**
 * Script to create a new admin user
 * Usage: node scripts/create-user.js
 * 
 * This script creates a user with:
 * - Email: NovaAdmin@nova.com
 * - Password: nova123
 * 
 * Login Credentials:
 * - Username/Email: NovaAdmin@nova.com
 * - Password: nova123
 */

import axios from 'axios';

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:8500';

const createAdminUser = async () => {
  // User credentials
  // Note: Backend requires email format (with @ and domain)
  const userData = {
    email: 'NovaAdmin@nova.com', // Email format required by backend
    password: 'nova123'
  };

  try {
    console.log('Creating admin user...');
    console.log('Email:', userData.email);
    console.log('Password:', userData.password);
    console.log('Backend URL:', BACKEND_URL);
    console.log('');

    const response = await axios.post(
      `${BACKEND_URL}/api/v1/auth/create-admin`,
      userData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        // Note: withCredentials might be needed if backend requires auth
        // Uncomment if you get authentication errors
        // withCredentials: true,
      }
    );

    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error creating user:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      console.error('Make sure the backend is running on', BACKEND_URL);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  }
};

createAdminUser();

