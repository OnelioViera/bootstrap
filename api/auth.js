// GitHub OAuth - Step 1: Redirect to GitHub
export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liM1wvUB1m7FGUmt';
  const redirectUri = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/callback`;
  const scope = 'repo,user';
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
  
  res.redirect(302, authUrl);
}

