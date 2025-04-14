import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Editor from '@monaco-editor/react';
import Navbar from './Navbar';
import YouTube from 'react-youtube';
import Split from 'react-split';

const CodeEditor = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState(getInitialCode('javascript'));
  const [output, setOutput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [activeTab, setActiveTab] = useState('output');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  
  // Sample YouTube video ID (replace with your actual coding tutorial video ID)
  const videoId = "PkZNo7MFNFg";

  function getInitialCode(language) {
    const initialCode = {
      javascript: `// Start coding here
function helloWorld() {
  console.log("Hello, World!");
}

helloWorld();`,
      python: `# Start coding here
def hello_world():
    print("Hello, World!")

hello_world()`,
      java: `// Start coding here
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    };
    return initialCode[language] || '';
  }

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    scrollBeyondLastLine: false,
    roundedSelection: false,
    padding: { top: 10 },
    automaticLayout: true,
    theme: 'vs-dark',
    lineNumbers: 'on',
  };

  const youtubeOpts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 1,
      fs: 1,
    },
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    setCode(getInitialCode(newLanguage));
    setOutput('');
    setTerminalOutput('');
  };

  const executeJavaScript = () => {
    try {
      const oldConsoleLog = console.log;
      let output = '';
      console.log = (...args) => {
        output += args.join(' ') + '\n';
      };
      
      eval(code);
      
      console.log = oldConsoleLog;
      return output || 'Code executed successfully!';
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };

  const simulatePythonExecution = () => {
    // This is a simple simulation. In a real app, you'd want to use a backend service
    try {
      // Basic Python syntax checking
      if (!code.includes('print')) {
        return 'No output (Note: Python execution is simulated. Use print() to see output)';
      }
      
      // Extract print statements and simulate their output
      const printMatches = code.match(/print\((.*?)\)/g) || [];
      const output = printMatches
        .map(match => {
          const content = match.match(/print\((.*?)\)/)[1];
          // Handle both string literals and basic expressions
          try {
            return eval(content);
          } catch {
            return content.replace(/['"]/g, '');
          }
        })
        .join('\n');
      
      return output || 'Code executed successfully!';
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };

  const simulateJavaExecution = () => {
    // This is a simple simulation. In a real app, you'd want to use a backend service
    try {
      // Basic Java syntax checking
      if (!code.includes('class')) {
        return 'Error: No class definition found';
      }
      if (!code.includes('public static void main')) {
        return 'Error: No main method found';
      }
      
      // Extract System.out.println statements and simulate their output
      const printMatches = code.match(/System\.out\.println\((.*?)\);/g) || [];
      const output = printMatches
        .map(match => {
          const content = match.match(/System\.out\.println\((.*?)\);/)[1];
          // Handle string literals
          return content.replace(/['"]/g, '');
        })
        .join('\n');
      
      return output || 'Code executed successfully!';
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };

  const handleRunCode = () => {
    let executionOutput = '';
    
    switch (selectedLanguage) {
      case 'javascript':
        executionOutput = executeJavaScript();
        break;
      case 'python':
        executionOutput = simulatePythonExecution();
        break;
      case 'java':
        executionOutput = simulateJavaExecution();
        break;
      default:
        executionOutput = 'Unsupported language';
    }
    
    setOutput(executionOutput);
    setIsTerminalVisible(true); // Show terminal when running code
    setActiveTab('output');
  };

  const getTerminalCommand = () => {
    const commands = {
      javascript: 'node script.js',
      python: 'python script.py',
      java: 'javac Main.java && java Main',
    };
    return commands[selectedLanguage] || 'echo "Unknown language"';
  };

  const handleRunInTerminal = () => {
    const command = getTerminalCommand();
    setTerminalOutput(`$ ${command}\n${output || 'No output'}`);
    setActiveTab('terminal');
  };

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (courseSnap.exists()) {
          const course = courseSnap.data();
          const lecture = course.lectures.find(l => l.id === lectureId);
          setLecture(lecture);
        }
      } catch (err) {
        console.error('Error fetching lecture:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLecture();
  }, [courseId, lectureId]);

  // Function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="w-full px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate(`/add-lectures/${courseId}`)}
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          {lecture?.title && (
            <h2 className="text-sm font-medium text-gray-400 truncate max-w-md">
              {lecture.title}
            </h2>
          )}
        </div>

        <Split 
          className="flex h-[calc(100vh-8rem)]"
          sizes={[50, 50]}
          minSize={[400, 400]}
          gutterSize={10}
          direction="horizontal"
        >
          {/* Video Section */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="relative w-full h-full flex items-center">
              {lecture?.videoUrl && (
                <div className="w-full">
                  <div className="relative pt-[56.25%]">
                    <YouTube
                      videoId={getYouTubeVideoId(lecture.videoUrl)}
                      opts={{
                        ...youtubeOpts,
                        width: '100%',
                        height: '100%',
                      }}
                      className="absolute top-0 left-0 w-full h-full"
                      containerClassName="absolute top-0 left-0 w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Editor Section */}
          <div className={`bg-gray-900 rounded-lg overflow-hidden ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <div className="flex space-x-2">
                <button
                  onClick={handleRunCode}
                  className="px-4 py-2 bg-[#D4FF56] text-black font-medium rounded hover:bg-[#D4FF56]/90 transition"
                >
                  Run Code
                </button>
                <button
                  onClick={handleRunInTerminal}
                  className="px-4 py-2 bg-gray-800 text-white font-medium rounded hover:bg-gray-700 transition"
                >
                  Run in Terminal
                </button>
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="px-4 py-2 bg-gray-800 text-white font-medium rounded hover:bg-gray-700 transition"
                >
                  {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </button>
              </div>
              <div className="flex space-x-2">
                <select 
                  className="bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4FF56]"
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
            </div>
            <div className="relative h-[calc(100%-4rem)]">
              {/* Editor with scrollbar */}
              <div className="h-full overflow-auto">
                <Editor
                  height="100%"
                  language={selectedLanguage}
                  value={code}
                  options={{
                    ...editorOptions,
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                      useShadows: false,
                      verticalScrollbarSize: 10,
                      horizontalScrollbarSize: 10
                    }
                  }}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                />
              </div>

              {/* Terminal Panel */}
              {isTerminalVisible && (
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800"
                  style={{ height: '40%' }}
                >
                  <div className="flex justify-between items-center border-b border-gray-800">
                    <div className="flex">
                      <button
                        className={`px-4 py-2 text-sm font-medium ${
                          activeTab === 'output'
                            ? 'text-[#D4FF56] border-b-2 border-[#D4FF56]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        onClick={() => setActiveTab('output')}
                      >
                        Output
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium ${
                          activeTab === 'terminal'
                            ? 'text-[#D4FF56] border-b-2 border-[#D4FF56]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        onClick={() => setActiveTab('terminal')}
                      >
                        Terminal
                      </button>
                    </div>
                    <button
                      onClick={() => setIsTerminalVisible(false)}
                      className="px-2 py-1 mr-2 text-gray-400 hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-4 bg-gray-800 h-[calc(100%-2.5rem)] overflow-y-auto font-mono">
                    {activeTab === 'output' ? (
                      <div>
                        <pre className="text-sm text-white whitespace-pre-wrap">{output || 'No output'}</pre>
                      </div>
                    ) : (
                      <div>
                        <pre className="text-sm text-white whitespace-pre-wrap">
                          <span className="text-green-400">$</span> {getTerminalCommand()}
                          {terminalOutput && (
                            <>
                              <br />
                              {terminalOutput}
                            </>
                          )}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Split>

        {/* Move Instructions to a collapsible panel */}
        <div className="mt-6">
          <details className="bg-gray-900 rounded-lg">
            <summary className="p-4 cursor-pointer text-sm font-medium hover:bg-gray-800">
              Show Instructions
            </summary>
            <div className="p-4 border-t border-gray-800">
              <div className="prose prose-invert max-w-none">
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                  <li>Select your preferred programming language</li>
                  <li>Watch the tutorial and code along</li>
                  <li>Run code to see output</li>
                  <li>Use terminal simulation for command-line experience</li>
                  <li>Drag the divider to resize panels</li>
                </ol>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;