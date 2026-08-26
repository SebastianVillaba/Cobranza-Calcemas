import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import cobroReducer from '../features/cobro/cobroSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    cobro: cobroReducer,
  },
});
