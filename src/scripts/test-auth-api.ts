import fetch from 'node-fetch';

// Base URL for the API
const API_BASE_URL = 'http://localhost:3000/api';

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'Password123!',
  fullName: 'Test User',
  phoneNumber: '1234567890',
  birthDate: 15,
  birthMonth: 5,
  gender: 'male'
};

let verificationToken = '';

/**
 * Test the user registration endpoint
 */
async function testRegistration() {
  console.log('\n===== Testing User Registration =====');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful');
      console.log('Response:', JSON.stringify(data, null, 2));
      
      // If we have a verification token in a real scenario, we'd extract it from the email
      // For testing, we'd have to check the logs or database
      console.log('Please check the logs for the verification token or extract it from the database');
    } else {
      console.error('❌ Registration failed with status:', response.status);
      console.error('Error:', JSON.stringify(data, null, 2));
    }
    
    return response.ok;
  } catch (error) {
    console.error('❌ Error during registration test:', error);
    return false;
  }
}

/**
 * Test the login endpoint
 */
async function testLogin() {
  console.log('\n===== Testing User Login =====');
  
  // In a real test, the user would be verified first
  console.log('Note: In a real scenario, the user needs to be verified before login');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Login failed with status:', response.status);
      console.error('Error:', JSON.stringify(data, null, 2));
    }
    
    return response.ok;
  } catch (error) {
    console.error('❌ Error during login test:', error);
    return false;
  }
}

/**
 * Test the password reset request endpoint
 */
async function testPasswordResetRequest() {
  console.log('\n===== Testing Password Reset Request =====');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testUser.email
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Password reset request successful');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Password reset request failed with status:', response.status);
      console.error('Error:', JSON.stringify(data, null, 2));
    }
    
    return response.ok;
  } catch (error) {
    console.error('❌ Error during password reset request test:', error);
    return false;
  }
}

/**
 * Run all tests sequentially
 */
async function runAllTests() {
  console.log('🚀 Starting API tests...');
  
  // Test registration first
  const registrationSuccess = await testRegistration();
  
  // Only proceed with other tests if registration was successful
  if (registrationSuccess) {
    // In a real test, we'd need to verify the user first
    // For now, we'll just show what would happen if we tried to login
    await testLogin();
    
    // Test password reset request
    await testPasswordResetRequest();
  }
  
  console.log('\n🏁 API tests completed');
}

// Run all tests
runAllTests();
