import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { GoogleGenAI } from "@google/genai";
import Navbar from '../components/Navbar';
import LectureCard from '../components/LectureCard';

// Improved API key validation
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Missing VITE_GEMINI_API_KEY in environment variables');
}

// Initialize the API with proper configuration
const ai = new GoogleGenAI({ apiKey: API_KEY });

const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #111827;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #374151;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #4B5563;
  }
`;

const AddLectures = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [newLecture, setNewLecture] = useState({ 
    title: '', 
    description: '',
    videoUrl: '' 
  });
  const [includeQuiz, setIncludeQuiz] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('addLecture'); // 'addLecture' or 'existingLectures'
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (courseSnap.exists()) {
          setCourse({ id: courseSnap.id, ...courseSnap.data() });
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError('Error fetching course');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    // Add custom scrollbar styles
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  const handleAddAttachment = () => {
    const attachmentName = prompt("Enter attachment name:");
    const attachmentUrl = prompt("Enter attachment URL:");
    
    if (attachmentName && attachmentUrl) {
      setAttachments(prev => [
        ...prev, 
        { name: attachmentName, url: attachmentUrl }
      ]);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Helper function to process response text
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

  const generateQuiz = async () => {
    if (!newLecture.videoUrl || !newLecture.title) {
      alert('Please provide both lecture title and video URL to generate quiz');
      return;
    }

    setIsGeneratingQuiz(true);
    try {
      // Create a chat instance
      const chat = ai.chats.create({
        model: "gemini-2.0-flash"
      });
      
      const prompt = `
      Generate 5 multiple-choice questions (MCQs) based on the educational video at URL: ${newLecture.videoUrl}
      Create challenging but fair questions that test understanding of key concepts from the video titled "${newLecture.title}".
      Each question should have 4 options with only one correct answer.
      
      Return the result as JSON with the following structure:
      {
        "questions": [
          {
            "questionText": "Question 1?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0
          }
        ]
      }
      
      Where correctAnswer is the index (0-3) of the correct option.
      The response MUST be valid JSON with no additional text or explanation.
      `;

      // Send message and get response
      const response = await chat.sendMessage({
        message: prompt
      });

      // Extract JSON from the response
      const text = response.text;
      const processedResponse = processResponseText(text);

      if (processedResponse.formattedContent.questions) {
        // Transform to match the expected format if needed
        const formattedQuestions = processedResponse.formattedContent.questions.map(q => {
          // If correctAnswer is a string, convert to index
          if (typeof q.correctAnswer === 'string') {
            q.correctAnswer = q.options.indexOf(q.correctAnswer);
          }
          return q;
        });
        setQuizQuestions(formattedQuestions);
      } else {
        throw new Error("Invalid quiz format returned");
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz: ' + error.message);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const updateQuestionText = (index, newText) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[index].questionText = newText;
    setQuizQuestions(updatedQuestions);
  };

  const updateOptionText = (questionIndex, optionIndex, newText) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[questionIndex].options[optionIndex] = newText;
    setQuizQuestions(updatedQuestions);
  };

  const updateCorrectAnswer = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[questionIndex].correctAnswer = optionIndex;
    setQuizQuestions(updatedQuestions);
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a unique lecture ID
      const lectureId = Date.now().toString();
      
      // Create the lecture data object with quiz included
      const newLectureData = {
        id: lectureId,
        title: newLecture.title,
        description: newLecture.description || '',
        videoUrl: newLecture.videoUrl,
        attachments: attachments,
        createdAt: new Date().toISOString(),
        hasQuiz: includeQuiz && quizQuestions.length > 0,
        quiz: includeQuiz && quizQuestions.length > 0 ? {
          questions: quizQuestions,
          createdAt: new Date().toISOString()
        } : null
      };

      // Add lecture to course
      await updateDoc(doc(db, 'courses', courseId), {
        lectures: arrayUnion(newLectureData)
      });

      // Update local state
      setCourse(prev => ({
        ...prev,
        lectures: [...(prev.lectures || []), newLectureData]
      }));

      // Reset form
      setNewLecture({ title: '', description: '', videoUrl: '' });
      setIncludeQuiz(false);
      setQuizQuestions([]);
      setAttachments([]);
      alert('Lecture added successfully!');
      setActiveTab('existingLectures');
    } catch (error) {
      console.error('Error adding lecture:', error);
      alert('Failed to add lecture: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveLecture = async (lectureId) => {
    if (!window.confirm('Are you sure you want to remove this lecture?')) return;

    try {
      const updatedLectures = course.lectures.filter(lecture => lecture.id !== lectureId);
      const courseRef = doc(db, 'courses', courseId);
      
      // Remove lecture
      await updateDoc(courseRef, {
        lectures: updatedLectures
      });
      
      // Remove associated quiz if it exists
      if (course.quizzes && course.quizzes.some(quiz => quiz.lectureId === lectureId)) {
        const updatedQuizzes = course.quizzes.filter(quiz => quiz.lectureId !== lectureId);
        
        await updateDoc(courseRef, {
          quizzes: updatedQuizzes
        });
        
        setCourse(prev => ({
          ...prev,
          lectures: updatedLectures,
          quizzes: updatedQuizzes
        }));
      } else {
        setCourse(prev => ({
          ...prev,
          lectures: updatedLectures
        }));
      }

      alert('Lecture removed successfully!');
    } catch (error) {
      console.error('Error removing lecture:', error);
      alert('Failed to remove lecture: ' + error.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4FF56]"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
      <div className="bg-red-900/30 border border-red-500 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={() => navigate('/lectures')}
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </button>
          
          <h1 className="text-3xl font-bold text-[#D4FF56]">{course?.title || 'Course'} Lectures</h1>
          
          {/* Mobile tab selector */}
          <div className="sm:hidden">
            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white"
            >
              <option value="addLecture">Add Lecture</option>
              <option value="existingLectures">Existing Lectures</option>
            </select>
          </div>
          
          {/* Desktop tab buttons */}
          <div className="hidden sm:flex gap-4">
            <button 
              onClick={() => setActiveTab('addLecture')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'addLecture' 
                  ? 'bg-[#D4FF56] text-black' 
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              Add Lecture
            </button>
            <button 
              onClick={() => setActiveTab('existingLectures')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'existingLectures' 
                  ? 'bg-[#D4FF56] text-black' 
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              Existing Lectures
            </button>
          </div>
        </div>

        {/* Mobile View - Conditional rendering based on active tab */}
        <div className="sm:hidden">
          {activeTab === 'addLecture' ? (
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-8">
              <h2 className="text-2xl font-bold mb-6">Add New Lecture</h2>
              <form onSubmit={handleAddLecture} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Lecture Title
                  </label>
                  <input
                    type="text"
                    value={newLecture.title}
                    onChange={(e) => setNewLecture(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#D4FF56]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newLecture.description}
                    onChange={(e) => setNewLecture(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-black border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#D4FF56] min-h-[100px]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={newLecture.videoUrl}
                    onChange={(e) => setNewLecture(prev => ({ ...prev, videoUrl: e.target.value }))}
                    className="w-full bg-black border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#D4FF56]"
                    required
                  />
                </div>
                
                {/* Attachments section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-400">
                      Attachments
                    </label>
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded-md text-sm"
                    >
                      Add Attachment
                    </button>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="bg-gray-800 p-3 rounded-lg mb-2">
                      <ul className="space-y-2">
                        {attachments.map((attachment, index) => (
                          <li key={index} className="flex items-center justify-between p-2 bg-gray-900 rounded">
                            <div>
                              <span className="text-white">{attachment.name}</span>
                              <a 
                                href={attachment.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-2 text-blue-400 hover:text-blue-300 text-sm"
                              >
                                (View Link)
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-400"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeQuiz"
                    checked={includeQuiz}
                    onChange={(e) => {
                      setIncludeQuiz(e.target.checked);
                      if (!e.target.checked) {
                        setQuizQuestions([]);
                      }
                    }}
                    className="w-5 h-5 rounded bg-black border-gray-700 text-[#D4FF56] focus:ring-[#D4FF56]"
                  />
                  <label htmlFor="includeQuiz" className="ml-2 text-gray-300">
                    Include Auto-generated Quiz
                  </label>
                </div>
                
                {includeQuiz && (
                  <div>
                    {newLecture.videoUrl && newLecture.title ? (
                      <button
                        type="button"
                        onClick={generateQuiz}
                        disabled={isGeneratingQuiz}
                        className={`w-full mb-4 py-3 bg-gray-800 text-white font-medium rounded hover:bg-gray-700 transition ${
                          isGeneratingQuiz ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isGeneratingQuiz ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></span>
                            Generating Quiz...
                          </span>
                        ) : 'Generate Quiz Questions'}
                      </button>
                    ) : (
                      <p className="text-yellow-400 text-sm mb-4">
                        Enter lecture title and video URL to generate quiz questions
                      </p>
                    )}
                    
                    {quizQuestions.length > 0 && (
                      <div className="bg-gray-800 p-4 rounded-lg mb-4">
                        <h3 className="text-lg font-medium text-[#D4FF56] mb-4">Quiz Questions</h3>
                        
                        {quizQuestions.map((question, qIndex) => (
                          <div key={qIndex} className="mb-6 p-4 bg-gray-900 rounded-lg">
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-400 mb-2">
                                Question {qIndex + 1}
                              </label>
                              <input
                                type="text"
                                value={question.questionText}
                                onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                                className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                              />
                            </div>
                            
                            <div className="space-y-3">
                              {question.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    id={`q${qIndex}o${oIndex}`}
                                    name={`question${qIndex}`}
                                    checked={question.correctAnswer === oIndex}
                                    onChange={() => updateCorrectAnswer(qIndex, oIndex)}
                                    className="w-4 h-4 text-[#D4FF56] focus:ring-[#D4FF56]"
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                                    className="flex-1 bg-black border border-gray-800 rounded px-3 py-2 text-white"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting || (includeQuiz && quizQuestions.length === 0)}
                  className={`w-full py-3 bg-[#D4FF56] text-black font-medium rounded hover:bg-[#D4FF56]/90 transition ${
                    isSubmitting || (includeQuiz && quizQuestions.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Adding...' : 'Add Lecture'}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-6">Course Lectures</h2>
              <div className="space-y-4">
                {course.lectures?.length === 0 ? (
                  <p className="text-gray-400">No lectures added yet.</p>
                ) : (
                  course.lectures?.map((lecture, index) => (
                    <LectureCard
                      key={`${lecture.id}-${index}`}
                      lecture={lecture} // lecture already has hasQuiz property
                      index={index}
                      courseId={courseId}
                      isTeacher={true}
                      onRemove={handleRemoveLecture}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop View - Grid layout */}
        <div className="hidden sm:grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Add Lecture Form */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">Add New Lecture</h2>
            <form onSubmit={handleAddLecture} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Lecture Title
                </label>
                <input
                  type="text"
                  value={newLecture.title}
                  onChange={(e) => setNewLecture(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-black border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#D4FF56]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={newLecture.description}
                  onChange={(e) => setNewLecture(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-black border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#D4FF56] min-h-[100px]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  value={newLecture.videoUrl}
                  onChange={(e) => setNewLecture(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="w-full bg-black border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#D4FF56]"
                  required
                />
              </div>
              
              {/* Attachments section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-400">
                    Attachments
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded-md text-sm"
                  >
                    Add Attachment
                  </button>
                </div>
                
                {attachments.length > 0 && (
                  <div className="bg-gray-800 p-3 rounded-lg mb-2">
                    <ul className="space-y-2">
                      {attachments.map((attachment, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-gray-900 rounded">
                          <div>
                            <span className="text-white">{attachment.name}</span>
                            <a 
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-400 hover:text-blue-300 text-sm"
                            >
                              (View Link)
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-500 hover:text-red-400"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeQuizDesktop"
                  checked={includeQuiz}
                  onChange={(e) => {
                    setIncludeQuiz(e.target.checked);
                    if (!e.target.checked) {
                      setQuizQuestions([]);
                    }
                  }}
                  className="w-5 h-5 rounded bg-black border-gray-700 text-[#D4FF56] focus:ring-[#D4FF56]"
                />
                <label htmlFor="includeQuizDesktop" className="ml-2 text-gray-300">
                  Include Auto-generated Quiz
                </label>
              </div>
              
              {includeQuiz && (
                <div>
                  {newLecture.videoUrl && newLecture.title ? (
                    <button
                      type="button"
                      onClick={generateQuiz}
                      disabled={isGeneratingQuiz}
                      className={`w-full mb-4 py-3 bg-gray-800 text-white font-medium rounded hover:bg-gray-700 transition ${
                        isGeneratingQuiz ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isGeneratingQuiz ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></span>
                          Generating Quiz...
                        </span>
                      ) : 'Generate Quiz Questions'}
                    </button>
                  ) : (
                    <p className="text-yellow-400 text-sm mb-4">
                      Enter lecture title and video URL to generate quiz questions
                    </p>
                  )}
                  
                  {quizQuestions.length > 0 && (
                    <div className="bg-gray-800 p-4 rounded-lg mb-4 max-h-96 overflow-y-auto custom-scrollbar">
                      <h3 className="text-lg font-medium text-[#D4FF56] mb-4">Quiz Questions</h3>
                      
                      {quizQuestions.map((question, qIndex) => (
                        <div key={qIndex} className="mb-6 p-4 bg-gray-900 rounded-lg">
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              Question {qIndex + 1}
                            </label>
                            <input
                              type="text"
                              value={question.questionText}
                              onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                              className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                            />
                          </div>
                          
                          <div className="space-y-3">
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  id={`q${qIndex}o${oIndex}desktop`}
                                  name={`question${qIndex}desktop`}
                                  checked={question.correctAnswer === oIndex}
                                  onChange={() => updateCorrectAnswer(qIndex, oIndex)}
                                  className="w-4 h-4 text-[#D4FF56] focus:ring-[#D4FF56]"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                                  className="flex-1 bg-black border border-gray-800 rounded px-3 py-2 text-white"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || (includeQuiz && quizQuestions.length === 0)}
                className={`w-full py-3 bg-[#D4FF56] text-black font-medium rounded hover:bg-[#D4FF56]/90 transition ${
                  isSubmitting || (includeQuiz && quizQuestions.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Adding...' : 'Add Lecture'}
              </button>
            </form>
          </div>

          {/* Right Column - Existing Lectures */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Course Lectures</h2>
            <div className="space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar pr-2">
              {course.lectures?.length === 0 ? (
                <p className="text-gray-400">No lectures added yet.</p>
              ) : (
                course.lectures?.map((lecture, index) => (
                  <LectureCard
                    key={`${lecture.id}-${index}`}
                    lecture={lecture} // lecture already has hasQuiz property
                    index={index}
                    courseId={courseId}
                    isTeacher={true}
                    onRemove={handleRemoveLecture}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLectures;