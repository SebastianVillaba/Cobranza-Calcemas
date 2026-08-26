import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  idCobrador: null,
  nombreCobrador: null,
  idUsuario: null,
  token: null,
  status: 'idle',
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setIdCobrador: (state, action) => {
      state.idCobrador = action.payload;
    },
    setIdUsuario: (state, action) => {
      state.idUsuario = action.payload;
    },
    setUserData: (state, action) => {
      state.idCobrador = action.payload.idCobrador;
      state.nombreCobrador = action.payload.nombreCobrador;
      state.idUsuario = action.payload.idUsuario;
      state.token = action.payload.token;
    },
    clearUser: (state) => {
      state.idCobrador = null;
      state.nombreCobrador = null;
      state.idUsuario = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { setIdCobrador, setIdUsuario, setUserData, clearUser } = userSlice.actions;

export const selectIdCobrador = (state) => state.user.idCobrador;
export const selectNombreCobrador = (state) => state.user.nombreCobrador;
export const selectIdUsuario = (state) => state.user.idUsuario;

export default userSlice.reducer;
