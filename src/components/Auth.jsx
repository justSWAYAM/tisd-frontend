// login /singup chota sa

import React, { useState } from 'react';

const [isLoading, setIsLoading] = useState(false);

const validateForm = () => {
  if (!email || !password) {
    setError('Please fill in all fields');
    return false;
  }
  if (password.length < 6) {
    setError('Password must be at least 6 characters');
    return false;
  }
  return true;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  
  if (!validateForm()) {
    return;
  }
  
  setIsLoading(true);

  try {
    // ... existing code ...
  } catch (err) {
    console.error('Auth error:', err);
    let errorMessage = 'Authentication failed';
    
    if (err.code) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Email is already registered';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'permission-denied':
          errorMessage = 'Access denied. Please try again.';
          break;
        default:
          errorMessage = err.message;
      }
    }
    
    setError(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

{!isLogin && (
  <div>
    <label className="block text-sm font-medium mb-2 text-gray-300">
      I want to join as a
    </label>
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => setRole('student')}
        disabled={isLoading}
        className={`p-4 rounded-xl border-2 transition-colors ${
          role === 'student'
            ? 'border-[#D4FF56] bg-[#D4FF56]/10 text-[#D4FF56]'
            : 'border-gray-800 hover:border-gray-700 text-gray-400'
        }`}
      >
        <div className="flex flex-col items-center">
          <span className="text-2xl mb-2">🎓</span>
          <span className="font-medium">Student</span>
        </div>
      </button>
      <button
        type="button"
        onClick={() => setRole('teacher')}
        disabled={isLoading}
        className={`p-4 rounded-xl border-2 transition-colors ${
          role === 'teacher'
            ? 'border-[#D4FF56] bg-[#D4FF56]/10 text-[#D4FF56]'
            : 'border-gray-800 hover:border-gray-700 text-gray-400'
        }`}
      >
        <div className="flex flex-col items-center">
          <span className="text-2xl mb-2">👨‍</span>
          <span className="font-medium">Teacher</span>
        </div>
      </button>
    </div>
  </div>
)}

<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4FF56] focus:border-transparent transition-colors"
  placeholder="Enter your email"
  required
  disabled={isLoading}
/>

<button
  type="submit"
  disabled={isLoading}
  className={`w-full py-3 bg-[#D4FF56] text-black font-medium rounded-xl transition-colors text-lg ${
    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#D4FF56]/90'
  }`}
>
  {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
</button>