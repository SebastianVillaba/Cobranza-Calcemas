import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserData } from '../features/user/userSlice';
import axios from 'axios';


export default function LoginPage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await getUser();
      //console.log(response);
      if (response.respuesta.idUsuario > 0) {
        // Save idCobrador, nombreCobrador and idUsuario to Redux store
        dispatch(setUserData({
          idCobrador: response.respuesta.idCobrador,
          nombreCobrador: response.respuesta.nombreCobrador,
          idUsuario: response.respuesta.idUsuario,
          token: response.token // Guardar token
        }));
        navigate('/app', { replace: true });
      }
    } catch (error) {
      console.error('Error during login:', error);
      // Handle error (show error message to user, etc.)
    }
  };

  const getUser = async () => {
    const response = await axios.get(`/api/usuarios/getUsuario?usuario=${usuario}&contra=${password}`);
    return response.data; 
  }

  return (
    <Box component="form" onSubmit={handleSubmit} >
      <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
        Iniciar sesión
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Usuario"
          type='user'
          value={usuario}
          onChange={(e)=>setUsuario(e.target.value)}
          autoComplete='off'
          required
          inputProps={{ maxLength: 10 }}
        />

        <TextField 
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete='off'
          required
          fullWidth
          inputProps={{ maxLength: 10 }}
        />

        <Button type="submit" variant="contained" size="large">
          Ingresar
        </Button>
      </Stack>
    </Box>
  );
}


