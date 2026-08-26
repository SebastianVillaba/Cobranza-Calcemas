import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

const Layout = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const handleMenuClick = (path) => {
        navigate(path);
        setDrawerOpen(false);
    };

    return (
        <Box>
            {/* Botón para abrir el Drawer */}
            {
                !drawerOpen &&
                <IconButton
                    onClick={toggleDrawer(true)}
                    sx={{
                        position: 'fixed',
                        top: 16,
                        left: 16,
                        zIndex: 1300,
                        backgroundColor: 'white',
                        boxShadow: 2
                    }}
                >
                    <MenuIcon />
                </IconButton>
            }

            {/* Drawer Lateral */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
            >
                <Box
                    sx={{ width: 250 }}
                    role="presentation"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                >
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => handleMenuClick('/app/home')}>
                                <ListItemText primary="Realizar cobranza" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => handleMenuClick('/app/cerrar-cobranzas')}>
                                <ListItemText primary="Cerrar cobranzas del día" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => handleMenuClick('/app/consulta-recibos')}>
                                <ListItemText primary="Consulta de Recibos" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => handleMenuClick('/app/listado-cobranzas')}>
                                <ListItemText primary="Listado de cobranzas" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            {/* Contenido de las páginas */}
            <Outlet />
        </Box>
    );
};

export default Layout;
