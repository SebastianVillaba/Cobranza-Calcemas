import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useIdCobrador, useNombreCobrador } from '../features/user/userHooks';
import { useState } from 'react';
import api from '../services/api';

const ListadoCobranza = () => {
    const idCobrador = useIdCobrador();
    const nombreCobrador = useNombreCobrador();
    const [cobranzas, setCobranzas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estado para fecha y tipo de listado
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]); // Formato YYYY-MM-DD
    const [hasta, setHasta] = useState(new Date().toISOString().split('T')[0]);
    const [tipoListado, setTipoListado] = useState('semanal');

    // Función unificada para obtener listado según el tipo
    const handleListar = async () => {
        if (!idCobrador) {
            setError('No se ha identificado el cobrador.');
            return;
        }

        // Convertir fecha de YYYY-MM-DD a YYYY-DD-MM
        const [year, month, day] = fecha.split('-');
        const fechaFormateada = `${year}-${month}-${day}`;

        console.log("fechaFormateada", fechaFormateada);
        console.log("hasta", hasta);
        

        const [año, mes, dia] = hasta?.split('-');
        const fechaHastaFormateada = `${año}-${mes}-${dia}` || null;

        setLoading(true);
        setError(null);
        setCobranzas([]);

        try {
            let endpoint = '';
            switch (tipoListado) {
                case 'semanal':
                    endpoint = `/api/listado/semanal?idCobrador=${idCobrador}&fecha=${fechaFormateada}&hasta=${fechaHastaFormateada}`;
                    break;
                case 'quincenal':
                    endpoint = `/api/listado/quincenal?idCobrador=${idCobrador}&fecha=${fechaFormateada}`;
                    break;
                case 'mensual':
                    endpoint = `/api/listado/mensual?idCobrador=${idCobrador}&fecha=${fechaFormateada}`;
                    break;
                default:
                    endpoint = `/api/listado/semanal?idCobrador=${idCobrador}&fecha=${fechaFormateada}`;
            }

            const response = await api.get(endpoint);
            console.log(response.data.respuesta);
            setCobranzas(response.data.respuesta || []);
        } catch (err) {
            console.error('Error al obtener cobranzas:', err);
            setError('Error al cargar las cobranzas.');
        } finally {
            setLoading(false);
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
                Listado de Cobranzas
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
                            <Typography variant="body2" color="text.secondary">Nombre</Typography>
                            <Typography variant="body1">{nombreCobrador || 'Cobrador'}</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Filtros: Fecha, Tipo de Listado y Botón Listar */}
                <Box sx={{
                    mb: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    alignItems: { xs: 'stretch', sm: 'center' }
                }}>
                    <FormControl sx={{ minWidth: 180 }}>
                        <InputLabel id="tipo-listado-label">Tipo de Listado</InputLabel>
                        <Select
                            labelId="tipo-listado-label"
                            id="tipo-listado"
                            value={tipoListado}
                            label="Tipo de Listado"
                            onChange={(e) => setTipoListado(e.target.value)}
                        >
                            <MenuItem value="semanal">Semanal</MenuItem>
                            <MenuItem value="quincenal">Quincenal</MenuItem>
                            <MenuItem value="mensual">Mensual</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Fecha"
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 180 }}
                    />
                    {tipoListado === 'semanal' && (
                        <TextField
                            label="Hasta"
                            type="date"
                            value={hasta}
                            onChange={(e) => setHasta(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 180 }}
                        />
                    )}

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleListar}
                        disabled={loading}
                        sx={{
                            minWidth: 120,
                            height: 56
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Listar'}
                    </Button>
                </Box>

                {/* Tabla de Cobranzas */}
                <Typography variant="h6" gutterBottom>
                    Cobranzas - {tipoListado.charAt(0).toUpperCase() + tipoListado.slice(1)}
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nro</TableCell>
                                    <TableCell>Código</TableCell>
                                    <TableCell>Cliente</TableCell>
                                    <TableCell>Empresa</TableCell>
                                    <TableCell>Telefono</TableCell>
                                    <TableCell>Factura</TableCell>
                                    <TableCell align="right">Cuota</TableCell>
                                    <TableCell align="right">Saldo</TableCell>
                                    <TableCell>ND</TableCell>
                                    <TableCell>Vence</TableCell>
                                    <TableCell align="right">Saldo Tot.</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cobranzas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center">
                                            {!loading ? 'Seleccione fecha y tipo, luego presione Listar.' : 'Cargando...'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cobranzas.map((cobranza, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{cobranza.codigo || ''}</TableCell>
                                            <TableCell>{cobranza.cliente || ''}</TableCell>
                                            <TableCell>{cobranza.empresa || ''}</TableCell>
                                            <TableCell>{cobranza.telefono || ''}</TableCell>
                                            <TableCell>{cobranza.idMov || ''}</TableCell>
                                            <TableCell align="right">{(cobranza.montoCuota || 0).toLocaleString()}</TableCell>
                                            <TableCell align="right">{(cobranza.saldoCuota || 0).toLocaleString()}</TableCell>
                                            <TableCell>{cobranza.ndia || ''}</TableCell>
                                            <TableCell>{cobranza.vence || ''}</TableCell>
                                            <TableCell align="right">{(cobranza.saldoCliente || 0).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
};

export default ListadoCobranza;
