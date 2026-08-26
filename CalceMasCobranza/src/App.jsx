import React, { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, Outlet } from "react-router-dom";
import AuthLayout from "./layout/AuthLayout";
import Layout from "./layout/MainLayout";
import ProtectedRoute from "./Components/ProtectedRoute";

const MainPage = React.lazy(() => import('./Pages/MainPage')); 
const LoginPage = React.lazy(() => import('./Pages/LoginPage')); 
const CerrarCobranzas = React.lazy(() => import('./Pages/CerrarCobranzas')); 
const ConsultaRecibos = React.lazy(() => import('./Pages/ConsultaRecibos'));
const ListadoCobranza = React.lazy(() => import('./Pages/ListadoCobranza'));

function App() {
  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/auth/login" replace/>}/>

            <Route path="/auth" element={<AuthLayout/>}>
              <Route path="/auth/login" element={<LoginPage/>}/>
            </Route>

            <Route path="/app" element={<ProtectedRoute><Layout/></ProtectedRoute>}>
              <Route index element={<Navigate to="home" replace/>}/>
              <Route path="home" element={<MainPage/>}/>
              <Route path="cerrar-cobranzas" element={<CerrarCobranzas/>}/>
              <Route path="consulta-recibos" element={<ConsultaRecibos/>}/>
              <Route path="listado-cobranzas" element={<ListadoCobranza/>}/>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App
