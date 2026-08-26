import { Card, CardContent, Typography, Box } from '@mui/material';

const DeudorBox = ({ deudor, onClick }) => {
    if (!deudor) {
        return null;
    }

    const handleClick = () => {
        if (onClick) {
            onClick(deudor);
        }
    };

    return (
        <Card 
            onClick={handleClick}
            sx={{ 
                maxWidth: 400, 
                margin: '1rem auto', 
                borderRadius: '12px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.15)'
                }
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body1"><Box component="span" sx={{ fontWeight: 'bold' }}>ID Cliente:</Box> {deudor.idCliente}</Typography>
                    <Typography variant="body1"><Box component="span" sx={{ fontWeight: 'bold' }}>RUC:</Box> {deudor.soloRuc}</Typography>
                    <Typography variant="body1"><Box component="span" sx={{ fontWeight: 'bold' }}>Nombre:</Box> {deudor.nombre} {deudor.apellido}</Typography>
                    <Typography variant="body1"><Box component="span" sx={{ fontWeight: 'bold' }}>Grupo Cliente:</Box> {deudor.nombreGrupoCliente}</Typography>
                    <Typography variant="body1"><Box component="span" sx={{ fontWeight: 'bold' }}>Celular:</Box> {deudor.celular1 || 'No registrado'}</Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default DeudorBox;