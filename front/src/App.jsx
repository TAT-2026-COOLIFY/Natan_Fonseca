import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import Exames from './pages/Exames';
import Veiculos from './pages/Veiculos';
import Consultas from './pages/Consultas';
import Viagens from './pages/Viagens';
import MinhasViagens from './pages/MinhasViagens';
import DetalheViagem from './pages/DetalheViagem';
import ControleAcessos from './pages/ControleAcessos';

function pegarUsuarioLogado() {
  const usuarioSalvo = localStorage.getItem('usuario');

  if (!usuarioSalvo) {
    return null;
  }

  const manterConectado = localStorage.getItem('manterConectado') === 'true';
  const sessaoAtiva = sessionStorage.getItem('sessaoAtiva') === 'true';

  if (!manterConectado && !sessaoAtiva) {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    localStorage.removeItem('manterConectado');
    sessionStorage.removeItem('sessaoAtiva');
    return null;
  }

  try {
    return JSON.parse(usuarioSalvo);
  } catch (error) {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    localStorage.removeItem('manterConectado');
    sessionStorage.removeItem('sessaoAtiva');
    return null;
  }
}

function RotaProtegida({ children, perfisPermitidos }) {
  const usuario = pegarUsuarioLogado();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (perfisPermitidos && !perfisPermitidos.includes(usuario.perfil)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
}

function PaginaViagensPorPerfil() {
  const usuario = pegarUsuarioLogado();

  if (usuario?.perfil === 'MOTORISTA') {
    return <MinhasViagens />;
  }

  return <Viagens />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <RotaProtegida perfisPermitidos={['FUNCIONARIO', 'MOTORISTA']}>
              <Dashboard />
            </RotaProtegida>
          }
        />

        <Route
          path="/pacientes"
          element={
            <RotaProtegida perfisPermitidos={['FUNCIONARIO']}>
              <Pacientes />
            </RotaProtegida>
          }
        />

        <Route
          path="/veiculos"
          element={
            <RotaProtegida perfisPermitidos={['FUNCIONARIO']}>
              <Veiculos />
            </RotaProtegida>
          }
        />

        <Route
          path="/exames"
          element={
            <RotaProtegida perfisPermitidos={['FUNCIONARIO']}>
              <Exames />
            </RotaProtegida>
          }
        />

        <Route
          path="/consultas"
          element={
            <RotaProtegida perfisPermitidos={['FUNCIONARIO']}>
              <Consultas />
            </RotaProtegida>
          }
        />

        <Route
          path="/viagens"
          element={
            <RotaProtegida perfisPermitidos={['FUNCIONARIO', 'MOTORISTA']}>
              <PaginaViagensPorPerfil />
            </RotaProtegida>
          }
        />

        <Route
          path="/viagens/:id"
          element={
            <RotaProtegida perfisPermitidos={['FUNCIONARIO', 'MOTORISTA']}>
              <DetalheViagem />
            </RotaProtegida>
          }
        />

        <Route
          path="/controle-acessos"
          element={
            <RotaProtegida perfisPermitidos={['FUNCIONARIO']}>
              <ControleAcessos />
            </RotaProtegida>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;