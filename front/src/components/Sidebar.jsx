import { NavLink } from 'react-router-dom';
import logoSigts from '../assets/logo-sigts.png';
import {
  LayoutDashboard,
  Users,
  Ambulance,
  ClipboardPlus,
  CalendarDays,
  Route,
  Menu,
  UserCog,
} from 'lucide-react';

function Sidebar({ sidebarFechada, alternarSidebar, menuMobileAberto, fecharMenuMobile }) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const ehFuncionario = usuario?.perfil === 'FUNCIONARIO';
  const ehMotorista = usuario?.perfil === 'MOTORISTA';

  const classes = ['sidebar'];

  if (sidebarFechada) {
    classes.push('collapsed');
  }

  if (menuMobileAberto) {
    classes.push('mobile-open');
  }

  return (
    <aside className={classes.join(' ')}>
      <div className="sidebar-top">
        <NavLink to="/dashboard" className="sidebar-brand sidebar-brand-link">
          <div className="brand-icon brand-logo-box">
            <img src={logoSigts} alt="SIGTS" className="brand-logo-img" />
          </div>

          {!sidebarFechada && (
            <div className="brand-text">
              <h2>SIGTS</h2>
              <span>Transporte Sanitário</span>
            </div>
          )}
        </NavLink>

        <button className="sidebar-toggle" onClick={alternarSidebar}>
          <Menu size={22} />
        </button>
      </div>

      <nav className="sidebar-menu" onClick={fecharMenuMobile}>
        <NavLink to="/dashboard" title="Dashboard">
          <LayoutDashboard size={20} />
          {!sidebarFechada && <span>Dashboard</span>}
        </NavLink>

        {ehFuncionario && (
          <>
            <NavLink to="/pacientes" title="Pacientes">
              <Users size={20} />
              {!sidebarFechada && <span>Pacientes</span>}
            </NavLink>

            <NavLink to="/veiculos" title="Veículos">
              <Ambulance size={20} />
              {!sidebarFechada && <span>Veículos</span>}
            </NavLink>

            <NavLink to="/exames" title="Exames">
              <ClipboardPlus size={20} />
              {!sidebarFechada && <span>Exames</span>}
            </NavLink>

            <NavLink to="/consultas" title="Consultas">
              <CalendarDays size={20} />
              {!sidebarFechada && <span>Consultas</span>}
            </NavLink>
          </>
        )}

        {(ehFuncionario || ehMotorista) && (
          <NavLink
            to="/viagens"
            title={ehMotorista ? 'Minhas viagens' : 'Viagens'}
          >
            <Route size={20} />
            {!sidebarFechada && (
              <span>{ehMotorista ? 'Minhas viagens' : 'Viagens'}</span>
            )}
          </NavLink>
        )}

        {ehFuncionario && (
          <NavLink to="/controle-acessos" title="Controle de Acessos">
            <UserCog size={20} />
            {!sidebarFechada && <span>Controle de Acessos</span>}
          </NavLink>
        )}
      </nav>

      {!sidebarFechada && (
        <div className="sidebar-footer">
          <span>{ehMotorista ? 'Área do motorista' : 'Sistema acadêmico'}</span>
          <strong>{ehMotorista ? 'Minhas viagens' : 'TCC ADS'}</strong>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;