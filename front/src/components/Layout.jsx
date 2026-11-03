import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout({ children }) {
  const [sidebarFechada, setSidebarFechada] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [temaEscuro, setTemaEscuro] = useState(() => {
    return localStorage.getItem('tema') === 'escuro';
  });

  useEffect(() => {
    if (temaEscuro) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('tema', 'escuro');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('tema', 'claro');
    }
  }, [temaEscuro]);

  function alternarSidebar() {
    setSidebarFechada(!sidebarFechada);
  }

  function alternarMenuMobile() {
    setMenuMobileAberto((atual) => !atual);
  }

  function fecharMenuMobile() {
    setMenuMobileAberto(false);
  }

  function alternarTema() {
  document.body.classList.add('theme-transition');

  requestAnimationFrame(() => {
    setTemaEscuro((temaAtual) => !temaAtual);
  });

  setTimeout(() => {
    document.body.classList.remove('theme-transition');
  }, 600);
}

  return (
    <div className={sidebarFechada ? 'layout sidebar-collapsed' : 'layout'}>
      <Sidebar
        sidebarFechada={sidebarFechada}
        alternarSidebar={alternarSidebar}
        menuMobileAberto={menuMobileAberto}
        fecharMenuMobile={fecharMenuMobile}
      />

      {menuMobileAberto && (
        <div className="sidebar-backdrop" onClick={fecharMenuMobile}></div>
      )}

      <div className="main-area">
        <Header
          temaEscuro={temaEscuro}
          alternarTema={alternarTema}
          alternarMenuMobile={alternarMenuMobile}
        />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

export default Layout;