import { Button, Alert, Box } from '@mui/material';
import { useState } from 'react';

const Login = () => {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    const clientId = import.meta.env.VITE_FOURSQUARE_CLIENT_ID;
    const redirectUri = window.location.origin;

    if (!clientId) {
      setError('Foursquare Client ID is missing. Please add VITE_FOURSQUARE_CLIENT_ID to your .env file.');
      return;
    }

    const authUrl = `https://foursquare.com/oauth2/authenticate?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Button variant="contained" onClick={handleLogin}>
        Login with Foursquare
      </Button>
    </Box>
  );
};

export default Login;
