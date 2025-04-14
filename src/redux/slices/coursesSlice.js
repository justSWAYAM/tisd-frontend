import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  teacherCourses: [],
  loading: false,
  error: null
};

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    addCourse: (state, action) => {
      state.teacherCourses.push(action.payload);
    },
    setTeacherCourses: (state, action) => {
      state.teacherCourses = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { addCourse, setTeacherCourses, setLoading, setError } = coursesSlice.actions;
export default coursesSlice.reducer;