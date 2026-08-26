import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Typography, Modal, IconButton, Divider, Paper, Button, TextField, Checkbox, FormControlLabel, CircularProgress, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { agregarPago } from '../features/cobro/cobroSlice';
import axios from 'axios';
import api from '../services/api';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: '70%', md: '500px' },
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 2,
    p: { xs: 2, sm: 3 },
    outline: 'none',
};

const backdropStyle = {
    backdropFilter: 'blur(3px)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
};

const currencyFmt = new Intl.NumberFormat('es-PY', { style: 'decimal', maximumFractionDigits: 0 });
const formatMonto = (v) => currencyFmt.format(Number(v) || 0);

const PagoModal = ({ open, onClose, cuota, onConfirmarPago, idCobrador, idMovimiento }) => {
    const dispatch = useDispatch();
    const [montoAPagar, setMontoAPagar] = useState('');
    const [pagarTodo, setPagarTodo] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            setMontoAPagar('');
            setPagarTodo(false);
            setError(null);
            setIsSubmitting(false);
        }
    }, [open]);

    if (!cuota) return null;

    const handleMontoChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, ''); // Eliminar no dígitos
        if (rawValue === '' || (Number(rawValue) >= 0 && Number(rawValue) <= cuota.saldo)) {
            setMontoAPagar(rawValue);
            if (pagarTodo) setPagarTodo(false);
        }
    };

    const handlePagarTodoChange = (e) => {
        const checked = e.target.checked;
        setPagarTodo(checked);
        if (checked) {
            setMontoAPagar(cuota.saldo.toString());
        } else {
            setMontoAPagar('');
        }
    };

    const handleConfirmClick = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                cobrador: idCobrador,
                movimiento: idMovimiento,
                nroCuota: cuota.nroCuota,
                pago: montoAPagar,
            };

            const response = await api.post('/api/deudor/pagarFactura', payload);

            dispatch(agregarPago(montoAPagar));
            onConfirmarPago({ cuota, monto: montoAPagar, respuesta: response.data });

        } catch (err) {
            console.error('Error en el pago:', err);
            const errorMessage = err.response?.data?.mensaje || err.message || 'Ocurrió un error inesperado.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="pago-modal-title"
            sx={backdropStyle}
        >
            <Paper sx={style}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography id="pago-modal-title" variant="h6" component="h2">
                        Realizar Pago
                    </Typography>
                    <IconButton onClick={onClose} aria-label="Cerrar">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ my: 2 }} />

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <Box>
                    <Typography variant="body1"><strong>Cuota Nro:</strong> {cuota.nroCuota}</Typography>
                    <Typography variant="body1"><strong>Saldo a pagar:</strong> {formatMonto(cuota.saldo)}</Typography>
                    
                    <TextField
                        fullWidth
                        type="text"
                        inputMode="numeric"
                        label="Monto a Pagar"
                        value={montoAPagar === '' ? '' : formatMonto(montoAPagar)}
                        onChange={handleMontoChange}
                        sx={{ my: 2 }}
                    />

                    <FormControlLabel
                        control={<Checkbox checked={pagarTodo} onChange={handlePagarTodoChange} />}
                        label={`Pagar el total (${formatMonto(cuota.saldo)})`}
                    />

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button variant="outlined" onClick={onClose}>Cancelar</Button>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleConfirmClick}
                            disabled={!montoAPagar || Number(montoAPagar) <= 0 || isSubmitting}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Confirmar Pago'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Modal>
    );
};

export default PagoModal;
