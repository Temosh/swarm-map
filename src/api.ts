const FOURSQUARE_API_BASE_URL = '/api/v2'; // Use the proxy endpoint

export const fetchCheckins = async (accessToken: string) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const vParam = `${year}${month}${day}`;

  let allCheckins: any[] = [];
  let offset = 0;
  const limit = 250; // Max limit per request for Foursquare API
  const maxCheckinsToFetch = 6000; // A reasonable upper limit to prevent infinite loops

  while (true) {
    const response = await fetch(
      `${FOURSQUARE_API_BASE_URL}/users/self/checkins?v=${vParam}&limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      console.error('API Response not OK:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Foursquare API response data:', data); // Log the full response data

    // Check if the expected path exists
    if (!data || !data.response || !data.response.checkins || !data.response.checkins.items) {
      console.error('Unexpected API response structure:', data);
      throw new Error('Unexpected API response structure for checkins.');
    }

    const currentCheckins = data.response.checkins.items;
    const totalCount = data.response.checkins.count; // Total count of checkins

    allCheckins = allCheckins.concat(currentCheckins);

    // Break loop if no more checkins or if we've fetched all available
    if (
      currentCheckins.length < limit ||
      allCheckins.length >= totalCount ||
      allCheckins.length >= maxCheckinsToFetch
    ) {
      break;
    }

    offset += limit;
  }

  return allCheckins;
};
