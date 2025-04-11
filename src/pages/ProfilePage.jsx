import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { auth } from '../firebase/config';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { role, data } = useSelector((state) => state.user);
  const [formData, setFormData] = useState(
    role === 'student'
      ? {
          name: '',
          school: '',
          class: '',
          age: '',
          degree: '',
        }
      : {
          name: '',
          currentOrganization: '',
          experience: '',
          qualification: '',
          mobileNo: '',
        }
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill form data if available in Redux store
  useEffect(() => {
    if (data) {
      // Only update fields that exist in the current form
      const updatedFormData = { ...formData };
      Object.keys(formData).forEach(key => {
        if (data[key]) {
          updatedFormData[key] = data[key];
        }
      });
      setFormData(updatedFormData);
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error("You are not signed in. Please sign in and try again.");
      }

      // Get the Firebase ID token
      const token = await auth.currentUser.getIdToken(true); // Force token refresh
      
      // Update profile using the API
      const response = await axios.put(
        'http://localhost:4000/api/profile/update',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile. Please try signing in again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#D4FF56] to-purple-500 bg-clip-text text-transparent">
            Complete Your Profile
          </h1>
          <p className="text-gray-400">
            Help us personalize your {role === 'student' ? 'learning' : 'teaching'} experience
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Input - Common for both */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4FF56] focus:border-transparent transition-colors"
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>

            {role === 'student' ? (
              <>
                {/* School Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    School/College
                  </label>
                  <input
                    type="text"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4FF56] focus:border-transparent transition-colors"
                    placeholder="Enter your school/college name"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Class Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Class/Year
                  </label>
                  <input
                    type="text"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4FF56] focus:border-transparent transition-colors"
                    placeholder="Enter your class/year"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Age Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4FF56] focus:border-transparent transition-colors"
                    placeholder="Enter your age"
                    required
                    min="13"
                    max="100"
                    disabled={loading}
                  />
                </div>

                {/* Degree Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Degree
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['BTech/BE', 'SSC', 'HSC'].map((degree) => (
                      <button
                        key={degree}
                        type="button"
                        onClick={() => setFormData({ ...formData, degree })}
                        className={`p-4 rounded-xl border-2 transition-colors ${
                          formData.degree === degree
                            ? 'border-[#D4FF56] bg-[#D4FF56]/10 text-[#D4FF56]'
                            : 'border-gray-800 hover:border-gray-700 text-gray-400'
                        }`}
                        disabled={loading}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-2xl mb-2">
                            {degree === 'BTech/BE' ? '🎓' : degree === 'SSC' ? '📚' : '📖'}
                          </span>
                          <span className="font-medium">{degree}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Current Organization */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Current Organization
                  </label>
                  <input
                    type="text"
                    value={formData.currentOrganization}
                    onChange={(e) => setFormData({ ...formData, currentOrganization: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4FF56] focus:border-transparent transition-colors"
                    placeholder="Enter your current organization"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4FF56] focus:border-transparent transition-colors"
                    placeholder="Enter years of experience"
                    required
                    min="0"
                    disabled={loading}
                  />
                </div>

                {/* Qualification */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Highest Qualification
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4FF56] focus:border-transparent transition-colors"
                    placeholder="Enter your highest qualification"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={formData.mobileNo}
                    onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4FF56] focus:border-transparent transition-colors"
                    placeholder="Enter your mobile number"
                    required
                    pattern="[0-9]{10}"
                    disabled={loading}
                  />
                </div>
              </>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full py-4 bg-[#D4FF56] text-black font-medium rounded-xl hover:bg-[#D4FF56]/90 transition-colors text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating Profile...</span>
                </>
              ) : (
                <>
                  <span>Complete Profile</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;