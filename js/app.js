/**
 * Notable Dinner Guests - Main Application
 * Handles UI interactions and orchestrates the conversation generation
 */

// Application State
const state = {
    selectedGuests: [],
    selectedTopic: null,
    customTopic: '',
    maxGuests: 5,
    minGuests: 2
};

// DOM Elements
const elements = {
    apiSetup: null,
    apiKeyInput: null,
    saveApiKeyBtn: null,
    mainApp: null,
    guestGrid: null,
    selectedCount: null,
    topicButtons: null,
    customTopicInput: null,
    generateBtn: null,
    conversationSection: null,
    conversationDisplay: null,
    newConversationBtn: null,
    settingsToggle: null,
    settingsModal: null,
    settingsApiKey: null,
    updateApiKeyBtn: null,
    closeSettingsBtn: null,
    loadingOverlay: null,
    // Custom guest elements
    addCustomGuestBtn: null,
    customGuestModal: null,
    customGuestForm: null,
    customGuestName: null,
    customGuestError: null,
    addGuestSubmitBtn: null,
    cancelCustomGuestBtn: null
};

/**
 * Initialize the application
 */
function init() {
    // Cache DOM elements
    cacheElements();

    // Set up event listeners
    setupEventListeners();

    // Check for existing API key
    if (hasApiKey()) {
        showMainApp();
    }

    // Render initial UI
    renderGuests();
    renderTopics();
}

/**
 * Cache DOM element references
 */
function cacheElements() {
    elements.apiSetup = document.getElementById('api-setup');
    elements.apiKeyInput = document.getElementById('api-key-input');
    elements.saveApiKeyBtn = document.getElementById('save-api-key');
    elements.mainApp = document.getElementById('main-app');
    elements.guestGrid = document.getElementById('guest-grid');
    elements.selectedCount = document.getElementById('selected-count');
    elements.topicButtons = document.getElementById('topic-buttons');
    elements.customTopicInput = document.getElementById('custom-topic');
    elements.generateBtn = document.getElementById('generate-btn');
    elements.conversationSection = document.getElementById('conversation-section');
    elements.conversationDisplay = document.getElementById('conversation-display');
    elements.newConversationBtn = document.getElementById('new-conversation-btn');
    elements.settingsToggle = document.getElementById('settings-toggle');
    elements.settingsModal = document.getElementById('settings-modal');
    elements.settingsApiKey = document.getElementById('settings-api-key');
    elements.updateApiKeyBtn = document.getElementById('update-api-key');
    elements.closeSettingsBtn = document.getElementById('close-settings');
    elements.loadingOverlay = document.getElementById('loading-overlay');
    // Custom guest elements
    elements.addCustomGuestBtn = document.getElementById('add-custom-guest-btn');
    elements.customGuestModal = document.getElementById('custom-guest-modal');
    elements.customGuestForm = document.getElementById('custom-guest-form');
    elements.customGuestName = document.getElementById('custom-guest-name');
    elements.customGuestError = document.getElementById('custom-guest-error');
    elements.addGuestSubmitBtn = document.getElementById('add-guest-submit');
    elements.cancelCustomGuestBtn = document.getElementById('cancel-custom-guest');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // API Key setup
    elements.saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
    elements.apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSaveApiKey();
    });

    // Topic selection
    elements.customTopicInput.addEventListener('input', handleCustomTopicInput);
    elements.customTopicInput.addEventListener('focus', () => {
        // Deselect preset topics when custom input is focused
        state.selectedTopic = null;
        renderTopics();
        updateGenerateButton();
    });

    // Generate button
    elements.generateBtn.addEventListener('click', handleGenerate);

    // New conversation button
    elements.newConversationBtn.addEventListener('click', handleNewConversation);

    // Settings
    elements.settingsToggle.addEventListener('click', openSettings);
    elements.closeSettingsBtn.addEventListener('click', closeSettings);
    elements.updateApiKeyBtn.addEventListener('click', handleUpdateApiKey);
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) closeSettings();
    });

    // Custom guest
    elements.addCustomGuestBtn.addEventListener('click', openCustomGuestModal);
    elements.cancelCustomGuestBtn.addEventListener('click', closeCustomGuestModal);
    elements.customGuestForm.addEventListener('submit', handleAddCustomGuest);
    elements.customGuestModal.addEventListener('click', (e) => {
        if (e.target === elements.customGuestModal) closeCustomGuestModal();
    });
}

/**
 * Show the main app and hide API setup
 */
function showMainApp() {
    elements.apiSetup.classList.add('hidden');
    elements.mainApp.classList.remove('hidden');
    elements.settingsToggle.classList.remove('hidden');
}

