import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

const LectureCard = ({ 
  lecture, 
  index, 
  courseId, // We'll use this from props instead of useParams
  course,
  isTeacher, 
  onRemove, 
  isCompleted,
  onUpdateStudent,
  studentData
}) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

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
      
      // Find the enrolled course using courseId from props
      const courseIndex = enrolledCourses.findIndex(c => c.courseId === courseId);
      
      if (courseIndex === -1) {
        throw new Error('Course not found in enrolled courses');
      }

      // Initialize completedLectures if it doesn't exist
      if (!enrolledCourses[courseIndex].completedLectures) {
        enrolledCourses[courseIndex].completedLectures = [];
      }

      // Get reference to completedLectures array
      const completedLectures = enrolledCourses[courseIndex].completedLectures;

      // Toggle lecture completion
      if (completedLectures.includes(lecture.id)) {
        // Remove lecture if already completed
        const index = completedLectures.indexOf(lecture.id);
        completedLectures.splice(index, 1);
      } else {
        // Add lecture to completed
        completedLectures.push(lecture.id);
      }

      // Calculate progress
      const totalLectures = course?.lectures?.length || 1;
      enrolledCourses[courseIndex].progress = Math.round((completedLectures.length / totalLectures) * 100);

      // Update document
      await updateDoc(studentRef, {
        enrolledCourses: enrolledCourses,
        updatedAt: new Date().toISOString()
      });

      // Update parent component
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
            <h3 className="text-lg font-medium text-white">{lecture.title}</h3>
            {isTeacher ? (
              <button
                onClick={() => onRemove(lecture.id)}
                className="text-red-500 hover:text-red-400 p-1 rounded"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            ) : (
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
          </div>
          <button
            onClick={() => navigate(`/code/${courseId}/${lecture.id}`)}
            className="text-sm text-gray-400 hover:text-[#D4FF56] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isCompleted ? 'Review Video' : 'Watch Video'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LectureCard;