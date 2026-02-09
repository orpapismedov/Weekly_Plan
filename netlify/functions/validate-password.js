// This function runs on Netlify's servers (backend)
// Password is stored as environment variable, never exposed to users

exports.handler = async (event, context) => {
  // CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get the password from request body
    const { password } = JSON.parse(event.body);
    
    // Get the correct password from environment variable (set in Netlify dashboard)
    const CORRECT_PASSWORD = process.env.MANAGER_PASSWORD || 'weekly';
    
    // Compare passwords
    if (password === CORRECT_PASSWORD) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          valid: true,
          message: 'Password correct' 
        })
      };
    } else {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          valid: false,
          message: 'Incorrect password' 
        })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
