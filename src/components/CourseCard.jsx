import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, isTeacher = false, onEnroll, isEnrolled }) => {
  const { id, title, instructor, price, level, thumbnail, thumbnailUrl, rating } = course;
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const defaultThumbnail = 'https://placehold.co/600x400?text=Course+Thumbnail';
  const imageUrl = thumbnailUrl || thumbnail || defaultThumbnail;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-black border border-gray-800 rounded-lg overflow-hidden hover:border-[#D4FF56] transition-all duration-300">
      <div className="relative">
        <img 
          src={imageError ? defaultThumbnail : imageUrl}
          alt={title}
          onError={handleImageError}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        <div className="absolute top-4 right-4 bg-[#D4FF56] text-black px-2 py-1 rounded text-sm font-medium">
          {level}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">by {instructor}</p>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-[#D4FF56]' : 'text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-gray-400 text-sm">({rating})</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">${price}</span>
          {isTeacher ? (
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-red-500 text-white font-medium rounded hover:bg-red-600 transition"
                onClick={() => {/* Handle remove functionality */}}
              >
                Remove
              </button>
              <button 
                className="px-4 py-2 bg-[#D4FF56] text-black font-medium rounded hover:bg-[#D4FF56]/90 transition"
                onClick={() => navigate(`/add-lectures/${id}`)}
              >
                Add Lectures
              </button>
            </div>
          ) : (
            <button 
              onClick={onEnroll}
              disabled={isEnrolled}
              className={`px-4 py-2 ${
                isEnrolled 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-[#D4FF56] hover:bg-[#D4FF56]/90'
              } text-black font-medium rounded transition`}
            >
              {isEnrolled ? 'Enrolled' : 'Enroll Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;