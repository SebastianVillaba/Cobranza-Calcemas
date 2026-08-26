import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button } from '@mui/material';
import { useIdCobrador, useNombreCobrador } from '../features/user/userHooks';
import { useEffect, useState } from 'react';
import api from '../services/api';

const CerrarCobranzas = () => {
    const idCobrador = useIdCobrador();
    const nombreCobrador = useNombreCobrador();
    const [cobranzas, setCobranzas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cerrando, setCerrando] = useState(false);

    const fetchCobranzas = async () => {
        if (!idCobrador) return;
        try {
            const response = await api.get(`/api/cierre/getCobros?cobrador=${idCobrador}`);
            setCobranzas(response.data.respuesta || []);
        } catch (err) {
            console.error('Error al obtener cobranzas:', err);
            setError('Error al cargar las cobranzas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCobranzas();
    }, [idCobrador]);

    const handleCerrarCobranza = async (e) => {
        e.preventDefault();
        setCerrando(true);
        try {
            const response = await api.get(`/api/cierre/cerrarCobros?cobrador=${idCobrador}&total=${totalCobrado}`);
            console.log('Cierre exitoso:', response);
            await fetchCobranzas();
            alert('Cobranza cerrada exitosamente.');
        } catch (error) {
            console.error('Error al cerrar cobranzas:', error);
            alert('Error al cerrar la cobranza. Intente nuevamente.');
        } finally {
            setCerrando(false);
        }
    };

    const totalCobrado = cobranzas.reduce((sum, c) => sum + (c.total || 0), 0);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '100vh',
            padding: 2,
            background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)'
        }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#333' }}>
                Cerrar Cobranzas del Día
            </Typography>

            {/* Contenedor unificado para cabecera y tabla */}
            <Paper sx={{ width: '100%', maxWidth: '1200px', padding: 3 }}>
                {/* Información del Cobrador */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Información del Cobrador</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">ID Cobrador</Typography>
                            <Typography variant="body1">{idCobrador || 'N/A'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary">Nombre</Typography>
                            <Typography variant="body1">{nombreCobrador || 'Cobrador'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary">Fecha</Typography>
                            <Typography variant="body1">{new Date().toLocaleDateString()}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary">Total Cobrado Hoy</Typography>
                            <Typography variant="body1">{totalCobrado.toLocaleString()}</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Tabla de Cobranzas */}
                <Typography variant="h6" gutterBottom>Cobranzas del Día</Typography>
                {loading ? (
                    <CircularProgress />
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nro</TableCell>
                                    <TableCell>Código Cliente</TableCell>
                                    <TableCell>Cliente</TableCell>
                                    <TableCell>Nro Movimiento</TableCell>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell align="right">Monto</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cobranzas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">No hay cobranzas para mostrar.</TableCell>
                                    </TableRow>
                                ) : (
                                    cobranzas.map((cobranza, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{cobranza.idCliente || ''}</TableCell>
                                            <TableCell>{cobranza.cliente || ''}</TableCell>
                                            <TableCell>{cobranza.idMov || ''}</TableCell>
                                            <TableCell>{cobranza.fecha || ''}</TableCell>
                                            <TableCell>{cobranza.nombreTipo || ''}</TableCell>
                                            <TableCell align="right">Gs. {(cobranza.total || 0).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        size="large"
                        onClick={handleCerrarCobranza}
                        disabled={cerrando || cobranzas.length === 0}
                    >
                        {cerrando ? 'Cerrando...' : 'Cerrar Cobranza'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default CerrarCobranzas;
