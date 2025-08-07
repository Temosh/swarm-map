import { useState, useEffect, useMemo } from 'react';
import { Typography, CircularProgress, Box, Alert } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchCheckins } from './api';
import L from 'leaflet';
// import LocationOnIcon from '@mui/icons-material/LocationOn'; // No longer needed for this approach
import { getCachedCheckins, saveCheckins } from './cache';

interface Checkin {
  id: string;
  venue: {
    name: string;
    location: {
      lat: number;
      lng: number;
      formattedAddress?: string[];
    };
  };
  createdAt: number;
}

// Path for LocationOnIcon from Material-UI source
const LOCATION_ON_SVG_PATH =
  'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z';

const Home = () => {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = localStorage.getItem('foursquare_access_token');

  // Create a custom icon using MUI LocationOnIcon SVG path, memoized
  const customIcon = useMemo(() => {
    const iconHtml = `<svg viewBox="0 0 24 24" style="color: red; font-size: 30px;"><path d="${LOCATION_ON_SVG_PATH}"></path></svg>`;
    return L.divIcon({
      html: iconHtml,
      className: 'custom-leaflet-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });
  }, []); // Empty dependency array means it's created once

  useEffect(() => {
    const getCheckins = async () => {
      if (!accessToken) {
        setError('Access token not found.');
        setLoading(false);
        return;
      }

      const cachedData = await getCachedCheckins();
      if (cachedData && cachedData.length > 0) {
        setCheckins(cachedData);
        setLoading(false);
        console.log('Loaded checkins from IndexedDB:', cachedData.length, 'items');
        return;
      }

      try {
        const data = await fetchCheckins(accessToken);
        setCheckins(data);
        await saveCheckins(data);
        console.log('Fetched checkins from API and saved to IndexedDB:', data.length, 'items');
      } catch (err) {
        setError('Failed to fetch check-ins.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getCheckins();
  }, [accessToken]);

  useEffect(() => {
    // Log checkins data and count valid coordinates after state update
    if (checkins.length > 0) {
      console.log('Current checkins state:', checkins);
      const validCheckinsCount = checkins.filter(
        (c) => c.venue?.location?.lat && c.venue?.location?.lng,
      ).length;
      console.log(
        `Number of checkins with valid coordinates: ${validCheckinsCount} out of ${checkins.length}`,
      );
    }
  }, [checkins]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Calculate map center if checkins are available
  const mapCenter =
    checkins.length > 0
      ? [
          checkins.reduce((sum, c) => sum + (c.venue?.location?.lat || 0), 0) / checkins.length,
          checkins.reduce((sum, c) => sum + (c.venue?.location?.lng || 0), 0) / checkins.length,
        ]
      : [0, 0];

  return (
    <Box sx={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>
        Your Swarm Check-ins
      </Typography>
      <MapContainer
        center={mapCenter as L.LatLngExpression}
        zoom={2}
        style={{ flexGrow: 1, width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {checkins.map((checkin) =>
          checkin.venue?.location?.lat && checkin.venue?.location?.lng ? (
            <Marker
              key={checkin.id}
              position={[checkin.venue.location.lat, checkin.venue.location.lng]}
              icon={customIcon}
            >
              <Popup>
                <strong>{checkin.venue.name}</strong>
                <br />
                {checkin.venue.location.formattedAddress?.join(', ') || 'N/A'}
                <br />
                {new Date(checkin.createdAt * 1000).toLocaleString()}
              </Popup>
            </Marker>
          ) : null,
        )}
      </MapContainer>
    </Box>
  );
};

export default Home;
