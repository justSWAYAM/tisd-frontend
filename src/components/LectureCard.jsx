import React from 'react';
import { useNavigate } from 'react-router-dom';

const LectureCard = ({ lecture, index, courseId, isTeacher, onRemove, onComplete, isCompleted }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
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
                onClick={() => onComplete(lecture.id)}
                className={`text-sm px-3 py-1 rounded-full ${
                  isCompleted 
                    ? 'bg-[#D4FF56]/20 text-[#D4FF56]' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {isCompleted ? 'Completed' : 'Mark Complete'}
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
            Watch Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default LectureCard;