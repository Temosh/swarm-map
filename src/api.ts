const FOURSQUARE_API_BASE_URL = '/api/v2'; // Use the proxy endpoint

export const fetchCheckins = async (accessToken: string) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const vParam = `${year}${month}${day}`;

  const response = await fetch(
    `${FOURSQUARE_API_BASE_URL}/users/self/checkins?v=${vParam}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.response.checkins.items;
};
