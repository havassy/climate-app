exports.handler = async (event, context) => {
  console.log('Proxy function called:', event.queryStringParameters);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { url, token } = event.queryStringParameters;
    
    if (!url || !token) {
      console.log('Missing parameters:', { url: !!url, token: !!token });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL és token kötelező' })
      };
    }

    const apiUrl = decodeURIComponent(url);
    console.log('Making request to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'token': token
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      throw new Error(`NOAA API hiba: ${response.status} - ${errorText}`);
    }

    let data;
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    console.log('Response data type:', typeof data);
    console.log('Response data preview:', JSON.stringify(data).substring(0, 200));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        data: data 
      })
    };

  } catch (error) {
    console.error('Proxy error details:', error.message);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Proxy hiba: ' + error.message 
      })
    };
  }
};
