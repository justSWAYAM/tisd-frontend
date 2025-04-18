import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Editor from '@monaco-editor/react';
import Navbar from './Navbar';
import YouTube from 'react-youtube';
import Split from 'react-split';
import { checkAuth } from '../utils/auth';

const Quiz = ({ quiz, onSubmit }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate that all questions are answered
    if (Object.keys(answers).length !== quiz.questions.length) {
      setValidationError('Please answer all questions before submitting.');
      return;
    }
    
    setValidationError('');
    let correct = 0;
    const questionResults = [];

    quiz.questions.forEach((question, index) => {
      const isCorrect = parseInt(answers[index]) === question.correctAnswer;
      if (isCorrect) correct++;
      
      questionResults.push({
        question: question.questionText,
        userAnswer: question.options[parseInt(answers[index])],
        correctAnswer: question.options[question.correctAnswer],
        isCorrect
      });
    });

    const finalScore = (correct / quiz.questions.length) * 100;
    setScore(finalScore);
    setResults(questionResults);
    setSubmitted(true);
    onSubmit(finalScore, true, questionResults); // Pass score, attempted status, and results
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-[#D4FF56] mb-4">Lecture Quiz</h3>
      <form onSubmit={handleSubmit}>
        {quiz.questions.map((question, qIndex) => (
          <div key={qIndex} className="mb-6 border-b border-gray-800 pb-4">
            <p className="text-white mb-3">{question.questionText}</p>
            <div className="space-y-2">
              {question.options.map((option, oIndex) => (
                <label 
                  key={oIndex} 
                  className={`flex items-center space-x-3 p-2 rounded ${
                    submitted && answers[qIndex] === oIndex.toString()
                      ? question.correctAnswer === oIndex
                        ? 'bg-green-900/20'
                        : 'bg-red-900/20'
                      : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    value={oIndex}
                    onChange={(e) => setAnswers(prev => ({
                      ...prev,
                      [qIndex]: e.target.value
                    }))}
                    disabled={submitted}
                    className="text-[#D4FF56] focus:ring-[#D4FF56]"
                  />
                  <span className={`text-gray-300 ${
                    submitted && question.correctAnswer === oIndex 
                      ? 'text-green-400 font-medium'
                      : ''
                  }`}>
                    {option}
                  </span>
                </label>
              ))}
            </div>
            {submitted && (
              <div className="mt-2 text-sm">
                {parseInt(answers[qIndex]) === question.correctAnswer ? (
                  <span className="text-green-400">✓ Correct</span>
                ) : (
                  <div className="text-red-400">
                    ✗ Incorrect. Correct answer: {question.options[question.correctAnswer]}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {!submitted ? (
          <button
            type="submit"
            className="w-full py-2 bg-[#D4FF56] text-black font-medium rounded hover:bg-[#D4FF56]/90 transition"
          >
            Submit Quiz
          </button>
        ) : (
          <div className="space-y-4">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <p className="text-xl font-bold text-[#D4FF56] mb-2">
                Your Score: {score.toFixed(1)}%
              </p>
              <p className="text-gray-400">
                {score === 100 
                  ? 'Perfect score! 🎉' 
                  : score >= 70 
                    ? 'Good job! 👍' 
                    : 'Keep practicing! 💪'}
              </p>
            </div>
            
            {results.filter(r => !r.isCorrect).length > 0 && (
              <div className="mt-4 p-4 bg-red-900/20 rounded-lg">
                <h4 className="text-red-400 font-medium mb-2">Review Incorrect Answers:</h4>
                {results.filter(r => !r.isCorrect).map((result, index) => (
                  <div key={index} className="mb-2 text-sm text-gray-300">
                    <p className="font-medium text-white">{result.question}</p>
                    <p className="text-red-400">Your answer: {result.userAnswer}</p>
                    <p className="text-green-400">Correct answer: {result.correctAnswer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

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
  const [userData, setUserData] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [hasAttemptedQuiz, setHasAttemptedQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizResults, setQuizResults] = useState([]);

  useEffect(() => {
    const user = checkAuth();
    if (user) {
      setUserData(user);
    }
  }, []);

  // Add function to check if user is teacher of this course
  const isTeacherOfCourse = (course) => {
    return course?.instructorId === userData?.userId;
  };

  // Add course state and fetch course details
  const [course, setCourse] = useState(null);
  
  // Sample YouTube video ID (replace with your actual coding tutorial video ID)
 

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
    const fetchCourseAndLecture = async () => {
      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (courseSnap.exists()) {
          const courseData = { id: courseSnap.id, ...courseSnap.data() };
          setCourse(courseData);
          // Find lecture with its quiz data
          const lecture = courseData.lectures.find(l => l.id === lectureId);
          if (lecture) {
            setLecture(lecture);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndLecture();
  }, [courseId, lectureId]);

  // Add this useEffect after other useEffects
  useEffect(() => {
    const fetchQuizData = async () => {
      if (userData?.userId && lecture?.hasQuiz) {
        try {
          // Check if quiz has been attempted
          const quizAttemptRef = doc(db, 'quizAttempts', `${userData.userId}_${lectureId}`);
          const quizAttemptDoc = await getDoc(quizAttemptRef);
          
          if (quizAttemptDoc.exists()) {
            const quizData = quizAttemptDoc.data();
            setHasAttemptedQuiz(true);
            setQuizSubmitted(true);
            setQuizScore(quizData.score);
            setQuizResults(quizData.results || []);
          } else {
            // Reset quiz states if not attempted
            setHasAttemptedQuiz(false);
            setQuizSubmitted(false);
            setQuizScore(0);
            setQuizResults([]);
          }
        } catch (error) {
          console.error('Error fetching quiz data:', error);
        }
      }
    };

    fetchQuizData();
  }, [lectureId, userData?.userId, lecture?.hasQuiz]);

  // Function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleBack = () => {
    if (isTeacherOfCourse(course)) {
      navigate(`/add-lectures/${courseId}`);
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="w-full px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBack}
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {isTeacherOfCourse(course) ? 'Back to Lectures' : 'Back to Dashboard'}
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

        {/* Quiz Section */}
        {lecture?.quiz && (
          <div className="mt-6 mb-6">
            {!hasAttemptedQuiz ? (
              <Quiz 
                quiz={lecture.quiz}
                onSubmit={async (score, attempted, results) => {
                  try {
                    // Store quiz attempt in database
                    const quizAttemptRef = doc(db, 'quizAttempts', `${userData.userId}_${lectureId}`);
                    await setDoc(quizAttemptRef, {
                      userId: userData.userId,
                      lectureId: lectureId,
                      courseId: courseId,
                      score: score,
                      completedAt: new Date().toISOString(),
                      results: results
                    });

                    setQuizSubmitted(true);
                    setHasAttemptedQuiz(true);
                    setQuizScore(score);
                    setQuizResults(results);
                  } catch (error) {
                    console.error('Error saving quiz attempt:', error);
                    alert('Failed to save quiz results');
                  }
                }}
              />
            ) : (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <h4 className="text-[#D4FF56] font-medium mb-4">Quiz Results</h4>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-900 rounded">
                    <p className="text-2xl font-bold text-[#D4FF56]">
                      Score: {quizScore.toFixed(1)}%
                    </p>
                    <p className="text-gray-400 mt-2">
                      {quizScore === 100 ? '🎉 Perfect!' : quizScore >= 70 ? '👍 Well done!' : '💪 Keep practicing!'}
                    </p>
                  </div>
                  {quizResults.filter(r => !r.isCorrect).length > 0 && (
                    <div className="mt-4 p-4 bg-red-900/20 rounded-lg">
                      <h4 className="text-red-400 font-medium mb-2">Review Incorrect Answers:</h4>
                      {quizResults.filter(r => !r.isCorrect).map((result, index) => (
                        <div key={index} className="mb-2 text-sm text-gray-300">
                          <p className="font-medium text-white">{result.question}</p>
                          <p className="text-red-400">Your answer: {result.userAnswer}</p>
                          <p className="text-green-400">Correct answer: {result.correctAnswer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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