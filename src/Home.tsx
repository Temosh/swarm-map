import { useState, useEffect, useCallback } from 'react';
import { Typography, CircularProgress, Box, Alert } from '@mui/material';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { fetchCheckins } from './api';

interface Checkin {
  id: string;
  venue: {
    name: string;
    location: {
      lat: number;
      lng: number;
      formattedAddress: string[];
    };
  };
  createdAt: number;
}

const containerStyle = {
  width: '100%',
  height: '80%',
};

const center = {
  lat: 0,
  lng: 0,
};

const Home = () => {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = localStorage.getItem('foursquare_access_token');
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  useEffect(() => {
    const getCheckins = async () => {
      if (!accessToken) {
        setError('Access token not found.');
        setLoading(false);
        return;
      }
      try {
        const data = await fetchCheckins(accessToken);
        setCheckins(data);
      } catch (err) {
        setError('Failed to fetch check-ins.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getCheckins();
  }, [accessToken]);

  if (loading || !isLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || loadError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{error || loadError?.message}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Your Swarm Check-ins
      </Typography>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={2}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {checkins.map((checkin) => (
          checkin.venue?.location?.lat && checkin.venue?.location?.lng ? (
            <Marker
              key={checkin.id}
              position={{ lat: checkin.venue.location.lat, lng: checkin.venue.location.lng }}
            />
          ) : null
        ))}
      </GoogleMap>
    </Box>
  );
};

export default Home;
