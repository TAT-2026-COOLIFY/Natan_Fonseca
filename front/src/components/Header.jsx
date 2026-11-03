import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Moon, ShieldCheck, Sun } from 'lucide-react';

function Header({ temaEscuro, alternarTema, alternarMenuMobile }) {
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  function sair() {
  localStorage.removeItem('usuario');
  localStorage.removeItem('token');
  localStorage.removeItem('manterConectado');
  sessionStorage.removeItem('sessaoAtiva');

  navigate('/login', { replace: true });
}

  return (
    <header className="header">
      <div className="header-title-area">
        <button className="mobile-menu-toggle" onClick={alternarMenuMobile}>
          <Menu size={22} />
        </button>

        <div>
          <span className="header-label">Painel Administrativo</span>
          <h1>Sistema Inteligente de Gestão de Transporte Sanitário</h1>
        </div>
      </div>

      <div className="header-actions">
        <button className="theme-toggle-button" onClick={alternarTema}>
          {temaEscuro ? <Sun size={18} /> : <Moon size={18} />}
          <span>{temaEscuro ? 'Claro' : 'Escuro'}</span>
        </button>

        {usuario && (
          <div className="user-card-header">
            <div className="user-avatar-header">
              {usuario.nome?.charAt(0)}
            </div>

            <div>
              <strong>{usuario.nome}</strong>
              <span>
                <ShieldCheck size={13} />
                {usuario.perfil}
              </span>
            </div>
          </div>
        )}

        <button className="logout-button" onClick={sair}>
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}

export default Header;