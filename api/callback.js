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

    const token = data.access_token;

    // Return HTML that posts the token back to the CMS (Netlify CMS / Decap / Sveltia format)
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authorization Complete</title>
</head>
<body>
  <p>Authorization successful! This window will close automatically...</p>
  <script>
    (function() {
      const token = "${token}";
      const provider = "github";
      
      // Try multiple message formats for compatibility
      const message = "authorization:" + provider + ":success:" + JSON.stringify({
        token: token,
        provider: provider
      });
      
      // Send to opener (popup flow)
      if (window.opener) {
        window.opener.postMessage(message, "*");
        setTimeout(function() {
          window.close();
        }, 1000);
      } else {
        // If no opener, store token and redirect
        localStorage.setItem("netlify-cms-user", JSON.stringify({
          token: token,
          provider: provider
        }));
        localStorage.setItem("sveltia-cms-user", JSON.stringify({
          token: token,
          provider: provider,
          backendName: "github"
        }));
        window.location.href = "/admin/";
      }
    })();
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('Authentication failed: ' + error.message);
  }
}
