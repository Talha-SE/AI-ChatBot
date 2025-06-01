const chatbotWidget = (() => {
    // Create widget styles
    const widgetStyles = `
        <style>
            #chatbot-container {
                position: fixed;
                bottom: 90px;
                right: 24px;
                width: 360px;
                height: 520px;
                background: #ffffff;
                border-radius: 20px;
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                display: none;
                flex-direction: column;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Helvetica, Arial, sans-serif;
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            #chatbot-header {
                background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                color: white;
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                backdrop-filter: blur(20px);
                position: relative;
            }
            
            #chatbot-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
                pointer-events: none;
            }
            
            #chatbot-header h2 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                position: relative;
                z-index: 1;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            #chatbot-header h2::before {
                content: '💬';
                font-size: 16px;
            }
            
            #chatbot-header .header-buttons {
                display: flex;
                gap: 8px;
                position: relative;
                z-index: 1;
            }
            
            #chatbot-header button {
                background: rgba(255, 255, 255, 0.15);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
                padding: 6px 12px;
                border-radius: 12px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 500;
                transition: all 0.2s ease;
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            #new-chat-widget::before {
                content: '✨';
                font-size: 10px;
            }
            
            #close-chat::before {
                content: '✕';
                font-size: 12px;
                font-weight: 600;
            }
            
            #chatbot-header button:hover {
                background: rgba(255, 255, 255, 0.25);
                transform: translateY(-1px);
            }
            
            #chatbot-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                background: #f8fafc;
                background-image: 
                    radial-gradient(circle at 20% 80%, rgba(30, 58, 138, 0.02) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.02) 0%, transparent 50%);
            }
            
            #chatbot-messages::-webkit-scrollbar {
                width: 3px;
            }
            
            #chatbot-messages::-webkit-scrollbar-thumb {
                background: rgba(30, 58, 138, 0.2);
                border-radius: 2px;
            }
            
            .chat-message {
                margin: 12px 0;
                display: flex;
                align-items: flex-end;
                animation: slideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(8px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            
            .chat-message.user {
                justify-content: flex-end;
            }
            
            .chat-message.bot, .chat-message.system {
                justify-content: flex-start;
            }
            
            .message-content {
                max-width: 75%;
                padding: 10px 14px;
                border-radius: 16px;
                font-size: 14px;
                line-height: 1.4;
                position: relative;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
                backdrop-filter: blur(10px);
            }
            
            .chat-message.user .message-content {
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                color: white;
                border-bottom-right-radius: 4px;
                box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);
            }
            
            .chat-message.user .message-content::after {
                content: '';
                position: absolute;
                bottom: 0;
                right: -5px;
                width: 0;
                height: 0;
                border: 6px solid transparent;
                border-left: 6px solid #3b82f6;
                border-bottom: 0;
                border-right: 0;
            }
            
            .chat-message.bot .message-content {
                background: white;
                color: #374151;
                border-bottom-left-radius: 4px;
                border: 1px solid rgba(229, 231, 235, 0.8);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }
            
            .chat-message.bot .message-content::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: -6px;
                width: 0;
                height: 0;
                border: 6px solid transparent;
                border-right: 6px solid white;
                border-bottom: 0;
                border-left: 0;
            }
            
            .chat-message.system .message-content {
                background: rgba(255, 255, 255, 0.8);
                color: #6b7280;
                font-weight: 500;
                text-align: center;
                border-radius: 12px;
                font-size: 12px;
                max-width: 90%;
                margin: 0 auto;
                border: 1px solid rgba(229, 231, 235, 0.5);
            }
            
            .chat-message.system .message-content::after {
                display: none;
            }
            
            #chatbot-input-container {
                background: white;
                padding: 12px 16px 16px;
                display: flex;
                align-items: center;
                gap: 10px;
                border-top: 1px solid rgba(229, 231, 235, 0.8);
                backdrop-filter: blur(20px);
            }
            
            #chatbot-input {
                flex: 1;
                padding: 10px 14px;
                border: 1.5px solid #e5e7eb;
                border-radius: 18px;
                background: #f9fafb;
                font-size: 14px;
                outline: none;
                font-family: inherit;
                transition: all 0.2s ease;
            }
            
            #chatbot-input:focus {
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            #chatbot-input::placeholder {
                color: #9ca3af;
            }
            
            #send-message {
                width: 36px;
                height: 36px;
                border: none;
                border-radius: 50%;
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);
                position: relative;
            }
            
            #send-message:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
            }
            
            #send-message::before {
                content: '';
                width: 16px;
                height: 16px;
                background: currentColor;
                mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'/%3E%3C/svg%3E") no-repeat center;
                mask-size: contain;
                transform: translateX(1px);
            }
            
            #chatbot-button {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 64px;
                height: 64px;
                border: none;
                border-radius: 50%;
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                color: white;
                cursor: pointer;
                font-size: 28px;
                box-shadow: 0 8px 32px rgba(30, 58, 138, 0.4);
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(20px);
            }
            
            #chatbot-button:hover {
                transform: scale(1.1) translateY(-2px);
                box-shadow: 0 12px 40px rgba(30, 58, 138, 0.5);
            }
            
            #chatbot-button:active {
                transform: scale(1.05) translateY(-1px);
            }
            
            #chatbot-button::before {
                content: '💬';
                font-size: 24px;
            }
            
            .typing-indicator-widget {
                display: flex;
                align-items: center;
                padding: 10px 14px;
                background: white;
                border-radius: 16px;
                border-bottom-left-radius: 4px;
                position: relative;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                max-width: 75%;
                border: 1px solid rgba(229, 231, 235, 0.8);
            }
            
            .typing-indicator-widget::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: -6px;
                width: 0;
                height: 0;
                border: 6px solid transparent;
                border-right: 6px solid white;
                border-bottom: 0;
                border-left: 0;
            }
            
            .typing-dots-widget {
                display: flex;
                gap: 3px;
                align-items: center;
            }
            
            .typing-dot-widget {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #9ca3af;
                animation: typingAnimation 1.4s infinite ease-in-out;
            }
            
            .typing-dot-widget:nth-child(1) { animation-delay: -0.32s; }
            .typing-dot-widget:nth-child(2) { animation-delay: -0.16s; }
            .typing-dot-widget:nth-child(3) { animation-delay: 0s; }
            
            @keyframes typingAnimation {
                0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
                40% { transform: scale(1); opacity: 1; }
            }
        </style>
    `;

    // Add styles to head
    document.head.insertAdjacentHTML('beforeend', widgetStyles);

    const chatContainer = document.createElement('div');
    chatContainer.id = 'chatbot-container';
    chatContainer.innerHTML = `
        <div id="chatbot-header">
            <h2>Chat Support</h2>
            <div class="header-buttons">
                <button id="new-chat-widget">New</button>
                <button id="close-chat"></button>
            </div>
        </div>
        <div id="chatbot-messages"></div>
        <div id="chatbot-input-container">
            <input type="text" id="chatbot-input" placeholder="Type your message..." />
            <button id="send-message"></button>
        </div>
    `;
    
    document.body.appendChild(chatContainer);

    const toggleChat = () => {
        const isVisible = chatContainer.style.display === 'flex';
        chatContainer.style.display = isVisible ? 'none' : 'flex';
        
        if (!isVisible) {
            // Load chat history when opening
            loadChatHistory();
            // Focus input field
            setTimeout(() => {
                document.getElementById('chatbot-input').focus();
            }, 100);
        }
    };

    const sendMessage = async () => {
        const inputField = document.getElementById('chatbot-input');
        const message = inputField.value.trim();
        if (!message) return;

        displayMessage('user', message);
        inputField.value = '';

        showTypingIndicator();

        try {
            // Use relative URLs that work from any domain
            const baseUrl = document.currentScript?.src?.replace('/api/widget', '') || '';
            const response = await fetch(`${baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();
            
            setTimeout(() => {
                removeTypingIndicator();
                displayMessage('bot', data.reply || data.response);
            }, 800);
        } catch (error) {
            removeTypingIndicator();
            displayMessage('bot', 'Sorry, something went wrong. Please try again.');
        }
    };

    const startNewChat = async () => {
        try {
            const baseUrl = document.currentScript?.src?.replace('/api/widget', '') || '';
            const response = await fetch(`${baseUrl}/api/chat/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            const data = await response.json();
            if (data.success) {
                document.getElementById('chatbot-messages').innerHTML = '';
                displayMessage('system', 'New chat started! How can I help you?');
            }
        } catch (error) {
            displayMessage('system', 'Failed to start new chat.');
        }
    };

    const displayMessage = (sender, message) => {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message;
        
        messageElement.appendChild(messageContent);
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    const showTypingIndicator = () => {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingElement = document.createElement('div');
        typingElement.className = 'chat-message bot';
        typingElement.id = 'typing-indicator-widget';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'typing-indicator-widget';
        
        const typingDots = document.createElement('div');
        typingDots.className = 'typing-dots-widget';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot-widget';
            typingDots.appendChild(dot);
        }
        
        typingContent.appendChild(typingDots);
        typingElement.appendChild(typingContent);
        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    const removeTypingIndicator = () => {
        const typingIndicator = document.getElementById('typing-indicator-widget');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    };

    const loadChatHistory = async () => {
        try {
            const baseUrl = document.currentScript?.src?.replace('/api/widget', '') || '';
            const response = await fetch(`${baseUrl}/api/chat/history`);
            const data = await response.json();
            
            const messagesContainer = document.getElementById('chatbot-messages');
            messagesContainer.innerHTML = '';
            
            if (data.messages && data.messages.length > 0) {
                data.messages.forEach(msg => {
                    displayMessage(msg.sender, msg.text);
                });
            } else {
                displayMessage('system', 'Hello! How can I help you today?');
            }
        } catch (error) {
            displayMessage('system', 'Hello! How can I help you today?');
        }
    };

    document.getElementById('close-chat').addEventListener('click', toggleChat);
    document.getElementById('send-message').addEventListener('click', sendMessage);
    document.getElementById('new-chat-widget').addEventListener('click', startNewChat);
    document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    return {
        toggleChat,
    };
})();

const chatButton = document.createElement('button');
chatButton.id = 'chatbot-button';
chatButton.addEventListener('click', chatbotWidget.toggleChat);
document.body.appendChild(chatButton);