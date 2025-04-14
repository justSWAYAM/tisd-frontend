import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { XCircle, Minimize2, Maximize2, Sun, Moon } from 'lucide-react';

// Improved API key validation
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Missing VITE_GEMINI_API_KEY in environment variables');
}

// Initialize the API with proper configuration
const ai = new GoogleGenAI({ apiKey: API_KEY });

// System message to instruct Gemini to return JSON responses
const structuredResponsePrompt = `
Please format your responses as JSON with the following structure:
{
  "content": "Your main response text here",
  "format": "markdown|text",
  "code": [
    {
      "language": "language_name",
      "code": "your code here"
    }
  ],
  "bullets": ["item1", "item2"],
  "steps": ["step1", "step2"]
}

The 'code', 'bullets', and 'steps' fields are optional and should only be included when relevant.
Always maintain this JSON structure in your responses.
`;

// The Chat component now accepts theme and onClose as props from the parent
const Chat = ({ theme = 'dark', onClose, onMinimize, isMinimized }) => {
  // Display the welcome message UI-only
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: 'Hi! I\'m your AI learning assistant. How can I help you with your courses today?',
      formattedContent: {
        content: 'Hi! I\'m your AI learning assistant. How can I help you with your courses today?',
        format: 'text'
      }
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatInstance, setChatInstance] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Use theme prop to determine color scheme
  const isDarkTheme = theme === 'dark';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat instance on component mount
  useEffect(() => {
    console.log('Chat component mounted');
    
    // Create initial chat instance with system prompt for structured responses
    const initializeChat = async () => {
      const chat = ai.chats.create({
        model: "gemini-2.0-flash"
      });
      
      // Prime the chat with our formatting instructions
      try {
        await chat.sendMessage({
          message: structuredResponsePrompt
        });
        setChatInstance(chat);
      } catch (error) {
        console.error("Failed to initialize chat with system prompt:", error);
        // Create a basic chat instance as fallback
        const basicChat = ai.chats.create({
          model: "gemini-2.0-flash"
        });
        setChatInstance(basicChat);
      }
    };
    
    initializeChat();
  }, []);

  // Process response text to extract JSON if possible
  const processResponseText = (text) => {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                       text.match(/```\n([\s\S]*?)\n```/) || 
                       text.match(/{[\s\S]*?}/);
      
      const jsonStr = jsonMatch ? jsonMatch[0].replace(/```json\n|```\n|```/g, '') : null;
      const parsed = jsonStr ? JSON.parse(jsonStr) : null;
      
      if (parsed) {
        return {
          rawText: text,
          formattedContent: parsed
        };
      }
    } catch (error) {
      console.warn("Could not parse JSON from response:", error);
    }
    
    // Fallback to treating the whole response as plain text
    return {
      rawText: text,
      formattedContent: {
        content: text,
        format: 'text'
      }
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !chatInstance) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      formattedContent: {
        content: userMessage,
        format: 'text'
      }
    }]);
    setIsLoading(true);

    try {
      // Build a prompt that encourages structured responses
      const prompt = `${userMessage}\n\nPlease format your response as JSON according to my previous instructions.`;
      
      // Send message using the chat instance
      const response = await chatInstance.sendMessage({
        message: prompt
      });

      // Process the response to extract JSON formatting if available
      const processedResponse = processResponseText(response.text);
      
      // Add the response to messages
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: response.text,
        formattedContent: processedResponse.formattedContent
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'model',
        content: `Error: ${error.message || 'Failed to get response from AI'}`,
        formattedContent: {
          content: `Error: ${error.message || 'Failed to get response from AI'}`,
          format: 'text'
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Simple markdown-like rendering for basic formatting
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    // Convert markdown-style formatting to HTML
    let formattedText = text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Headers
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      // Lists - these are basic, not nested
      .replace(/^- (.*?)$/gm, '• $1<br/>')
      .replace(/^(\d+)\. (.*?)$/gm, '$1. $2<br/>');
    
    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  // Render formatted message content
  const renderFormattedContent = (message) => {
    const { formattedContent } = message;
    
    if (!formattedContent) {
      return <p className="whitespace-pre-wrap">{message.content}</p>;
    }
    
    return (
      <div className="space-y-4">
        {/* Main content */}
        {formattedContent.format === 'markdown' ? (
          renderFormattedText(formattedContent.content)
        ) : (
          <p className="whitespace-pre-wrap">{formattedContent.content}</p>
        )}
        
        {/* Code blocks */}
        {formattedContent.code && formattedContent.code.length > 0 && (
          <div className="space-y-4">
            {formattedContent.code.map((codeBlock, index) => (
              <div key={index} className="relative">
                <div className={`flex justify-between items-center text-xs ${isDarkTheme ? 'bg-gray-900 text-gray-400' : 'bg-gray-200 text-gray-700'} px-4 py-1 rounded-t-lg`}>
                  <span>{codeBlock.language}</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(codeBlock.code)}
                    className={`hover:${isDarkTheme ? 'text-white' : 'text-gray-900'}`}
                  >
                    Copy
                  </button>
                </div>
                <SyntaxHighlighter
                  language={codeBlock.language}
                  style={atomDark}
                  className="rounded-b-lg !mt-0"
                >
                  {codeBlock.code}
                </SyntaxHighlighter>
              </div>
            ))}
          </div>
        )}
        
        {/* Bullets */}
        {formattedContent.bullets && formattedContent.bullets.length > 0 && (
          <ul className="list-disc pl-6 space-y-1">
            {formattedContent.bullets.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
        
        {/* Steps */}
        {formattedContent.steps && formattedContent.steps.length > 0 && (
          <ol className="list-decimal pl-6 space-y-1">
            {formattedContent.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        )}
      </div>
    );
  };

  if (isMinimized) {
    return (
      <div className={`py-6 px-4 text-center ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
        <p>Chat minimized. Click the arrow to expand.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header removed since it's now managed by the parent component */}
      
      {/* Messages container */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Visual background elements */}
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-gradient-to-br from-[#D4FF56] to-green-400 blur-2xl"></div>
          <div className="absolute bottom-12 left-8 w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 blur-2xl"></div>
        </div>
        
        {/* Messages */}
        <div className="relative z-10">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-[90%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#D4FF56] to-[#B0D943] text-black user-glow'
                    : `bg-gradient-to-br ${isDarkTheme ? 'from-gray-800 to-gray-700 text-white' : 'from-gray-100 to-gray-200 text-gray-800'} model-glow`
                }`}
              >
                {renderFormattedContent(message)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`bg-gradient-to-br ${isDarkTheme ? 'from-gray-800 to-gray-700 text-white' : 'from-gray-100 to-gray-200 text-gray-800'} rounded-lg p-4 model-glow`}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '-0.5s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className={`p-4 border-t ${isDarkTheme ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask anything about your courses..."
            className={`flex-1 ${isDarkTheme ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4FF56] focus:border-transparent transition-all`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={isLoading}
            className={`px-6 py-3 bg-gradient-to-r from-[#D4FF56] to-[#B0D943] text-black rounded-lg transition-all ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover-glow'
            }`}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      <style>
        {`
          .user-glow {
            box-shadow: 0 0 15px 0 rgba(212, 255, 86, 0.3);
          }
          .model-glow {
            box-shadow: 0 0 15px 0 rgba(31, 41, 55, ${isDarkTheme ? '0.5' : '0.2'});
          }
          .hover-glow:hover {
            box-shadow: 0 0 15px 0 rgba(212, 255, 86, 0.3);
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: ${isDarkTheme ? '#1f2937' : '#f3f4f6'};
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${isDarkTheme ? '#374151' : '#d1d5db'};
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${isDarkTheme ? '#4b5563' : '#9ca3af'};
          }
        `}
      </style>
    </div>
  );
};

export default Chat;