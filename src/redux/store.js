import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import coursesReducer from './slices/coursesSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    courses: coursesReducer
  },
});