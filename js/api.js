/**
 * Gemini API Integration
 * Handles communication with Google's Gemini AI API
 */

const API_CONFIG = {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    model: 'gemini-2.5-flash',
    maxTokens: 2048,
    temperature: 0.8
};

/**
 * Storage key for API key
 */
const API_KEY_STORAGE = 'notable_dinner_guests_api_key';

/**
 * Save API key to local storage
 * @param {string} apiKey - The Gemini API key
 */
function saveApiKey(apiKey) {
    localStorage.setItem(API_KEY_STORAGE, apiKey);
}

/**
 * Get API key from local storage
 * @returns {string|null} The stored API key or null
 */
function getApiKey() {
    return localStorage.getItem(API_KEY_STORAGE);
}

/**
 * Check if API key is set
 * @returns {boolean} True if API key exists
 */
function hasApiKey() {
    const key = getApiKey();
    return key !== null && key.trim() !== '';
}

/**
 * Clear stored API key
 */
function clearApiKey() {
    localStorage.removeItem(API_KEY_STORAGE);
}

/**
 * Generate conversation using Gemini API
 * @param {string} prompt - The conversation prompt
 * @returns {Promise<string>} The generated conversation text
 * @throws {Error} If API call fails
 */
async function generateConversation(prompt) {
    const apiKey = getApiKey();

    if (!apiKey) {
        throw new Error('No API key found. Please set your Gemini API key.');
    }

    const url = `${API_CONFIG.baseUrl}/${API_CONFIG.model}:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: API_CONFIG.temperature,
            maxOutputTokens: API_CONFIG.maxTokens,
            topP: 0.95,
            topK: 40
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_ONLY_HIGH"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_ONLY_HIGH"
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_ONLY_HIGH"
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_ONLY_HIGH"
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 400) {
                throw new Error('Invalid API key. Please check your Gemini API key and try again.');
            } else if (response.status === 403) {
                throw new Error('API key does not have permission. Please ensure your API key is valid.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a moment and try again.');
            } else {
                throw new Error(errorData.error?.message || `API error: ${response.status}`);
            }
        }

        const data = await response.json();

        // Check if we got a valid response
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('No response generated. The content may have been filtered.');
        }

        const candidate = data.candidates[0];

        // Check for content filtering
        if (candidate.finishReason === 'SAFETY') {
            throw new Error('Response was filtered for safety. Try a different topic.');
        }

        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
            throw new Error('Empty response received from API.');
        }

        return candidate.content.parts[0].text;

    } catch (error) {
        // Re-throw if it's already a formatted error
        if (error.message.includes('API key') ||
            error.message.includes('Rate limit') ||
            error.message.includes('filtered')) {
            throw error;
        }

        // Network or other errors
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('Network error. Please check your internet connection.');
        }

        throw new Error(`Failed to generate conversation: ${error.message}`);
    }
}

/**
 * Test API key validity
 * @param {string} apiKey - The API key to test
 * @returns {Promise<{valid: boolean, error?: string}>} Result object
 */
async function testApiKey(apiKey) {
    const url = `${API_CONFIG.baseUrl}/${API_CONFIG.model}:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: 'Say "Hello" and nothing else.'
            }]
        }],
        generationConfig: {
            maxOutputTokens: 10
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            return { valid: true };
        } else {
            const errorData = await response.json().catch(() => ({}));
            return {
                valid: false,
                error: errorData.error?.message || `Error ${response.status}`
            };
        }
    } catch (error) {
        // Check if this is a CORS/network error from file:// protocol
        if (window.location.protocol === 'file:') {
            return {
                valid: false,
                error: 'CORS_FILE_PROTOCOL'
            };
        }
        return {
            valid: false,
            error: error.message
        };
    }
}
