// GitHub OAuth - Step 2: Exchange code for token
export default async function handler(req, res) {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('Missing code parameter');
  }

  const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liM1wvUB1m7FGUmt';
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientSecret) {
    return res.status(500).send('GitHub Client Secret not configured. Add GITHUB_CLIENT_SECRET to Vercel environment variables.');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const data = await tokenResponse.json();

    if (data.error) {
      return res.status(400).send(`Error: ${data.error_description || data.error}`);
    }

    // Return HTML that posts the token back to the CMS
    const script = `
      <script>
        (function() {
          function receiveMessage(e) {
            console.log("receiveMessage %o", e);
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify({ token: data.access_token, provider: 'github' })}',
              e.origin
            );
            window.removeEventListener("message", receiveMessage, false);
          }
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        })();
      </script>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html><html><head><title>Authorizing...</title></head><body>${script}<p>Authorizing, please wait...</p></body></html>`);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('Authentication failed');
  }
}

