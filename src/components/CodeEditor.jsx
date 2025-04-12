import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import YouTube from 'react-youtube';

const CodeEditor = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState(getInitialCode('javascript'));
  const [output, setOutput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [activeTab, setActiveTab] = useState('output');
  const [isFullScreen, setIsFullScreen] = useState(false);
  
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
    height: '600',
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-2">Interactive Coding Lesson</h1>
          <p className="text-gray-400">Learn by doing - Code along with the video tutorial</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Video Section */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="relative">
              <YouTube
                videoId={videoId}
                opts={youtubeOpts}
                className="w-full"
                containerClassName="aspect-video"
              />
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
            
            <div className="h-[400px]">
              <Editor
                height="100%"
                language={selectedLanguage}
                value={code}
                options={editorOptions}
                onChange={handleEditorChange}
                theme="vs-dark"
              />
            </div>

            {/* Output Tabs */}
            <div className="border-t border-gray-800">
              <div className="flex border-b border-gray-800">
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

              {/* Output/Terminal Content */}
              <div className="p-4 bg-gray-800 h-[150px] overflow-y-auto font-mono">
                {activeTab === 'output' ? (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Output:</h3>
                    <pre className="text-sm text-white whitespace-pre-wrap">{output}</pre>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Terminal:</h3>
                    <pre className="text-sm text-white whitespace-pre-wrap">
                      <span className="text-green-400">➜</span> {terminalOutput}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Panel */}
        <div className="mt-6 bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Instructions</h2>
          <div className="prose prose-invert max-w-none">
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Select your preferred programming language from the dropdown</li>
              <li>Watch the video tutorial on the left side</li>
              <li>Code along in the editor on the right side</li>
              <li>Use the "Run Code" button to execute your code and see the output</li>
              <li>Use the "Run in Terminal" button to simulate terminal execution</li>
              <li>Switch between Output and Terminal views to see different execution results</li>
              <li>Toggle fullscreen mode for a better coding experience</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;