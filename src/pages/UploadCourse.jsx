import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

const UploadCourse = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    level: 'Beginner',
    category: 'Web Development',
    thumbnailUrl: 'https://placehold.co/600x400?text=Course+Thumbnail', // Default thumbnail
    videoUrl: '',
  });

  const categories = ["Web Development", "Data Science", "Mobile Development", "Design", "Business"];
  const levels = ["Beginner", "Intermediate", "Advanced"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert('Please login first');
      return;
    }

    try {
      setIsUploading(true);

      // Add course to Firestore
      const courseRef = await addDoc(collection(db, 'courses'), {
        ...courseData,
        instructor: auth.currentUser.displayName || 'Anonymous',
        instructorId: auth.currentUser.uid,
        rating: 0,
        studentsEnrolled: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      alert('Course uploaded successfully!');
      navigate('/store');
    } catch (error) {
      console.error('Error uploading course:', error);
      alert('Error uploading course. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Upload New Course</h1>
          <p className="text-gray-400 text-lg">Share your knowledge with the world</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Course Title
            </label>
            <input
              type="text"
              name="title"
              required
              value={courseData.title}
              onChange={handleInputChange}
              className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4FF56] text-white"
              placeholder="Enter course title"
            />
          </div>

          {/* Course Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Course Description
            </label>
            <textarea
              name="description"
              required
              value={courseData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4FF56] text-white"
              placeholder="Enter course description"
            />
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Price (USD)
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={courseData.price}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4FF56] text-white"
                placeholder="29.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Duration (hours)
              </label>
              <input
                type="number"
                name="duration"
                required
                min="1"
                value={courseData.duration}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4FF56] text-white"
                placeholder="10"
              />
            </div>
          </div>

          {/* Category and Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Category
              </label>
              <select
                name="category"
                required
                value={courseData.category}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4FF56] text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Level
              </label>
              <select
                name="level"
                required
                value={courseData.level}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4FF56] text-white"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Course Thumbnail URL (optional)
            </label>
            <input
              type="url"
              name="thumbnailUrl"
              value={courseData.thumbnailUrl}
              onChange={handleInputChange}
              className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4FF56] text-white"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-gray-500 text-xs mt-1">Leave default to use a placeholder image</p>
          </div>

          {/* Thumbnail Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Thumbnail Preview
            </label>
            <div className="w-full h-40 bg-gray-900 border border-gray-800 rounded overflow-hidden">
              <img 
                src={courseData.thumbnailUrl} 
                alt="Course thumbnail preview" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                }}
              />
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Course Video URL (YouTube)
            </label>
            <input
              type="url"
              name="videoUrl"
              required
              value={courseData.videoUrl}
              onChange={handleInputChange}
              className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4FF56] text-white"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isUploading}
              className={`w-full px-6 py-3 bg-[#D4FF56] text-black font-medium rounded hover:bg-[#D4FF56]/90 transition ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadCourse;