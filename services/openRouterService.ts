import { Model, ModelResponse } from '../types';

const API_URL = 'https://openrouter.ai/api/v1/models';

export const fetchModels = async (): Promise<Model[]> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Use the API key if provided in the environment, though public models endpoint is often open.
    // Ideally this comes from process.env.OPENROUTER_API_KEY
    if (typeof process !== 'undefined' && process.env.OPENROUTER_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.OPENROUTER_API_KEY}`;
    }

    const response = await fetch(API_URL, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const json: ModelResponse = await response.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching OpenRouter models:", error);
    throw error;
  }
};
