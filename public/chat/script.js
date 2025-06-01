const chatContainer = document.getElementById('chat-messages');
const inputField = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const newChatButton = document.getElementById('new-chat-button');

sendButton.addEventListener('click', sendMessage);
newChatButton.addEventListener('click', startNewChat);

inputField.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Auto-resize input field
inputField.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

function sendMessage() {
    const userMessage = inputField.value.trim();
    if (userMessage) {
        appendMessage('user', userMessage);
        inputField.value = '';
        inputField.style.height = 'auto';
        fetchResponse(userMessage);
    }
}

function appendMessage(sender, message) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', sender);
    
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('message-bubble');
    
    const messageText = document.createElement('div');
    messageText.textContent = message;
    
    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');
    messageTime.textContent = getCurrentTime();
    
    messageBubble.appendChild(messageText);
    messageBubble.appendChild(messageTime);
    messageContainer.appendChild(messageBubble);
    
    chatContainer.appendChild(messageContainer);
    scrollToBottom();
}

function appendSystemMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('system-message');
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
    scrollToBottom();
}

function showTypingIndicator() {
    const typingContainer = document.createElement('div');
    typingContainer.classList.add('message', 'bot');
    typingContainer.id = 'typing-indicator';
    
    const typingBubble = document.createElement('div');
    typingBubble.classList.add('typing-indicator');
    
    const typingDots = document.createElement('div');
    typingDots.classList.add('typing-dots');
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.classList.add('typing-dot');
        typingDots.appendChild(dot);
    }
    
    typingBubble.appendChild(typingDots);
    typingContainer.appendChild(typingBubble);
    chatContainer.appendChild(typingContainer);
    scrollToBottom();
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function fetchResponse(userMessage) {
    showTypingIndicator();

    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
    })
    .then(response => response.json())
    .then(data => {
        removeTypingIndicator();
        
        // Add a small delay for more natural feel
        setTimeout(() => {
            appendMessage('bot', data.reply || data.response);
        }, 600);
    })
    .catch(error => {
        removeTypingIndicator();
        console.error('Error:', error);
        
        setTimeout(() => {
            appendMessage('bot', 'Sorry, something went wrong. Please try again later.');
        }, 600);
    });
}

function startNewChat() {
    if (confirm('Are you sure you want to start a new chat? This will clear your current conversation.')) {
        // Add loading state
        newChatButton.disabled = true;
        newChatButton.textContent = 'Starting...';
        
        fetch('/api/chat/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                chatContainer.innerHTML = '';
                appendSystemMessage('New chat started! How can I help you today?');
            } else {
                appendSystemMessage('Failed to start new chat. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error starting new chat:', error);
            appendSystemMessage('Failed to start new chat. Please try again.');
        })
        .finally(() => {
            newChatButton.disabled = false;
            newChatButton.textContent = '✨ New Chat';
        });
    }
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Add status indicator to header
function addStatusIndicator() {
    const header = document.getElementById('chat-header');
    const title = header.querySelector('h2');
    
    if (!title.querySelector('.status-indicator')) {
        const statusIndicator = document.createElement('span');
        statusIndicator.classList.add('status-indicator');
        title.appendChild(statusIndicator);
    }
}

// Focus input on load
function focusInput() {
    setTimeout(() => {
        inputField.focus();
    }, 100);
}

// Load chat history on page load
document.addEventListener('DOMContentLoaded', function() {
    addStatusIndicator();
    focusInput();
    
    fetch('/api/chat/history')
        .then(response => response.json())
        .then(data => {
            if (data.messages && data.messages.length > 0) {
                data.messages.forEach(msg => {
                    appendMessage(msg.sender, msg.text);
                });
            } else {
                appendSystemMessage('Hello! How can I help you today?');
            }
        })
        .catch(error => {
            console.error('Error loading chat history:', error);
            appendSystemMessage('Hello! How can I help you today?');
        });
});

// Add haptic feedback for mobile
if ('ontouchstart' in window) {
    sendButton.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    });
    
    sendButton.addEventListener('touchend', function() {
        this.style.transform = '';
        setTimeout(() => {
            this.style.transform = 'scale(1.05)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        }, 50);
    });
}