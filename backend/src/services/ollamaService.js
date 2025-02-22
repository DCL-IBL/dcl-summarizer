const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

exports.processText = async (text) => {
  try {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'llama2',
      prompt: text
    });
    return response.data.response;
  } catch (error) {
    throw new Error('Error processing text with Ollama');
  }
};
