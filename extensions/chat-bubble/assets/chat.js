/**
 * Chat Bubble JavaScript
 * Handles chat UI interactions and API communication
 */

(function() {
  'use strict';

  const config = window.shopChatConfig || {};
  let conversationId = localStorage.getItem('chatbot_conversation_id') || null;
  let isOpen = false;
  let eventSource = null;

  // Initialize chat
  function initChat() {
    const bubble = document.querySelector('.shop-ai-chat-bubble');
    const window = document.querySelector('.shop-ai-chat-window');
    const closeBtn = document.querySelector('.shop-ai-chat-close');
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');

    if (!bubble || !window || !sendBtn || !input) return;

    // Toggle chat window
    bubble.addEventListener('click', () => {
      isOpen = !isOpen;
      window.classList.toggle('open', isOpen);
      
      if (isOpen && config.welcomeMessage) {
        addWelcomeMessage();
      }
    });

    closeBtn?.addEventListener('click', () => {
      isOpen = false;
      window.classList.remove('open');
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    });

    // Send message
    function sendMessage() {
      const message = input.value.trim();
      if (!message) return;

      addMessage('user', message);
      input.value = '';
      sendBtn.disabled = true;
      showTyping();

      // Send to API
      sendChatMessage(message);
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  function addWelcomeMessage() {
    const messagesContainer = document.querySelector('.shop-ai-chat-messages');
    if (!messagesContainer) return;

    // Check if welcome message already exists
    if (messagesContainer.querySelector('.welcome-message')) return;

    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'shop-ai-chat-message assistant welcome-message';
    welcomeDiv.innerHTML = `
      <div class="shop-ai-chat-message-content">${config.welcomeMessage || '👋 Hi there! How can I help you today?'}</div>
    `;
    messagesContainer.appendChild(welcomeDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function addMessage(role, content) {
    const messagesContainer = document.querySelector('.shop-ai-chat-messages');
    if (!messagesContainer) return;

    // Remove typing indicator
    const typing = messagesContainer.querySelector('.shop-ai-chat-typing');
    if (typing) typing.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `shop-ai-chat-message ${role}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
      <div class="shop-ai-chat-message-content">${escapeHtml(content)}</div>
      <div class="shop-ai-chat-message-time">${time}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTyping() {
    const messagesContainer = document.querySelector('.shop-ai-chat-messages');
    if (!messagesContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'shop-ai-chat-typing';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function appendToLastMessage(text) {
    const messagesContainer = document.querySelector('.shop-ai-chat-messages');
    if (!messagesContainer) return;

    // Remove typing indicator
    const typing = messagesContainer.querySelector('.shop-ai-chat-typing');
    if (typing) typing.remove();

    let lastMessage = messagesContainer.querySelector('.shop-ai-chat-message.assistant:last-child');
    
    if (!lastMessage) {
      // Create new assistant message
      lastMessage = document.createElement('div');
      lastMessage.className = 'shop-ai-chat-message assistant';
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      lastMessage.innerHTML = `
        <div class="shop-ai-chat-message-content"></div>
        <div class="shop-ai-chat-message-time">${time}</div>
      `;
      messagesContainer.appendChild(lastMessage);
    }

    const contentDiv = lastMessage.querySelector('.shop-ai-chat-message-content');
    if (contentDiv) {
      contentDiv.textContent += text;
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async function sendChatMessage(message) {
    const shopId = config.shopId || '';
    const shopDomain = config.shopDomain || '';
    
    // Use the app proxy URL - ensure it has https:// protocol
    // In development, this should be forwarded by Shopify CLI proxy to the React Router dev server
    // In production, this will be forwarded by Shopify to your deployed app
    let apiUrl = config.apiUrl || `https://${shopDomain}/apps/chatbot-chat`;
    
    // Ensure the URL has the protocol
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      apiUrl = `https://${apiUrl}`;
    }
    
    console.log('Sending chat message to:', apiUrl);
    console.log('Shop ID:', shopId);
    console.log('Shop Domain:', shopDomain);

    try {
      // Use Server-Sent Events for streaming
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          message,
          conversationId,
          shopId: shopId ? shopId.toString() : undefined,
          shopDomain: shopDomain || undefined,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        // Show a helpful error message
        if (response.status === 404) {
          throw new Error(`Chat API not found (404). The app proxy route may not be configured correctly. Please ensure the React Router dev server is running and the Shopify CLI proxy is forwarding requests.`);
        }
        
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText.substring(0, 200)}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              const sendBtn = document.getElementById('chat-send');
              if (sendBtn) sendBtn.disabled = false;
              return;
            }

            try {
              const parsed = JSON.parse(data);
              handleSSEMessage(parsed);
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat API error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        apiUrl: apiUrl,
        shopId: shopId,
      });
      addMessage('assistant', `Sorry, I encountered an error: ${error.message}. Please check the browser console for details.`);
      const sendBtn = document.getElementById('chat-send');
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  function handleSSEMessage(message) {
    switch (message.type) {
      case 'text':
        appendToLastMessage(message.data.content);
        break;
      case 'done':
        if (message.data.conversationId) {
          conversationId = message.data.conversationId;
          localStorage.setItem('chatbot_conversation_id', conversationId);
        }
        const sendBtn = document.getElementById('chat-send');
        if (sendBtn) sendBtn.disabled = false;
        break;
      case 'tool_call':
        // Optionally show tool usage
        console.log('Tool call:', message.data);
        break;
      case 'tool_result':
        // Optionally show tool results
        console.log('Tool result:', message.data);
        break;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
  } else {
    initChat();
  }
})();

