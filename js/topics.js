/**
 * Conversation Topics
 * Predefined topics that work well for diverse historical figure discussions
 */

const TOPICS = [
    {
        id: 'meaning',
        label: 'The Meaning of Life',
        prompt: 'the meaning and purpose of life'
    },
    {
        id: 'creativity',
        label: 'Creativity',
        prompt: 'creativity, inspiration, and the creative process'
    },
    {
        id: 'death',
        label: 'Death & Legacy',
        prompt: 'death, mortality, and what legacy we leave behind'
    },
    {
        id: 'happiness',
        label: 'Happiness',
        prompt: 'happiness, contentment, and what makes a good life'
    },
    {
        id: 'truth',
        label: 'Truth & Knowledge',
        prompt: 'truth, knowledge, and how we know what we know'
    },
    {
        id: 'freedom',
        label: 'Freedom',
        prompt: 'freedom, liberty, and individual autonomy'
    },
    {
        id: 'nature',
        label: 'Nature & Universe',
        prompt: 'nature, the cosmos, and humanity\'s place in the universe'
    },
    {
        id: 'suffering',
        label: 'Suffering',
        prompt: 'suffering, adversity, and how we grow through difficulty'
    },
    {
        id: 'love',
        label: 'Love',
        prompt: 'love in its many forms—romantic, familial, universal'
    },
    {
        id: 'consciousness',
        label: 'Consciousness',
        prompt: 'consciousness, the mind, and altered states of awareness'
    },
    {
        id: 'society',
        label: 'Society & Progress',
        prompt: 'society, human progress, and civilization'
    },
    {
        id: 'wisdom',
        label: 'Wisdom',
        prompt: 'wisdom, learning, and the lessons of experience'
    }
];

/**
 * Get all topics
 * @returns {Array} Array of topic objects
 */
function getAllTopics() {
    return TOPICS;
}

/**
 * Get a topic by ID
 * @param {string} id - The topic ID
 * @returns {Object|undefined} The topic object or undefined
 */
function getTopicById(id) {
    return TOPICS.find(topic => topic.id === id);
}

/**
 * Build a conversation prompt based on selected guests and topic
 * @param {Array} guests - Array of guest objects
 * @param {string} topicPrompt - The topic description or custom topic
 * @returns {string} The full prompt for the AI
 */
function buildConversationPrompt(guests, topicPrompt) {
    const guestDescriptions = guests.map(guest => {
        return `- ${guest.name} (${guest.era}): ${guest.context}`;
    }).join('\n\n');

    const guestNames = guests.map(g => g.name).join(', ');

    return `You are simulating a dinner party conversation between these historical figures:

${guestDescriptions}

TOPIC: They are discussing ${topicPrompt}.

IMPORTANT INSTRUCTIONS:
1. Generate a natural, flowing dinner conversation between these specific individuals.
2. Each person should speak in their authentic voice, reflecting their known views, writing style, and personality.
3. They should reference their actual works, ideas, and experiences where relevant.
4. Include moments of agreement, respectful disagreement, building on each other's ideas, and genuine curiosity.
5. Make it feel like a real conversation—people can interrupt, ask questions, make jokes, or share anecdotes.
6. Each person should speak 2-4 times throughout the conversation.
7. Keep the total conversation between 800-1200 words.
8. Do not include any narration or stage directions—only dialogue.
9. Format each speaker's turn as: **[Name]:** "Their dialogue here."

Begin the dinner conversation now. Have someone naturally open the discussion on ${topicPrompt}.`;
}

/**
 * Build an enhanced conversation prompt with source material
 * @param {Array} guests - Array of guest objects
 * @param {string} topicPrompt - The topic description or custom topic
 * @param {Map} sourceMaterial - Map of guest ID to source material
 * @returns {string} The full enhanced prompt for the AI
 */
function buildEnhancedConversationPrompt(guests, topicPrompt, sourceMaterial) {
    // Build guest descriptions with source material
    const guestDescriptions = guests.map(guest => {
        const material = sourceMaterial.get(guest.id) || {};
        let description = `- ${guest.name} (${guest.era}): ${guest.context}`;

        // Add verified quotes
        if (material.quotes && material.quotes.length > 0) {
            description += `\n  VERIFIED QUOTES from ${guest.name}:`;
            material.quotes.slice(0, 3).forEach(quote => {
                description += `\n  • "${quote}"`;
            });
        }

        // Add known works
        if (material.works && material.works.length > 0) {
            description += `\n  NOTABLE WORKS: ${material.works.join(', ')}`;
        }

        // Add text excerpt for public domain authors
        if (material.excerpt) {
            description += `\n  EXCERPT from "${material.excerpt.title}":\n  "${material.excerpt.excerpt.substring(0, 500)}..."`;
        }

        return description;
    }).join('\n\n');

    return `You are simulating a dinner party conversation between these historical figures.

IMPORTANT: Use the VERIFIED QUOTES, NOTABLE WORKS, and EXCERPTS provided below. These are real, documented sources. Incorporate them naturally into the conversation—have characters quote themselves, reference their works, or allude to ideas from the excerpts.

PARTICIPANTS AND SOURCE MATERIAL:

${guestDescriptions}

TOPIC: They are discussing ${topicPrompt}.

INSTRUCTIONS:
1. Generate a natural, flowing dinner conversation between these specific individuals.
2. Each person MUST speak in their authentic voice, reflecting their known views and personality.
3. INCORPORATE the verified quotes and references to their actual works naturally in dialogue.
4. When a character has verified quotes provided, have them USE or PARAPHRASE those actual quotes.
5. Reference specific book titles, essays, or works when relevant.
6. Include moments of agreement, respectful disagreement, building on each other's ideas, and genuine curiosity.
7. Make it feel like a real conversation—people can interrupt, ask questions, make jokes, or share anecdotes.
8. Each person should speak 2-4 times throughout the conversation.
9. Keep the total conversation between 800-1200 words.
10. Do not include any narration or stage directions—only dialogue.
11. Format each speaker's turn as: **[Name]:** "Their dialogue here."

Begin the dinner conversation now. Have someone naturally open the discussion on ${topicPrompt}.`;
}
