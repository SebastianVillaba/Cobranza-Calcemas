import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    totalCobro: 0,
};

export const cobroSlice = createSlice({
    name: 'cobro',
    initialState,
    reducers: {
        agregarPago: (state, action) => {
            state.totalCobro += Number(action.payload) || 0;
        },
        resetearCobro: (state) => {
            state.totalCobro = 0;
        },
    },
});

export const { agregarPago, resetearCobro } = cobroSlice.actions;

export const selectTotalCobro = (state) => state.cobro.totalCobro;

export default cobroSlice.reducer;
