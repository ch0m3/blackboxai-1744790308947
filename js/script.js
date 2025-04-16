// Load herbal recommendations data
let herbalData = null;

async function loadHerbalData() {
    try {
        const response = await fetch('/data/herbal_recommendations.json');
        herbalData = await response.json();
    } catch (error) {
        console.error('Error loading herbal data:', error);
        // Fallback to showing error in chat
        appendMessage('system', 'I apologize, but I\'m having trouble accessing my herbal knowledge right now. Please try again later.');
    }
}

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHerbalData();
    setupEventListeners();
});

function setupEventListeners() {
    // Form submission
    chatForm.addEventListener('submit', handleSubmit);

    // Quick ailment buttons
    document.querySelectorAll('.ailment-btn').forEach(button => {
        button.addEventListener('click', () => {
            userInput.value = button.textContent;
            handleSubmit(new Event('submit'));
        });
    });

    // Add keyboard event listener for Enter key
    userInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit(event);
        }
    });
}

function handleSubmit(event) {
    event.preventDefault();
    const message = userInput.value.trim();
    
    if (message) {
        processUserInput(message);
        userInput.value = '';
        userInput.focus(); // Keep focus on input for continued interaction
    }
}

function processUserInput(message) {
    // Add user message to chat
    appendMessage('user', message);

    // Convert message to lowercase and remove special characters for matching
    const normalizedInput = message.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    // Find matching ailment
    let matchFound = false;
    
    for (const [ailment, data] of Object.entries(herbalData)) {
        if (normalizedInput.includes(ailment.replace('_', ' '))) {
            appendHerbalRecommendation(data);
            matchFound = true;
            break;
        }
    }

    if (!matchFound) {
        appendMessage('system', 'I apologize, but I don\'t have specific recommendations for that ailment. Try asking about: headache, anxiety, common cold, digestive issues, insomnia, or stress.');
    }
}

function appendMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' 
        ? 'flex justify-end mb-4' 
        : 'flex justify-start mb-4';

    const contentDiv = document.createElement('div');
    contentDiv.className = sender === 'user'
        ? 'bg-forest text-white rounded-lg py-2 px-4 max-w-[80%]'
        : 'bg-sage/10 text-deepForest rounded-lg py-2 px-4 max-w-[80%]';
    
    contentDiv.textContent = message;
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function appendHerbalRecommendation(data) {
    const recommendationDiv = document.createElement('div');
    recommendationDiv.className = 'flex justify-start mb-4';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'bg-sage/10 text-deepForest rounded-lg py-4 px-4 max-w-[80%]';

    // Create recommendation content with herbs and image
    const content = `
        <div class="mb-3">${data.recommendation}</div>
        <div class="mb-3">
            <strong class="text-forest">Recommended Herbs:</strong>
            <div class="flex flex-wrap gap-2 mt-2">
                ${data.herbs.map(herb => `
                    <span class="px-2 py-1 bg-forest/10 rounded-full text-sm">${herb}</span>
                `).join('')}
            </div>
        </div>
        <img src="${data.image}" alt="Herbal remedy" class="rounded-lg w-full h-48 object-cover mt-3">
    `;

    contentDiv.innerHTML = content;
    recommendationDiv.appendChild(contentDiv);
    chatMessages.appendChild(recommendationDiv);
    scrollToBottom();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add loading animation
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'flex justify-start mb-4';
    loadingDiv.innerHTML = `
        <div class="bg-sage/10 text-deepForest rounded-lg py-2 px-4">
            <div class="flex gap-1">
                <div class="w-2 h-2 bg-forest rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-forest rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-forest rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    scrollToBottom();
    return loadingDiv;
}

function removeLoading(loadingElement) {
    loadingElement.remove();
}
