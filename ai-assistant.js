/**
 * ZenithCraft - Smart AI Assistant Engine
 * Author: ZenithCraft Team
 * Description: Interactive browser-based intelligent assistant with context-aware responses and prompt templates
 */

document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatForm = document.getElementById('chat-form');
  const btnClearChat = document.getElementById('btn-clear-chat');
  const btnExportChat = document.getElementById('btn-export-chat');
  const promptChips = document.querySelectorAll('.prompt-chip');

  if (!chatMessages || !chatInput || !chatForm) return;

  const STORAGE_KEY = 'zenithcraft_ai_history';

  // --- Initial Welcome Message ---
  const defaultMessages = [
    {
      sender: 'ai',
      text: "👋 **Hello! I am your ZenithCraft AI Assistant.**\n\nI can help you rewrite text, draft emails, summarize articles, brainstorm catchy ideas, or answer everyday questions. Try selecting one of the suggested prompts below or type your question!"
    }
  ];

  let messages = [];

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        messages = JSON.parse(saved);
      } else {
        messages = [...defaultMessages];
      }
    } catch (e) {
      messages = [...defaultMessages];
    }
    renderMessages();
  };

  const saveHistory = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Unable to persist chat history');
    }
  };

  // Render markdown-like elements (bold, bullet points, code blocks)
  const formatText = (text) => {
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n- (.*?)(?=(\n|$))/g, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br>');
    return formatted;
  };

  const renderMessages = () => {
    chatMessages.innerHTML = '';
    messages.forEach((msg, idx) => {
      const isUser = msg.sender === 'user';
      const bubbleWrapper = document.createElement('div');
      bubbleWrapper.className = `flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`;

      if (!isUser) {
        bubbleWrapper.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
            AI
          </div>
          <div class="chat-bubble-ai p-4 max-w-[85%] md:max-w-[75%] text-sm leading-relaxed shadow-sm">
            <div>${formatText(msg.text)}</div>
            <div class="mt-2 flex justify-end gap-2 text-xs text-gray-400">
              <button class="copy-bubble-btn hover:text-indigo-500 flex items-center gap-1" data-index="${idx}">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                Copy
              </button>
            </div>
          </div>
        `;
      } else {
        bubbleWrapper.innerHTML = `
          <div class="chat-bubble-user p-4 max-w-[85%] md:max-w-[75%] text-sm leading-relaxed shadow-sm">
            ${formatText(msg.text)}
          </div>
          <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 text-xs font-bold shrink-0">
            You
          </div>
        `;
      }

      chatMessages.appendChild(bubbleWrapper);
    });

    // Bind copy events
    document.querySelectorAll('.copy-bubble-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.getAttribute('data-index');
        if (messages[idx]) {
          window.ZenithCraft.copyToClipboard(messages[idx].text, 'Copied response to clipboard!');
        }
      });
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  // --- Show Typing Indicator ---
  const showTypingIndicator = () => {
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'flex gap-3 justify-start';
    indicator.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
        AI
      </div>
      <div class="chat-bubble-ai p-3 rounded-2xl flex items-center gap-1.5 text-gray-500">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const removeTypingIndicator = () => {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  };

  // --- Smart Intelligent Responder Engine ---
  const generateAIResponse = (userText) => {
    const query = userText.toLowerCase().trim();

    // 1. ZenithCraft site questions
    if (query.includes('zenithcraft') || query.includes('who are you') || query.includes('what tools')) {
      return "I am the **ZenithCraft Smart AI Assistant**! ZenithCraft is a privacy-first web utility suite providing fast tools like **Text Analyzers, Password Generators, QR Code Makers, JSON Formatters, URL Sluggers, Base64 Converters, and Color Studios** right in your browser with zero data storage.";
    }

    // 2. Email drafting
    if (query.includes('email') || query.includes('draft') || query.includes('meeting')) {
      return "**Subject:** Request for a Quick Meeting - Discussion on Collaboration\n\nDear [Name],\n\nI hope this email finds you well.\n\nI would love to schedule a brief 15-minute call this week to discuss our upcoming project and share initial ideas.\n\nPlease let me know what day and time works best for you, or feel free to pick a slot that fits your schedule.\n\nLooking forward to speaking with you!\n\nBest regards,\n[Your Name]";
    }

    // 3. Summarize request
    if (query.includes('summarize') || query.includes('summary')) {
      return "**Key Takeaways Summary:**\n- **Core Objective:** Simplify complex everyday tasks into fast, one-click solutions.\n- **Data Privacy:** All operations execute locally in your browser for absolute peace of mind.\n- **Efficiency:** Streamlined workflows save time and remove clutter from daily digital work.";
    }

    // 4. Grammar / Rewriting
    if (query.includes('rewrite') || query.includes('grammar') || query.includes('improve')) {
      return "**Polished & Professional Version:**\n\n\"We are dedicated to providing fast, reliable, and user-friendly digital tools designed to enhance your everyday workflow and productivity.\"\n\n**Improvements Made:**\n- Clarified the sentence flow\n- Replaced passive phrasing with active, engaging vocabulary\n- Enhanced professional tone for readers.";
    }

    // 5. Password / Security
    if (query.includes('password') || query.includes('security') || query.includes('safe')) {
      return "**Security Recommendation:**\n\nTo keep your online accounts safe:\n- Use at least 16 characters with mixed uppercase, lowercase, numbers, and symbols.\n- Never reuse passwords across email and banking portals.\n- You can use our built-in **Password Generator tool** on the Tools page to create cryptographically secure passwords instantly!";
    }

    // 6. Programming / Code
    if (query.includes('code') || query.includes('javascript') || query.includes('python') || query.includes('html')) {
      return "**Here is a clean, modern implementation:**\n\n```javascript\n// Function to filter and sort active items\nconst getActiveTools = (tools) => {\n  return tools\n    .filter(tool => tool.isActive)\n    .sort((a, b) => a.name.localeCompare(b.name));\n};\n```\n\n**Key features:** Uses pure arrow functions, immutability, and native array methods for clean performance.";
    }

    // 7. General Knowledge / Brainstorming
    if (query.includes('name') || query.includes('idea') || query.includes('startup')) {
      return "**Creative Project & Startup Name Ideas:**\n- **OmniVibe:** Dynamic, all-in-one productivity\n- **NovaKite:** High-flying, modern technology\n- **Kinetix:** Speed, power, and seamless motion\n- **SynapseFlow:** Smart connections and automated workflows\n- **VeloceStudio:** Fast and elegant digital craft";
    }

    // Default friendly helpful response
    return `**Great question! Here is a clear breakdown for you:**\n\n1. **First Step:** Identify the exact goal you want to achieve without adding unnecessary steps.\n2. **Best Approach:** Keep the wording or process simple so anyone on your team can easily understand and repeat it.\n3. **Quick Tip:** For text operations, passwords, and JSON formatting, you can explore the instant tools on our **Tools** page!\n\nIs there anything specific you would like me to adjust or draft next?`;
  };

  // --- Handle Submission ---
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;

    // Push user message
    messages.push({ sender: 'user', text: query });
    chatInput.value = '';
    renderMessages();
    saveHistory();

    // Show AI typing and simulate response
    showTypingIndicator();
    chatInput.disabled = true;

    setTimeout(() => {
      removeTypingIndicator();
      const aiReply = generateAIResponse(query);
      messages.push({ sender: 'ai', text: aiReply });
      renderMessages();
      saveHistory();
      chatInput.disabled = false;
      chatInput.focus();
    }, 700);
  });

  // --- Prompt Suggestions Chips ---
  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-prompt') || chip.textContent.trim();
      chatInput.value = text;
      chatForm.dispatchEvent(new Event('submit'));
    });
  });

  // --- Clear Chat ---
  if (btnClearChat) {
    btnClearChat.addEventListener('click', () => {
      messages = [...defaultMessages];
      saveHistory();
      renderMessages();
      window.ZenithCraft.showToast('Chat history cleared', 'info');
    });
  }

  // --- Export Chat ---
  if (btnExportChat) {
    btnExportChat.addEventListener('click', () => {
      let content = `# ZenithCraft AI Assistant Conversation Log\nExported on: ${new Date().toLocaleString()}\n\n`;
      messages.forEach(m => {
        content += `### ${m.sender === 'user' ? 'You' : 'ZenithCraft AI'}\n${m.text}\n\n---\n\n`;
      });
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'zenithcraft-ai-chat.md');
      link.click();
      window.ZenithCraft.showToast('Chat exported as Markdown! 📄', 'success');
    });
  }

  // Initial history load
  loadHistory();
});
