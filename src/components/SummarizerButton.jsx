import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sun, Moon, Minimize2, Maximize2, XCircle } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Missing VITE_GEMINI_API_KEY in environment variables');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const structuredResponsePrompt = `
Please format your responses as JSON with the following structure:
{
  "content": "Your main response text here",
  "format": "markdown",
  "keyPoints": ["key point 1", "key point 2"],
  "concepts": ["concept 1", "concept 2"],
  "steps": ["step 1", "step 2"]
}
Always maintain this JSON structure in your responses.
`;

const SummarizerButton = ({ lectureId, videoUrl }) => {
  const [showSummarizer, setShowSummarizer] = useState(false);
  const [summarizerWidth, setSummarizerWidth] = useState(380);
  const [minimized, setMinimized] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInstance, setAiInstance] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInstance, setChatInstance] = useState(null);

  const sidebarRef = useRef(null);
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    console.log('Summarizer component mounted');
    
    const initializeChat = async () => {
      const chat = ai.chats.create({
        model: "gemini-2.0-flash"
      });
      
      try {
        await chat.sendMessage({
          message: "You are a video content summarizer. Your responses should help students understand the key concepts from educational videos."
        });
        setChatInstance(chat);
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        const basicChat = ai.chats.create({
          model: "gemini-2.0-flash"
        });
        setChatInstance(basicChat);
      }
    };
    
    initializeChat();
  }, []);

  const processResponseText = (text) => {
    try {
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
    
    return {
      rawText: text,
      formattedContent: {
        content: text,
        format: 'text'
      }
    };
  };

  const handleGenerateSummary = async () => {
    if (!chatInstance || isLoading) return;
    setIsLoading(true);

    try {
      const prompt = `Please analyze and summarize the educational content from this video: ${videoUrl}
      Include key concepts, important points, and core learning objectives.
      consider yourself as the teacher and the user as the student. so try to teach them what is there in the video`;
      
      const response = await chatInstance.sendMessage({
        message: prompt
      });

      const processedResponse = processResponseText(response.text);
      
      setMessages(prev => [...prev, {
        role: 'model',
        content: response.text,
        formattedContent: processedResponse.formattedContent
      }]);
    } catch (error) {
      console.error('Summarization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleElaborateMore = async () => {
    if (!chatInstance || isLoading || messages.length === 0) return;
    setIsLoading(true);

    try {
      const lastMessage = messages[messages.length - 1].formattedContent;
      const prompt = `Based on this summary: ${JSON.stringify(lastMessage)}, 
      please provide more detailed explanations and examples.`;
      
      const response = await chatInstance.sendMessage({
        message: prompt
      });

      const processedResponse = processResponseText(response.text);
      
      setMessages(prev => [...prev, {
        role: 'model',
        content: response.text,
        formattedContent: processedResponse.formattedContent
      }]);
    } catch (error) {
      console.error('Elaboration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to your component
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/^- (.*?)$/gm, '• $1<br/>')
      .replace(/^(\d+)\. (.*?)$/gm, '$1. $2<br/>');
    
    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  // Resizing handlers
  const startResizing = (e) => {
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = summarizerWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!resizingRef.current) return;
    const width = startWidthRef.current - (e.clientX - startXRef.current);
    if (width >= 300 && width <= 600) {
      setSummarizerWidth(width);
    }
  };

  const handleMouseUp = () => {
    resizingRef.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const isDarkTheme = theme === 'dark';

  return (
    <>
      <button
        onClick={() => setShowSummarizer(true)}
        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Summarize Lecture
      </button>

      {showSummarizer && (
        <div 
          ref={sidebarRef}
          className="fixed top-0 right-0 h-full shadow-2xl border-l border-gray-800 flex flex-col z-50"
          style={{ 
            width: `${summarizerWidth}px`,
            transition: !resizingRef.current ? 'width 0.3s ease' : 'none'
          }}
        >
          <div 
            className="absolute top-0 left-0 w-1 h-full cursor-ew-resize hover:w-2 group"
            onMouseDown={startResizing}
          >
            <div className="absolute h-full w-0.5 bg-[#D4FF56]/30 group-hover:bg-[#D4FF56]/60"></div>
          </div>

          <div className={`flex flex-col h-full ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`flex justify-between items-center p-4 border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#D4FF56] animate-pulse"></div>
                <h2 className={`font-medium ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                  Video Summarizer
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`p-1.5 rounded-full ${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {isDarkTheme ? (
                    <Sun size={16} className="text-gray-400" />
                  ) : (
                    <Moon size={16} className="text-gray-600" />
                  )}
                </button>
                <button 
                  onClick={() => setMinimized(!minimized)}
                  className={`p-1.5 rounded-full ${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {minimized ? (
                    <Maximize2 size={16} className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'} />
                  ) : (
                    <Minimize2 size={16} className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'} />
                  )}
                </button>
                <button 
                  onClick={() => setShowSummarizer(false)}
                  className={`p-1.5 rounded-full ${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  <XCircle size={16} className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'} />
                </button>
              </div>
            </div>

            {!minimized && (
              <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
                {/* Visual background elements */}
                <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
                  <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-gradient-to-br from-[#D4FF56] to-green-400 blur-2xl"></div>
                  <div className="absolute bottom-12 left-8 w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 blur-2xl"></div>
                </div>

                {/* Messages */}
                <div className="relative z-10">
                  {messages.length === 0 ? (
                    <button
                      onClick={handleGenerateSummary}
                      className="w-full py-3 bg-gradient-to-r from-[#D4FF56] to-[#B0D943] text-black rounded-lg hover-glow transition-all font-medium"
                      disabled={isLoading}
                    >
                      Generate Summary
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div key={index} className="flex justify-start mb-4">
                          <div className={`max-w-[90%] rounded-lg p-4 bg-gradient-to-br ${
                            isDarkTheme ? 'from-gray-800 to-gray-700 text-white' : 'from-gray-100 to-gray-200 text-gray-800'
                          } model-glow`}>
                            <div className="space-y-4">
                              {/* Main content */}
                              {message.formattedContent.format === 'markdown' ? (
                                renderFormattedText(message.formattedContent.content)
                              ) : (
                                <p className="whitespace-pre-wrap text-gray-300">{message.formattedContent.content}</p>
                              )}
                              
                              {/* Key Points */}
                              {message.formattedContent.keyPoints && (
                                <div className="mt-4">
                                  <h3 className="text-[#D4FF56] font-medium mb-2">Key Points</h3>
                                  <ul className="list-disc pl-6 space-y-1">
                                    {message.formattedContent.keyPoints.map((point, idx) => (
                                      <li key={idx} className={isDarkTheme ? 'text-gray-300' : 'text-gray-700'}>{point}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Concepts */}
                              {message.formattedContent.concepts && (
                                <div className="mt-4">
                                  <h3 className="text-[#D4FF56] font-medium mb-2">Core Concepts</h3>
                                  <ul className="list-disc pl-6 space-y-1">
                                    {message.formattedContent.concepts.map((concept, idx) => (
                                      <li key={idx} className={isDarkTheme ? 'text-gray-300' : 'text-gray-700'}>{concept}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Steps */}
                              {message.formattedContent.steps && (
                                <div className="mt-4">
                                  <h3 className="text-[#D4FF56] font-medium mb-2">Learning Steps</h3>
                                  <ol className="list-decimal pl-6 space-y-1">
                                    {message.formattedContent.steps.map((step, idx) => (
                                      <li key={idx} className={isDarkTheme ? 'text-gray-300' : 'text-gray-700'}>{step}</li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={handleElaborateMore}
                        className="w-full py-3 bg-gradient-to-r from-[#D4FF56] to-[#B0D943] text-black rounded-lg hover-glow transition-all font-medium"
                        disabled={isLoading}
                      >
                        Elaborate More
                      </button>
                    </div>
                  )}

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
              </div>
            )}

            {minimized && (
              <div className={`py-6 px-4 text-center ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>Summarizer minimized. Click the arrow to expand.</p>
              </div>
            )}
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
      )}
    </>
  );
};

export default SummarizerButton;