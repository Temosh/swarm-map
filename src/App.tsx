import { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import Login from './Login';
import Home from './Home';

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('foursquare_access_token')
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && !accessToken) {
      const exchangeCodeForToken = async () => {
        try {
          const clientId = import.meta.env.VITE_FOURSQUARE_CLIENT_ID;
          const clientSecret = import.meta.env.VITE_FOURSQUARE_CLIENT_SECRET;
          const redirectUri = window.location.origin;

          const response = await fetch('/oauth2/access_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: 'authorization_code',
              redirect_uri: redirectUri,
              code: code,
            }).toString(),
          });

          if (!response.ok) {
            throw new Error(`Failed to exchange code for token: ${response.statusText}`);
          }

          const data = await response.json();
          if (data.access_token) {
            localStorage.setItem('foursquare_access_token', data.access_token);
            setAccessToken(data.access_token);
            // Only replace state after successful token acquisition
            window.history.replaceState({}, document.title, '/');
          } else {
            throw new Error('Access token not found in response.');
          }
        } catch (error) {
          console.error('Error exchanging code for token:', error);
          localStorage.removeItem('foursquare_access_token');
          setAccessToken(null);
          window.history.replaceState({}, document.title, '/'); // Clear code even on error
        }
      };
      exchangeCodeForToken();
    }
  }, [accessToken]); // Keep accessToken in dependency array to re-run if it changes

  return (
    <Container>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        {accessToken ? <Home /> : <Login />}
      </Box>
    </Container>
  );
}

export default App;
