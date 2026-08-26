import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button, IconButton } from '@mui/material';
import { FileText } from 'lucide-react';
import { useIdCobrador, useNombreCobrador } from '../features/user/userHooks';
import { useEffect, useState } from 'react';
import api from '../services/api';

const ConsultaRecibos = () => {
    const idCobrador = useIdCobrador();
    const nombreCobrador = useNombreCobrador();
    const [cobros, setCobros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportError, setReportError] = useState(null);
    const [generatingId, setGeneratingId] = useState(null);

    const fetchCobros = async () => {
        if (!idCobrador) return;
        try {
            const response = await api.get(`/api/deudor/consultaCobros?idCobrador=${idCobrador}`);
            setCobros(response.data.respuesta || []);
        } catch (err) {
            console.error('Error al obtener cobros:', err);
            setError('Error al cargar los cobros.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCobros();
    }, [idCobrador]);

    const mapApiToPdfData = (apiData) => {
        if (!apiData) return null;

        // Función para limpiar y convertir el monto a número
        const parseMonto = (montoStr) => {
            if (typeof montoStr !== 'string') return 0;
            return Number(montoStr.replace(/[^0-9]/g, ''));
        };

        return {
            numeroRecibo: apiData.nroRecibo,
            fecha: apiData.nombreFecha,
            monto: parseMonto(apiData.totalCobrado),
            descripcion: apiData.concepto,
            saldoFactura: apiData.saldoCuota || 0,
            saldoTotal: apiData.saldoCliente || 0,
            cargadoPor: apiData.usuarioCobro,
            codigo: apiData.idCliente || '',
            codigoCliente: apiData.codigoCliente || '',
            nombreCliente: apiData.nombreCliente || '',
            telefonoCliente: apiData.telefonoCliente || '',
        };
    };

    const handleGenerateReport = async (cobroId) => {
        setGeneratingId(cobroId);
        setReportError(null);
        try {
            const response = await api.get(`/api/reportes/reciboCobro?cobro=${cobroId}`);
            if (response.data && response.data.respuesta && response.data.respuesta.length > 0) {
                const mappedData = mapApiToPdfData(response.data.respuesta[0]);
                const { downloadReciboPDF } = await import('../Components/Reportes/ReciboPDF');
                
                downloadReciboPDF(mappedData, `recibo-${cobroId}.pdf`);

            } else {
                throw new Error('La respuesta de la API no contiene los datos del recibo.');
            }
        } catch (err) {
            console.error('Error al generar el reporte:', err);
            setReportError('No se pudo generar el recibo. Intente de nuevo.');
        } finally {
            setGeneratingId(null);
        }
    };

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
                Consulta de Recibos
            </Typography>

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
                        <Box sx={{ gridColumn: 'span 2' }}>
                            <Typography variant="body2" color="text.secondary">Últimos Cobros Realizados</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Tabla de Cobros */}
                <Typography variant="h6" gutterBottom>Historial de Cobros</Typography>
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
                                    <TableCell>Nro. Recibo</TableCell>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell align="right">Monto</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cobros.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">No hay cobros para mostrar.</TableCell>
                                    </TableRow>
                                ) : (
                                    cobros.map((cobro, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{cobro.idCliente || ''}</TableCell>
                                            <TableCell>{cobro.nombre || ''}</TableCell>
                                            <TableCell>{cobro.recibo || ''}</TableCell>
                                            <TableCell>{cobro.fecha || ''}</TableCell>
                                            <TableCell align="right">Gs. {(cobro.totalCobro || 0).toLocaleString()}</TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleGenerateReport(cobro.idCobro)}
                                                    disabled={generatingId === cobro.idCobro}
                                                >
                                                    {generatingId === cobro.idCobro ? (
                                                        <CircularProgress size={20} />
                                                    ) : (
                                                        <FileText size={20} />
                                                    )}
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {reportError && (
                    <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                        {reportError}
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default ConsultaRecibos;
