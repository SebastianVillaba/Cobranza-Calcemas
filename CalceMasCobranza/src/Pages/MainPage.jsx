import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  CircularProgress, 
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl
} from '@mui/material';
import DeudorBox from '../Components/DeudorBox';
import DeudorDetail from '../Components/DeudorDetail';
import { useIdCobrador } from '../features/user/userHooks';
import { useSelector } from 'react-redux';
import api from '../services/api';

const MainPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('1'); // 1 para Cédula, 2 para ID
    const [deudorData, setDeudorData] = useState(null);
    const [selectedDeudor, setSelectedDeudor] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const idCobrador = useIdCobrador();
    const token = useSelector(state => state.user.token);

    const handleSearch = async () => {
        if (!searchTerm) {
            setError(`Por favor, ingrese un valor para la búsqueda por ${searchType === '1' ? 'cédula' : 'ID'}.`);
            setDeudorData(null);
            return;
        }
        setLoading(true);
        setError(null);
        setDeudorData(null); // Limpiar datos anteriores

        try {
            const response = await api.get(`/api/deudor/getDeudor?tipo=${searchType}&campo=${searchTerm}`);
            const data = response.data;
            
            if (data.respuesta && data.respuesta.length > 0) {
                setDeudorData(data.respuesta[0]); // Asumiendo que esperamos un solo deudor
            } else {
                setDeudorData(null);
                setError('Deudor no encontrado.');
            }
        } catch (err) {
            setError('Error al conectar con el servidor o al buscar el deudor.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeudorClick = (deudor) => {
        setSelectedDeudor(deudor);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedDeudor(null);
    };

    return (
        <>
            <Box sx={{ 
                position: 'relative',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
                padding: '1rem', // Reducir el padding para móviles
                overflow: 'auto', // Para asegurar el scroll en caso de contenido largo
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                {/* Sección Principal de Productos */}
                <Box sx={{ 
                    flex: 7,
                    width: '100%', // Asegurar que ocupe todo el ancho
                    maxWidth: '600px', // Limitar el ancho máximo en pantallas grandes
                    padding: '1rem',
                    boxSizing: 'border-box'
                }}>
                    <Box sx={{ 
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' }, // Apilar en móviles, en fila en desktop
                        alignItems: 'center',
                        gap: 2,
                        mb: 3 
                    }}>
                        
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder={searchType === '1' ? "Ingrese la cédula" : "Ingrese el código del cliente"}
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoComplete='off'
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />

                        <FormControl component="fieldset" sx={{ mb: 0.5,}}>
                            <RadioGroup
                                row
                                aria-label="tipo-busqueda"
                                name="tipo-busqueda"
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}
                            >
                                <FormControlLabel value="1" control={<Radio />} label="Por Cédula" />
                                <FormControlLabel value="2" control={<Radio />} label="Por Código" />
                            </RadioGroup>
                        </FormControl>
                        
                        <Button
                            variant="contained"
                            sx={{ backgroundColor: '#007bff', width: { xs: '100%', sm: 'auto' } }}
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Buscar cliente'}
                        </Button>
                    </Box>


                    {error && (
                        <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                            {error}
                        </Typography>
                    )}

                    {deudorData && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                            <DeudorBox 
                                deudor={deudorData} 
                                onClick={handleDeudorClick}
                            />
                            <DeudorDetail 
                                open={detailOpen}
                                onClose={handleCloseDetail}
                                deudor={selectedDeudor}
                            />
                        </Box>
                    )}

                    {!deudorData && !loading && !error && searchTerm && (
                         <Typography color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
                            Ingrese una cédula y presione buscar.
                        </Typography>
                    )}
                    
                </Box>
            </Box>
        </>
    )
}

export default MainPage;