/**
 * Handle saving the API key
 */
async function handleSaveApiKey() {
    const apiKey = elements.apiKeyInput.value.trim();

    if (!apiKey) {
        alert('Please enter an API key.');
        return;
    }

    elements.saveApiKeyBtn.disabled = true;
    elements.saveApiKeyBtn.textContent = 'Checking...';

    const result = await testApiKey(apiKey);

    if (result.valid) {
        saveApiKey(apiKey);
        showMainApp();
    } else if (result.error === 'CORS_FILE_PROTOCOL') {
        // File protocol issue - save the key anyway and let them try
        alert(
            'Note: You\'re opening this file directly from your computer.\n\n' +
            'To use this app, you need to run a local web server. The easiest way:\n\n' +
            '1. Open Terminal\n' +
            '2. Navigate to the app folder\n' +
            '3. Run: python3 -m http.server 8000\n' +
            '4. Open: http://localhost:8000\n\n' +
            'Your API key has been saved. Try again after starting the server.'
        );
        saveApiKey(apiKey);
    } else {
        alert('Invalid API key: ' + (result.error || 'Please check that you copied it correctly.'));
    }

    elements.saveApiKeyBtn.disabled = false;
    elements.saveApiKeyBtn.textContent = 'Save Key';
}

/**
 * Render guest cards
 */
function renderGuests() {
    const presetGuests = getAllGuests();
    const customGuestsList = getCustomGuests();
    const allGuests = [...presetGuests, ...customGuestsList];

    elements.guestGrid.innerHTML = allGuests.map(guest => {
        const isSelected = state.selectedGuests.includes(guest.id);
        const isDisabled = !isSelected && state.selectedGuests.length >= state.maxGuests;
        const isCustom = guest.isCustom;

        return `
            <div class="guest-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${isCustom ? 'custom-guest' : ''}"
                 data-guest-id="${guest.id}"
                 role="button"
                 tabindex="0"
                 aria-pressed="${isSelected}">
                ${isCustom ? `<button class="remove-guest-btn" data-remove-id="${guest.id}" title="Remove guest">&times;</button>` : ''}
                <div class="guest-avatar">${guest.emoji}</div>
                <div class="guest-name">${guest.name}</div>
                <div class="guest-era">${guest.era}</div>
            </div>
        `;
    }).join('');

    // Add click listeners to guest cards
    elements.guestGrid.querySelectorAll('.guest-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger selection when clicking remove button
            if (e.target.classList.contains('remove-guest-btn')) return;
            handleGuestClick(card.dataset.guestId);
        });
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleGuestClick(card.dataset.guestId);
            }
        });
    });

    // Add click listeners to remove buttons
    elements.guestGrid.querySelectorAll('.remove-guest-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleRemoveCustomGuest(btn.dataset.removeId);
        });
    });

    updateSelectedCount();
}

/**
 * Handle guest card click
 * @param {string} guestId - The clicked guest's ID
 */
function handleGuestClick(guestId) {
    const index = state.selectedGuests.indexOf(guestId);

    if (index > -1) {
        // Deselect
        state.selectedGuests.splice(index, 1);
    } else if (state.selectedGuests.length < state.maxGuests) {
        // Select
        state.selectedGuests.push(guestId);
    }

    renderGuests();
    updateGenerateButton();
}

/**
 * Update the selected count display
 */
function updateSelectedCount() {
    elements.selectedCount.textContent = state.selectedGuests.length;
}

/**
 * Render topic buttons
 */
function renderTopics() {
    const topics = getAllTopics();

    elements.topicButtons.innerHTML = topics.map(topic => {
        const isSelected = state.selectedTopic === topic.id;

        return `
            <button class="topic-btn ${isSelected ? 'selected' : ''}"
                    data-topic-id="${topic.id}">
                ${topic.label}
            </button>
        `;
    }).join('');

    // Add click listeners to topic buttons
    elements.topicButtons.querySelectorAll('.topic-btn').forEach(btn => {
        btn.addEventListener('click', () => handleTopicClick(btn.dataset.topicId));
    });
}

/**
 * Handle topic button click
 * @param {string} topicId - The clicked topic's ID
 */
function handleTopicClick(topicId) {
    state.selectedTopic = state.selectedTopic === topicId ? null : topicId;
    state.customTopic = '';
    elements.customTopicInput.value = '';
    renderTopics();
    updateGenerateButton();
}

/**
 * Handle custom topic input
 */
function handleCustomTopicInput() {
    state.customTopic = elements.customTopicInput.value.trim();
    if (state.customTopic) {
        state.selectedTopic = null;
        renderTopics();
    }
    updateGenerateButton();
}

/**
 * Update generate button state
 */
