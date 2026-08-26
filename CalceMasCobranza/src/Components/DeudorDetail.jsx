import { Box, Typography, Modal, IconButton, Divider, Paper, Button, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIdCobrador, useIdUsuario } from '../features/user/userHooks';
import FacturaDetalle from './FacturaDetalle'; // Importar el nuevo componente
import { selectTotalCobro, resetearCobro } from '../features/cobro/cobroSlice';
import axios from 'axios';
import api from '../services/api';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: '85%', md: '80%' },
    maxWidth: { xs: '95vw', sm: '900px' },
    maxHeight: { xs: '92vh', sm: '90vh' },
    overflowY: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 2,
    p: { xs: 2, sm: 3 },
};

const backdropStyle = {
    backdropFilter: 'blur(3px)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
};

const DeudorDetail = ({ open, onClose, deudor }) => {
    const dispatch = useDispatch();
    const totalCobro = useSelector(selectTotalCobro);
    const [isCompletingCobro, setIsCompletingCobro] = useState(false);
    const [cobroStatus, setCobroStatus] = useState({ error: null, success: null });
    const [idCobro, setIdCobro] = useState(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportError, setReportError] = useState(null);

    const idCobrador = useIdCobrador();
    const idUsuario = useIdUsuario();
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estados para el modal de detalle de factura
    const [selectedFactura, setSelectedFactura] = useState(null);
    const [isDetalleOpen, setIsDetalleOpen] = useState(false);
    const [tiposPago, setTiposPago] = useState([]);
    const [idTipoCobro, setIdTipoCobro] = useState('');
    const [loadingTiposPago, setLoadingTiposPago] = useState(false);
    
    // Estados para el combo de usuarios (cuando es usuario negocio)
    const [usuarios, setUsuarios] = useState([]);
    const [idUsuarioSeleccionado, setIdUsuarioSeleccionado] = useState('');
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    
    // Estados para actualizar teléfono
    const [celular, setCelular] = useState('');
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
    const [phoneUpdateStatus, setPhoneUpdateStatus] = useState({ error: null, success: null });

    // Estado para modal de confirmación de cobro duplicado del día
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    // Cierre que resetea estados
    const handleClose = () => {
        setFacturas([]);
        setError(null);
        setLoading(false);
        dispatch(resetearCobro());
        setCobroStatus({ error: null, success: null });
        setIdCobro(null);
        setIsGeneratingReport(false);
        setReportError(null);
        setTiposPago([]);
        setIdTipoCobro('');
        setCelular('');
        setIsEditingPhone(false);
        setPhoneUpdateStatus({ error: null, success: null });
        setOpenConfirmDialog(false);
        onClose && onClose();
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchFacturas = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(`/api/deudor/getFacturas?cobrador=${idCobrador}&cliente=${deudor.idCliente}`, { signal: controller.signal });
                setFacturas(Array.isArray(res.data.respuesta) ? res.data.respuesta : []);
            } catch (err) {
                if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                    console.error('Error al obtener facturas:', err);
                    setError('No se pudieron cargar las facturas.');
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchTiposPago = async () => {
            setLoadingTiposPago(true);
            try {
                const res = await api.get('/api/deudor/getTiposPago', { signal: controller.signal });
                if (res.data && Array.isArray(res.data.respuesta)) {
                    setTiposPago(res.data.respuesta);
                }
            } catch (err) {
                if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                    console.error('Error al obtener tipos de pago:', err);
                }
            } finally {
                setLoadingTiposPago(false);
            }
        };

        const fetchUsuarios = async () => {
            if (idUsuario !== 30) return; // Solo cargar usuarios si es el usuario negocio
            
            setLoadingUsuarios(true);
            try {
                const res = await api.get('/api/usuarios/getAllUsuarios', { signal: controller.signal });
                if (res.data && Array.isArray(res.data.respuesta)) {
                    setUsuarios(res.data.respuesta);
                }
            } catch (err) {
                if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                    console.error('Error al obtener usuarios:', err);
                }
            } finally {
                setLoadingUsuarios(false);
            }
        };

        if (open) {
            dispatch(resetearCobro());
            fetchFacturas();
            fetchTiposPago();
            fetchUsuarios();
            setCelular(deudor?.celular1 || '');
        }

        return () => controller.abort();
    }, [open, deudor, idCobrador]);


    // Helper de formato
    const currencyFmt = new Intl.NumberFormat('es-PY', { style: 'decimal', maximumFractionDigits: 0 });

    const formatMonto = (v) => {
        const num = Number(v);
        if (Number.isNaN(num)) return v;
        return currencyFmt.format(num);
    };

    const ejecutarCompletarCobro = async () => {
        setIsCompletingCobro(true);
        setCobroStatus({ error: null, success: null });

        try {
            // Determinar qué idUsuario enviar al backend
            const idUsuarioParaCobro = idUsuario === 30 ? idUsuarioSeleccionado : idUsuario;
            
            const payload = {
                idCobrador,
                idCliente: deudor.idCliente,
                idTipoCobro,
                totalCobro,
                idUsuario: idUsuarioParaCobro
            };

            const response = await api.post('/api/deudor/completarCobro', payload);
            const newIdCobro = response.data.respuesta.cobro[''];

            if (newIdCobro) {
                setIdCobro(newIdCobro);
                setCobroStatus({ success: response.data.mensaje || 'Cobro completado con éxito.', error: null });
                handleGenerateReport(newIdCobro);
            } else {
                throw new Error('No se recibió el idCobro en la respuesta.');
            }

        } catch (err) {
            console.error('Error al completar el cobro:', err);
            const errorMessage = err.response?.data?.mensaje || err.message || 'Ocurrió un error inesperado.';
            setCobroStatus({ error: errorMessage, success: null });
        } finally {
            setIsCompletingCobro(false);
        }
    };

    const handleCompletarCobro = async () => {
        // Validar que tenga número de teléfono
        if (!celular || celular.trim() === '') {
            setCobroStatus({ error: 'Debe registrar un número de teléfono antes de completar el cobro.', success: null });
            return;
        }

        setIsCompletingCobro(true);
        setCobroStatus({ error: null, success: null });

        try {
            // Verificar si el cliente ya tuvo una cobranza hoy con este cobrador mediante funCobroDia
            const res = await api.get(`/api/deudor/verificarCobroDia?idCobrador=${idCobrador}&idCliente=${deudor.idCliente}`);
            const yaCobro = res.data?.respuesta?.yaCobro;

            if (yaCobro === 1) {
                // Ya tuvo una cobranza hoy: abrir modal de confirmación
                setOpenConfirmDialog(true);
                setIsCompletingCobro(false);
            } else {
                // No tuvo cobranza hoy: proceder directamente
                await ejecutarCompletarCobro();
            }
        } catch (err) {
            console.error('Error al verificar cobranza del día:', err);
            // En caso de error en la verificación, intentar proceder o notificar al usuario
            await ejecutarCompletarCobro();
        }
    };

    const handleConfirmarCobro = async () => {
        setOpenConfirmDialog(false);
        await ejecutarCompletarCobro();
    };

    const handleCancelarCobro = () => {
        setOpenConfirmDialog(false);
    };

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

    const handleSendEmail = async (pdfBlob, cobroId) => {
        
        const formData = new FormData();
        formData.append('pdf', pdfBlob, `recibo-${cobroId}.pdf`);

        try {
            const response = await api.post('/api/email/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (err) {
            console.error('Error al enviar el correo:', err);
        }
    };

    const handleDownloadPdf = async () => {
        if (!idCobro) return;
        
        setIsGeneratingReport(true);
        setReportError(null);
        try {
            const response = await api.get(`/api/reportes/reciboCobro?cobro=${idCobro}`);
            if (response.data && response.data.respuesta && response.data.respuesta.length > 0) {
                const mappedData = mapApiToPdfData(response.data.respuesta[0]);
                const { downloadReciboPDF } = await import('./Reportes/ReciboPDF');
                
                downloadReciboPDF(mappedData, `recibo-${idCobro}.pdf`);
            } else {
                throw new Error('La respuesta de la API no contiene los datos del recibo.');
            }
        } catch (err) {
            console.error('Error al descargar el PDF:', err);
            setReportError('No se pudo descargar el recibo. Intente de nuevo.');
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handleGenerateReport = async (cobroId) => {
        setIsGeneratingReport(true);
        setReportError(null);
        try {
            const response = await api.get(`/api/reportes/reciboCobro?cobro=${cobroId}`);
            if (response.data && response.data.respuesta && response.data.respuesta.length > 0) {
                const mappedData = mapApiToPdfData(response.data.respuesta[0]);
                const { getReciboPDFBlob, downloadReciboPDF } = await import('./Reportes/ReciboPDF');
                
                const blob = getReciboPDFBlob(mappedData);

                // Enviar el PDF por correo
                handleSendEmail(blob, cobroId);

                // Descarga automática del PDF
                downloadReciboPDF(mappedData, `recibo-${cobroId}.pdf`);

            } else {
                throw new Error('La respuesta de la API no contiene los datos del recibo.');
            }
        } catch (err) {
            console.error('Error al generar el reporte:', err);
            setReportError('No se pudo generar el recibo. Intente de nuevo.');
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handleUpdatePhone = async () => {
        if (!celular || celular.trim() === '') {
            setPhoneUpdateStatus({ error: 'El número de teléfono no puede estar vacío.', success: null });
            return;
        }

        setIsUpdatingPhone(true);
        setPhoneUpdateStatus({ error: null, success: null });

        try {
            const response = await api.put('/api/deudor/actualizarTelefono', {
                idCliente: deudor.idCliente,
                celular: celular
            });

            setPhoneUpdateStatus({ success: 'Teléfono actualizado correctamente.', error: null });
            setIsEditingPhone(false);
            
            // Actualizar el deudor en el estado local
            if (deudor) {
                deudor.celular1 = celular;
            }
        } catch (err) {
            console.error('Error al actualizar teléfono:', err);
            const errorMessage = err.response?.data?.mensaje || err.message || 'Error al actualizar el teléfono.';
            setPhoneUpdateStatus({ error: errorMessage, success: null });
        } finally {
            setIsUpdatingPhone(false);
        }
    };

    // Virtual scroll config
    const rowHeight = 54; // px
    const buffer = 6; // filas extra para suavidad
    const [scrollTop, setScrollTop] = useState(0);
    const containerHeight = 360; // altura del viewport de la lista (ajustada para mobile)

    const totalRows = facturas.length;
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
    const visibleCount = Math.ceil(containerHeight / rowHeight) + buffer * 2;
    const endIndex = Math.min(totalRows, startIndex + visibleCount);
    const visibleRows = facturas.slice(startIndex, endIndex);

    const handleOpenDetalle = (factura) => {
        setSelectedFactura(factura);
        setIsDetalleOpen(true);
    };

    const handleCloseDetalle = () => {
        setIsDetalleOpen(false);
        setSelectedFactura(null);
    };

    if (!deudor) {
        return null; 
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="deudor-detail-modal"
            aria-describedby="deudor-detail-description"
            sx={backdropStyle}
        >
            <Paper sx={style}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2">
                        Detalle del Deudor
                    </Typography>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Información del Cliente</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">ID Cliente</Typography>
                            <Typography variant="body1">{deudor.idCliente}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary">RUC</Typography>
                            <Typography variant="body1">{deudor.soloRuc}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary">Nombre</Typography>
                            <Typography variant="body1">{deudor.nombre} {deudor.apellido}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary">Grupo Cliente</Typography>
                            <Typography variant="body1">{deudor.nombreGrupoCliente}</Typography>
                        </Box>
                    </Box>
                    
                    {/* Campo de teléfono con botón de actualización */}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Teléfono</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {isEditingPhone ? (
                                <>
                                    <TextField
                                        size="small"
                                        value={celular}
                                        onChange={(e) => setCelular(e.target.value)}
                                        placeholder="Ingrese número de teléfono"
                                        sx={{ flex: 1 }}
                                    />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleUpdatePhone}
                                        disabled={isUpdatingPhone}
                                    >
                                        {isUpdatingPhone ? <CircularProgress size={20} /> : 'Guardar'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            setIsEditingPhone(false);
                                            setCelular(deudor?.celular1 || '');
                                            setPhoneUpdateStatus({ error: null, success: null });
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Typography variant="body1" sx={{ flex: 1 }}>
                                        {celular || 'No registrado'}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => setIsEditingPhone(true)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                        {phoneUpdateStatus.error && (
                            <Alert severity="error" sx={{ mt: 1 }}>{phoneUpdateStatus.error}</Alert>
                        )}
                        {phoneUpdateStatus.success && (
                            <Alert severity="success" sx={{ mt: 1 }}>{phoneUpdateStatus.success}</Alert>
                        )}
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />
                
                <Box>
                    <Typography variant="h6" gutterBottom>Facturas Pendientes</Typography>
                    {loading && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Cargando facturas...
                        </Typography>
                    )}
                    {error && (
                        <Typography color="error" sx={{ mb: 1 }}>
                            {error}
                        </Typography>
                    )}
                    <Box sx={{ 
                        overflow: 'auto', // Usamos 'auto' para ambos ejes
                        height: { xs: 320, sm: containerHeight },
                        border: '1px solid #eee',
                        borderRadius: 2,
                    }}>
                        {/* Contenedor interno para minWidth y scroll horizontal */}
                        <Box sx={{ minWidth: '750px' }}>
                            {/* Encabezado como grid responsive y STICKY */}
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '10rem 6rem 7rem 7rem 7rem 4rem 7rem',
                                        sm: '1fr 1fr 1fr 1fr 1fr 0.8fr 0.9fr',
                                    },
                                    gap: 1,
                                    px: 1,
                                    py: 1,
                                    bgcolor: 'background.paper',
                                    borderBottom: '2px solid #ddd',
                                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                    fontWeight: 600,
                                    position: 'sticky', // La magia está aquí
                                    top: 0,             // Fija la cabecera arriba
                                    zIndex: 1,          // Asegura que esté por encima del contenido
                                }}
                            >
                                <Box>idMov</Box>
                                <Box>Fecha</Box>
                                <Box sx={{ textAlign: 'right' }}>Monto</Box>
                                <Box sx={{ textAlign: 'right' }}>Pagado</Box>
                                <Box sx={{ textAlign: 'right' }}>Saldo</Box>
                                <Box sx={{ textAlign: 'center' }}>Tipo</Box>
                                <Box>Acciones</Box>
                            </Box>

                            {/* Contenedor con virtualización */}
                            {facturas.length === 0 && !loading && !error ? (
                                <Box sx={{ p: 2, textAlign: 'center', color: '#666' }}>
                                    No hay facturas pendientes.
                                </Box>
                            ) : (
                                <Box sx={{ position: 'relative', height: totalRows * rowHeight }}>
                                    {visibleRows.map((factura, i) => {
                                        const rowIndex = startIndex + i;
                                        const top = rowIndex * rowHeight;
                                        return (
                                            <Box
                                                key={`${factura.factura}-${rowIndex}`}
                                                sx={{
                                                    position: 'absolute',
                                                    top,
                                                    left: 0,
                                                    right: 0,
                                                    height: rowHeight,
                                                    display: 'grid',
                                                    gridTemplateColumns: {
                                                        xs: '10rem 6rem 7rem 7rem 7rem 4rem 7rem',
                                                        sm: '1fr 1fr 1fr 1fr 1fr 0.8fr 0.9fr',
                                                    },
                                                    gap: 1,
                                                    alignItems: 'center',
                                                    px: 1,
                                                    borderBottom: '1px solid #eee',
                                                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                                }}
                                            >
                                                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{factura.idMov}</Box>
                                                <Box>{factura.fecha}</Box>
                                                <Box sx={{ textAlign: 'right' }}>{formatMonto(factura.monto)}</Box>
                                                <Box sx={{ textAlign: 'right' }}>{formatMonto(factura.pagado)}</Box>
                                                <Box sx={{ textAlign: 'right' }}>{formatMonto(factura.saldo)}</Box>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <span style={{
                                                        backgroundColor: factura.tipoCuota === 'M' ? '#fff3cd' : 
                                                                        factura.tipoCuota === 'S' ? '#f8d7da' : '#d4edda',
                                                        color: factura.tipoCuota === 'M' ? '#856404' : 
                                                             factura.tipoCuota === 'S' ? '#721c24' : '#155724',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 500,
                                                    }}>
                                                        {factura.tipoCuota}
                                                    </span>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-start' } }}>
                                                    <Button
                                                        type="button"
                                                        variant="text"
                                                        onClick={() => handleOpenDetalle(factura)}
                                                        sx={{
                                                            color: "primary.main",
                                                            fontWeight: 500,
                                                            fontSize: "0.8rem"
                                                        }}
                                                    >
                                                        Ver detalle
                                                    </Button>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
                
                {cobroStatus.error && <Alert severity="error" sx={{ mt: 2 }}>{cobroStatus.error}</Alert>}
                {cobroStatus.success && <Alert severity="success" sx={{ mt: 2 }}>{cobroStatus.success}</Alert>}

                {idCobro && (
                    <Box sx={{ mt: 2 }}>
                        {isGeneratingReport && <CircularProgress size={24} />}
                        {reportError && <Alert severity="error">{reportError}</Alert>}
                        {!isGeneratingReport && !reportError && (
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Typography variant="body2" color="success.main">
                                    ✓ Recibo generado exitosamente
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    onClick={handleDownloadPdf}
                                    disabled={isGeneratingReport}
                                >
                                    {isGeneratingReport ? <CircularProgress size={16} /> : 'Descargar PDF'}
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}

                <Box sx={{ mt: 3 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="tipo-pago-label">Tipo de Pago</InputLabel>
                        <Select
                            labelId="tipo-pago-label"
                            value={idTipoCobro}
                            label="Tipo de Pago"
                            onChange={(e) => setIdTipoCobro(e.target.value)}
                        >
                            {loadingTiposPago ? (
                                <MenuItem disabled>Cargando tipos de pago...</MenuItem>
                            ) : (
                                tiposPago.map((tipo) => (
                                    <MenuItem key={tipo.idTipoCobro} value={tipo.idTipoCobro}>
                                        {tipo.nombreTipo}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    {/* Mostrar combo de usuarios solo si es el usuario negocio (idUsuario=30) */}
                    {idUsuario === 30 && (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="usuario-label">Usuario que completa el cobro</InputLabel>
                            <Select
                                labelId="usuario-label"
                                value={idUsuarioSeleccionado}
                                label="Usuario que completa el cobro"
                                onChange={(e) => setIdUsuarioSeleccionado(e.target.value)}
                            >
                                {loadingUsuarios ? (
                                    <MenuItem disabled>Cargando usuarios...</MenuItem>
                                ) : (
                                    usuarios.map((usuario) => (
                                        <MenuItem key={usuario.idUsuario} value={usuario.idUsuario}>
                                            {usuario.nick}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                        <Typography variant={{ xs: "h5", sm: "h6" }}>
                            Total a Cobrar: <strong>{formatMonto(totalCobro)}</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleCompletarCobro}
                                disabled={totalCobro <= 0 || isCompletingCobro || !idTipoCobro || (idUsuario === 30 && !idUsuarioSeleccionado)}
                            >
                                {isCompletingCobro ? <CircularProgress size={24} color="inherit" /> : 'Completar Cobro'}
                            </Button>
                            <Button variant="outlined" onClick={handleClose}>
                                Cerrar
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Modal de Detalle de Factura */}
                {selectedFactura && (
                    <FacturaDetalle
                        open={isDetalleOpen}
                        onClose={handleCloseDetalle}
                        factura={selectedFactura}
                        idCobrador={idCobrador}
                    />
                )}

                {/* Diálogo de Confirmación para cliente con cobranza el mismo día */}
                <Dialog
                    open={openConfirmDialog}
                    onClose={handleCancelarCobro}
                    aria-labelledby="confirm-cobro-title"
                    aria-describedby="confirm-cobro-description"
                >
                    <DialogTitle id="confirm-cobro-title">
                        Cobranza ya registrada hoy
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="confirm-cobro-description">
                            Este cliente ya tuvo una cobranza registrada el día de hoy.
                            ¿Desea confirmar y registrar el cobro de todas formas?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelarCobro} color="secondary" variant="outlined">
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmarCobro} color="primary" variant="contained" autoFocus>
                            Confirmar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Modal>
    );
}

export default DeudorDetail;