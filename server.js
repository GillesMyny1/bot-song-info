const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
const port = 3001;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

let accessToken = '';
let refreshToken = '';
let tokenExpiry = 0;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
  const scopes = 'user-read-playback-state';
  const spotifyAuthUrl = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scopes,
      redirect_uri: REDIRECT_URI,
    });
  res.redirect(spotifyAuthUrl);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  if (!code) {
    return res.send('No code provided');
  }

  try {
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token: newRefreshToken, expires_in } = tokenResponse.data;
    accessToken = access_token;
    refreshToken = newRefreshToken;
    tokenExpiry = Date.now() + (expires_in * 1000);

    console.log('Access token acquired:', accessToken);

    res.redirect('/');
  } catch (error) {
    console.error('Error exchanging code for tokens:', error.response ? error.response.data : error.message);
    res.send('Error retrieving tokens');
  }
});

app.get('/refresh_token', async (req, res) => {
  try {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, expires_in } = tokenResponse.data;
    accessToken = access_token;
    tokenExpiry = Date.now() + (expires_in * 1000);

    console.log('Access token refreshed:', accessToken);

    res.json({ access_token, expires_in });
  } catch (error) {
    console.error('Error refreshing token:', error.response ? error.response.data : error.message);
    res.send('Error refreshing token');
  }
});

// Middleware to check token expiry and refresh if needed
app.use(async (req, res, next) => {
  if (Date.now() > tokenExpiry - 60 * 1000) { // Refresh 1 minute before expiry
    try {
      await refreshAccessToken();
    } catch (error) {
      console.error('Error refreshing token in middleware:', error.message);
    }
  }
  next();
});

async function refreshAccessToken() {
  try {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, expires_in } = tokenResponse.data;
    accessToken = access_token;
    tokenExpiry = Date.now() + (expires_in * 1000);

    console.log('Access token refreshed:', accessToken);
  } catch (error) {
    console.error('Error refreshing token:', error.response ? error.response.data : error.message);
  }
}

async function getTrackInfo() {
    if (!accessToken) {
      throw new Error('Access token not available');
    }
  
    try {
      // Spotify API call gets currently playing song
      const playbackStateResponse = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
  
      if (playbackStateResponse.data && playbackStateResponse.data.item) {
        const songArt = playbackStateResponse.data.item.album.images[0].url || '';
        const songName = playbackStateResponse.data.item.name || 'Song not currently playing';
        const artistName = playbackStateResponse.data.item.artists.map(artist => artist.name).join(', ') || '...';
  
        console.log('Song art:', songArt);
        console.log('Song name:', songName);
        console.log('Song artist:', artistName);
        return [songArt, songName, artistName];
      } else {
        throw new Error('No song currently playing');
      }
    } catch (error) {
      console.error('Error fetching song info:', error.response ? error.response.data : error.message);
      throw new Error('Failed to fetch song info');
    }
  }
  
app.get('/info', async (req, res) => {
    try {
        const [songArt, songName, artistName] = await getTrackInfo();
        res.json({
            art: songArt,
            name: songName,
            artist: artistName
        });
    } catch (error) {
        console.error('Error in /info:', error.message);
        res.status(500).send('Error fetching song info');
    }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});