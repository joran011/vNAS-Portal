const express = require('express');
const session = require('express-session');
const axios = require('axios');
const app = express();

const CLIENT_ID = '1208502827920531586';
const CLIENT_SECRET = 'SRwpQt3pRMQNQLZAIZdFF1ky2Jjve7tW';
const REDIRECT_URI = 'http://localhost:3000/callback';

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static('.')); // server HTML

app.get('/login', (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  const token = await axios.post('https://discord.com/api/oauth2/token',
    new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const user = await axios.get('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${token.data.access_token}` }
  });

  req.session.user = user.data;

  res.send("Logged in as " + user.data.username);
});

app.listen(3000, () => console.log("Running on http://localhost:3000"));
