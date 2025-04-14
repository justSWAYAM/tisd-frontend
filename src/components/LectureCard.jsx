import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import SummarizerButton from './SummarizerButton';

const LectureCard = ({ 
  lecture, 
  index, 
  courseId, 
  course,
  isTeacher, 
  onRemove, 
  onEdit,  
  isCompleted,
  onUpdateStudent,
  studentData
}) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem('userData'));

  useEffect(() => {
    const fetchQuizScore = async () => {
      if (!isTeacher && userData?.userId && lecture.hasQuiz) {
        try {
          const quizAttemptRef = doc(db, 'quizAttempts', `${userData.userId}_${lecture.id}`);
          const quizAttemptDoc = await getDoc(quizAttemptRef);
          
          if (quizAttemptDoc.exists()) {
            setQuizScore(quizAttemptDoc.data().score);
          }
        } catch (error) {
          console.error('Error fetching quiz score:', error);
        }
      }
      setLoading(false);
    };

    fetchQuizScore();
  }, [lecture.id, userData?.userId, isTeacher, lecture.hasQuiz]);

  const handleComplete = async () => {
    if (!auth.currentUser) return;
    
    setIsUpdating(true);
    try {
      const studentRef = doc(db, 'students', auth.currentUser.uid);
      const studentSnap = await getDoc(studentRef);
      
      if (!studentSnap.exists()) {
        throw new Error('Student document not found');
      }

      const currentStudentData = studentSnap.data();
      const enrolledCourses = [...(currentStudentData.enrolledCourses || [])];
      
      const courseIndex = enrolledCourses.findIndex(c => c.courseId === courseId);
      
      if (courseIndex === -1) {
        throw new Error('Course not found in enrolled courses');
      }

      if (!enrolledCourses[courseIndex].completedLectures) {
        enrolledCourses[courseIndex].completedLectures = [];
      }

      const completedLectures = enrolledCourses[courseIndex].completedLectures;

      if (completedLectures.includes(lecture.id)) {
        const index = completedLectures.indexOf(lecture.id);
        completedLectures.splice(index, 1);
      } else {
        completedLectures.push(lecture.id);
      }

      const totalLectures = course?.lectures?.length || 1;
      enrolledCourses[courseIndex].progress = Math.round((completedLectures.length / totalLectures) * 100);

      await updateDoc(studentRef, {
        enrolledCourses: enrolledCourses,
        updatedAt: new Date().toISOString()
      });

      if (onUpdateStudent) {
        onUpdateStudent({
          ...currentStudentData,
          enrolledCourses: enrolledCourses
        });
      }

    } catch (error) {
      console.error('Error updating lecture status:', error);
      alert('Failed to update lecture status: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWatchVideo = () => {
    navigate(`/code/${courseId}/${lecture.id}`);
  };

  return (
    <div className={`p-6 bg-gray-900 rounded-lg border ${
      isCompleted ? 'border-[#D4FF56]/50' : 'border-gray-800'
    }`}>
      <div className="flex items-center gap-4">
        <span className="text-2xl text-[#D4FF56] font-medium">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-white">{lecture.title}</h3>
              {lecture.hasQuiz && (
                <span className="px-2 py-0.5 text-xs font-medium bg-[#D4FF56]/20 text-[#D4FF56] rounded-full">
                  Has Quiz
                </span>
              )}
              {!isTeacher && quizScore !== null && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-800 text-gray-300 rounded-full">
                  Score: {quizScore.toFixed(1)}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isTeacher && (
                <button
                  onClick={handleComplete}
                  disabled={isUpdating}
                  className={`text-sm px-3 py-1 rounded-full transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-[#D4FF56]/20 text-[#D4FF56]' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUpdating ? 'Updating...' : isCompleted ? 'Completed' : 'Mark Complete'}
                </button>
              )}
              <button
                onClick={handleWatchVideo}
                className="px-4 py-2 bg-[#D4FF56] text-black rounded-full hover:bg-[#D4FF56]/90 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isCompleted ? 'Review Video' : 'Watch Video'}
              </button>
              {isTeacher && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(lecture)}
                    className="text-blue-400 hover:text-blue-300 p-1 rounded"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onRemove(lecture.id)}
                    className="text-red-500 hover:text-red-400 p-1 rounded"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          {!isTeacher && (
            <div className="mt-3">
              <SummarizerButton lectureId={lecture.id} videoUrl={lecture.videoUrl} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LectureCard;