function updateGenerateButton() {
    const hasEnoughGuests = state.selectedGuests.length >= state.minGuests;
    const hasTopic = state.selectedTopic !== null || state.customTopic !== '';

    elements.generateBtn.disabled = !(hasEnoughGuests && hasTopic);
}

/**
 * Handle generate button click
 */
async function handleGenerate() {
    // Get selected guests (including custom ones)
    const guests = getGuestsByIdsIncludingCustom(state.selectedGuests);

    // Get topic
    let topicPrompt;
    if (state.selectedTopic) {
        const topic = getTopicById(state.selectedTopic);
        topicPrompt = topic.prompt;
    } else {
        topicPrompt = state.customTopic;
    }

    // Show loading
    showLoading();
    updateLoadingMessage('Gathering source material from Wikiquote, Open Library, and Project Gutenberg...');

    try {
        // Fetch source material from external APIs
        const sourceMaterial = await fetchAllSourceMaterial(guests);

        // Update loading message
        updateLoadingMessage('Your guests are gathering their thoughts...');

        // Build the enhanced prompt with source material
        const prompt = buildEnhancedConversationPrompt(guests, topicPrompt, sourceMaterial);

        // Generate conversation
        const conversation = await generateConversation(prompt);

        // Display the conversation
        displayConversation(conversation, guests);

    } catch (error) {
        hideLoading();
        alert(error.message);
    }
}

/**
 * Update the loading message
 * @param {string} message - New loading message
 */
function updateLoadingMessage(message) {
    const loadingText = elements.loadingOverlay.querySelector('p');
    if (loadingText) {
        loadingText.textContent = message;
    }
}

/**
 * Display the generated conversation
 * @param {string} conversation - The raw conversation text
 * @param {Array} guests - Array of guest objects
 */
