import { createSlice } from '@reduxjs/toolkit';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const initialState = {
  role: null,
  data: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setUserData: (state, action) => {
      state.data = action.payload;
    },
    clearUser: (state) => {
      state.role = null;
      state.data = null;
    },
  },
});

export const {
  setRole,
  setUserData,
  clearUser,
} = userSlice.actions;

// Thunk for fetching user data
export const fetchUserData = (userId, role) => async (dispatch) => {
  try {
    // Get role-specific data
    const roleDoc = await getDoc(doc(db, `${role}s`, userId));
    if (roleDoc.exists()) {
      dispatch(setRole(role));
      dispatch(setUserData(roleDoc.data()));
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

export default userSlice.reducer; 