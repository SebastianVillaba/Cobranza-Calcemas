import React, { useState, useEffect } from 'react';
import { Box, Typography, Modal, IconButton, Divider, Paper, CircularProgress, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PagoModal from './PagoModal';
import api from '../services/api';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: '70%', md: '600px' },
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

const FacturaDetalle = ({ open, onClose, factura, idCobrador }) => {
    const [detalle, setDetalle] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
    const [selectedCuota, setSelectedCuota] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleOpenPagoModal = (cuota) => {
        setSelectedCuota(cuota);
        setIsPagoModalOpen(true);
    };

    const handleClosePagoModal = () => {
        setIsPagoModalOpen(false);
        setSelectedCuota(null);
    };

    const handleConfirmarPago = (pago) => {
        console.log('Pago confirmado:', pago);
        handleClosePagoModal();
        // Forzar la recarga de los detalles de la factura
        setRefreshKey(prevKey => prevKey + 1);
    };

    useEffect(() => {
        if (!open || !factura) {
            setDetalle([]);
            return;
        }

        const controller = new AbortController();
        const fetchDetalle = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = `/api/deudor/getDetalleFactura?cobrador=${idCobrador}&idMov=${factura.idMov}`;
                //console.log("URL del detalle de facturas: ", url)
                const res = await api.get(url, { signal: controller.signal });
                setDetalle(Array.isArray(res.data.respuesta) ? res.data.respuesta : []);
            } catch (err) {
                if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                    console.error('Error al obtener detalle de factura:', err);
                    setError('No se pudo cargar el detalle de la factura.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDetalle();

        return () => controller.abort();
    }, [open, factura, idCobrador, refreshKey]);

    if (!factura) return null;

    const currencyFmt = new Intl.NumberFormat('es-PY', { style: 'decimal', maximumFractionDigits: 0 });
    const formatMonto = (v) => currencyFmt.format(Number(v) || 0);

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="factura-detalle-modal-title"
                sx={backdropStyle}
            >
                <Paper sx={style}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography id="factura-detalle-modal-title" variant="h6" component="h2">
                            Detalle de la Factura
                        </Typography>
                        <IconButton onClick={onClose} aria-label="Cerrar">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body1"><strong>ID Movimiento:</strong> {factura.idMov}</Typography>
                        <Typography variant="body1"><strong>Fecha:</strong> {factura.fecha}</Typography>
                        <Typography variant="body1"><strong>Monto Total:</strong> {formatMonto(factura.monto)}</Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', mb: 1 }}>Cuotas</Typography>
                        
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Typography color="error" sx={{ my: 2 }}>{error}</Typography>
                        ) : detalle.length > 0 ? (
                            <>
                                {/* Encabezado Fijo */}
                                <Box sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '0.5fr 1fr 1fr 1fr 1fr', 
                                    gap: 1, 
                                    fontWeight: 'bold', 
                                    borderBottom: 2, 
                                    borderColor: 'divider', 
                                    pb: 1, 
                                    bgcolor: 'background.paper', // Fondo para que no se transparente el contenido
                                    position: 'sticky',
                                    top: -24, // Ajuste para que quede pegado arriba del modal (considerando el padding 'p' del modal)
                                    zIndex: 1
                                }}>
                                    <Typography variant="caption">Cuota</Typography>
                                    <Typography variant="caption">Vencimiento</Typography>
                                    <Typography variant="caption" sx={{ textAlign: 'right' }}>Monto</Typography>
                                    <Typography variant="caption" sx={{ textAlign: 'right' }}>Saldo</Typography>
                                    <Typography variant='caption' sx={{ textAlign: 'right' }}>Acciones</Typography>
                                </Box>

                                {/* Contenedor de la lista con Scroll */}
                                <Box sx={{ maxHeight: '40vh', overflowY: 'auto', pt: 1 }}>
                                    {detalle.map((cuota, index) => (
                                        <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '0.5fr 1fr 1fr 1fr 1fr', gap: 1, py: 1, borderBottom: 1, borderColor: 'grey.200', opacity: index > 0 ? 0.6 : 1 }}>
                                            <Typography variant="body2">{cuota.nroCuota}</Typography>
                                            <Typography variant="body2">{cuota.vencimiento}</Typography>
                                            <Typography variant="body2" sx={{ textAlign: 'right' }}>{formatMonto(cuota.montoCuota)}</Typography>
                                            <Typography variant="body2" sx={{ textAlign: 'right' }}>{formatMonto(cuota.saldo)}</Typography>
                                            <Typography variant='body2' sx={{ textAlign: 'right' }}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleOpenPagoModal(cuota)}
                                                    disabled={index > 0}
                                                    sx={{
                                                        backgroundColor: '#28a745',
                                                        '&:hover': { backgroundColor: '#218838' },
                                                        '&.Mui-disabled': {
                                                            backgroundColor: 'grey.400',
                                                        }
                                                    }}
                                                >
                                                    Pagar
                                                </Button>
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </>
                        ) : (
                            <Typography sx={{ mt: 2, textAlign: 'center' }}>No hay detalles de cuotas para mostrar.</Typography>
                        )}
                    </Box>
                </Paper>
            </Modal>

            <PagoModal
                open={isPagoModalOpen}
                onClose={handleClosePagoModal}
                cuota={selectedCuota}
                onConfirmarPago={handleConfirmarPago}
                idCobrador={idCobrador}
                idMovimiento={factura.idMov}
            />
        </>
    );
};

export default FacturaDetalle;
