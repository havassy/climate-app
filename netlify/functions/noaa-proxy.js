exports.handler = async (event, context) => {
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
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL és token kötelező' })
      };
    }

    const apiUrl = decodeURIComponent(url);
    
    const response = await fetch(apiUrl, {
      headers: {
        'token': token
      }
    });

    if (!response.ok) {
      throw new Error(`NOAA API hiba: ${response.status}`);
    }

    let data;
try {
  data = await response.json(); // JSON-ként próbáljuk
} catch (e) {
  data = await response.text(); // Ha nem JSON, akkor text
}

return {
  statusCode: 200,
  headers,
  body: JSON.stringify({ 
    success: true, 
    data: data 
  })
};

  } catch (error) {
    console.error('Proxy error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Proxy hiba: ' + error.message 
      })
    };
  }
};
