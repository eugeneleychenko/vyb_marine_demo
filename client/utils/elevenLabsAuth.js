/**
 * Get a signed URL from the ElevenLabs API for authentication
 * @param {string} agentId - The ElevenLabs agent ID
 * @returns {Promise<string>} - A Promise that resolves to the signed URL
 */
export const getSignedUrl = async (agentId) => {
  const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

  if (!API_KEY) {
    throw new Error('ElevenLabs API key is not configured');
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get signed URL: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.signed_url;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
};

export default { getSignedUrl }; 