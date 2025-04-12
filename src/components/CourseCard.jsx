import React from 'react';

const CourseCard = ({ course }) => {
  const { title, instructor, price, duration, level, thumbnail, rating } = course;

  return (
    <div className="bg-black border border-gray-800 rounded-lg overflow-hidden hover:border-[#D4FF56] transition-all duration-300">
      <div className="relative">
        <img 
          src={thumbnail} 
          alt={title} 
          className="w-full h-48 object-cover"
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

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">${price}</span>
          <button className="px-4 py-2 bg-[#D4FF56] text-black font-medium rounded hover:bg-[#D4FF56]/90 transition">
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;