function displayConversation(conversation, guests) {
    // Parse the conversation into messages
    const messages = parseConversation(conversation, guests);

    // Render messages
    elements.conversationDisplay.innerHTML = messages.map(msg => {
        const guest = guests.find(g =>
            g.name.toLowerCase().includes(msg.speaker.toLowerCase()) ||
            msg.speaker.toLowerCase().includes(g.name.split(' ')[0].toLowerCase())
        );

        const emoji = guest ? guest.emoji : '💬';

        return `
            <div class="message">
                <div class="message-header">
                    <div class="message-avatar">${emoji}</div>
                    <div class="message-name">${msg.speaker}</div>
                </div>
                <div class="message-content">
                    ${formatMessageContent(msg.content)}
                </div>
            </div>
        `;
    }).join('');

    // Show conversation section
    elements.conversationSection.classList.remove('hidden');

    // Hide loading
    hideLoading();

    // Scroll to conversation
    elements.conversationSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Parse conversation text into structured messages
 * @param {string} text - Raw conversation text
 * @param {Array} guests - Array of guest objects
 * @returns {Array} Array of message objects
 */
function parseConversation(text, guests) {
    const messages = [];

    // Pattern to match speaker lines like **Name:** or **Name**: or Name:
    const speakerPattern = /\*\*([^*]+)\*\*:\s*"?|^([A-Z][a-zA-Z\s.]+):\s*"?/gm;

    // Split by speaker pattern
    const parts = text.split(/\*\*[^*]+\*\*:\s*"?|^[A-Z][a-zA-Z\s.]+:\s*"?/m);

    // Find all speaker names
    const speakers = [];
    let match;
    const regex = /\*\*([^*]+)\*\*:\s*"?|^([A-Z][a-zA-Z\s.]+):\s*"?/gm;
    while ((match = regex.exec(text)) !== null) {
        speakers.push(match[1] || match[2]);
    }

    // Combine speakers with their content
    for (let i = 0; i < speakers.length; i++) {
        const content = parts[i + 1];
        if (content && content.trim()) {
            messages.push({
                speaker: speakers[i].trim(),
                content: content.trim().replace(/^["']|["']$/g, '').replace(/"?\s*$/, '')
            });
        }
    }

    // If parsing failed, just show the raw text
    if (messages.length === 0) {
        messages.push({
            speaker: 'Conversation',
            content: text
        });
    }

    return messages;
}

/**
 * Format message content with paragraphs
 * @param {string} content - Raw message content
 * @returns {string} HTML formatted content
 */
function formatMessageContent(content) {
    // Split into paragraphs and wrap
    return content
        .split(/\n\n+/)
        .map(p => p.trim())
        .filter(p => p)
        .map(p => `<p>${p}</p>`)
        .join('');
}

/**
 * Handle new conversation button
 */
function handleNewConversation() {
    elements.conversationSection.classList.add('hidden');
    elements.conversationDisplay.innerHTML = '';

    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Show loading overlay
 */
function showLoading() {
    elements.loadingOverlay.classList.remove('hidden');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    elements.loadingOverlay.classList.add('hidden');
}

/**
 * Open settings modal
 */
function openSettings() {
    elements.settingsApiKey.value = '';
    elements.settingsModal.classList.remove('hidden');
}

/**
 * Close settings modal
 */
function closeSettings() {
    elements.settingsModal.classList.add('hidden');
}

/**
 * Handle updating API key from settings
 */
async function handleUpdateApiKey() {
    const apiKey = elements.settingsApiKey.value.trim();

    if (!apiKey) {
        alert('Please enter an API key.');
        return;
    }

    elements.updateApiKeyBtn.disabled = true;
    elements.updateApiKeyBtn.textContent = 'Checking...';

    const result = await testApiKey(apiKey);

    if (result.valid) {
        saveApiKey(apiKey);
        alert('API key updated successfully!');
        closeSettings();
    } else if (result.error === 'CORS_FILE_PROTOCOL') {
        saveApiKey(apiKey);
        alert('API key saved. Remember to run the app via a local server (see setup instructions).');
        closeSettings();
    } else {
        alert('Invalid API key: ' + (result.error || 'Please check that you copied it correctly.'));
    }

    elements.updateApiKeyBtn.disabled = false;
    elements.updateApiKeyBtn.textContent = 'Update Key';
}

/**
 * Open custom guest modal
 */
function openCustomGuestModal() {
    elements.customGuestForm.reset();
    elements.customGuestModal.classList.remove('hidden');
    elements.customGuestName.focus();
}

/**
 * Close custom guest modal
 */
function closeCustomGuestModal() {
    elements.customGuestModal.classList.add('hidden');
    elements.customGuestForm.reset();
    // Reset button and error states
    elements.addGuestSubmitBtn.disabled = false;
    elements.addGuestSubmitBtn.textContent = 'Add Guest';
    elements.cancelCustomGuestBtn.disabled = false;
    if (elements.customGuestError) {
        elements.customGuestError.classList.add('hidden');
        elements.customGuestError.textContent = '';
    }
}

/**
 * Handle adding a custom guest
 * @param {Event} e - Form submit event
 */
async function handleAddCustomGuest(e) {
    e.preventDefault();

    const name = elements.customGuestName.value.trim();

    if (!name) {
        showCustomGuestError('Please enter a name.');
        return;
    }

    // Show loading state
    elements.addGuestSubmitBtn.disabled = true;
    elements.addGuestSubmitBtn.textContent = 'Looking up...';
    elements.cancelCustomGuestBtn.disabled = true;
    hideCustomGuestError();

    try {
        // Look up the person on Wikipedia
        const info = await WikipediaAPI.fetchPersonInfo(name);

        let era = 'Historical figure';
        let description = 'Notable person';

        if (info) {
            if (info.era) {
                era = info.era;
            }
            if (info.description) {
                description = info.description;
            }
        }

        // Add the custom guest
        const newGuest = addCustomGuest(name, era, description);

        // Close modal and re-render
        closeCustomGuestModal();
        renderGuests();

        // Optionally auto-select the new guest if under limit
        if (state.selectedGuests.length < state.maxGuests) {
            state.selectedGuests.push(newGuest.id);
            renderGuests();
            updateGenerateButton();
        }

    } catch (error) {
        console.error('Error looking up guest:', error);
        showCustomGuestError('Could not look up this person. Please try again.');
    } finally {
        // Reset button state
        elements.addGuestSubmitBtn.disabled = false;
        elements.addGuestSubmitBtn.textContent = 'Add Guest';
        elements.cancelCustomGuestBtn.disabled = false;
    }
}

/**
 * Show error message in custom guest modal
 * @param {string} message - Error message
 */
function showCustomGuestError(message) {
    elements.customGuestError.textContent = message;
    elements.customGuestError.classList.remove('hidden');
}

/**
 * Hide error message in custom guest modal
 */
function hideCustomGuestError() {
    elements.customGuestError.classList.add('hidden');
    elements.customGuestError.textContent = '';
}

/**
 * Handle removing a custom guest
 * @param {string} guestId - The custom guest's ID to remove
 */
function handleRemoveCustomGuest(guestId) {
    // Remove from selection if selected
    const selectionIndex = state.selectedGuests.indexOf(guestId);
    if (selectionIndex !== -1) {
        state.selectedGuests.splice(selectionIndex, 1);
    }

    // Remove the custom guest
    removeCustomGuest(guestId);

    // Re-render
    renderGuests();
    updateGenerateButton();
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
