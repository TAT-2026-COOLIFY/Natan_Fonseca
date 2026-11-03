import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import api from '../api/api';
import logoSigts from '../assets/logo-sigts.png';
import PasswordInput from '../components/PasswordInput';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('funcionario@sigts.com');
  const [senha, setSenha] = useState('123456');
  const [manterConectado, setManterConectado] = useState(true);

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar(event) {
    event.preventDefault();

    setErro('');
    setCarregando(true);

    if (!email.trim()) {
      setErro('Informe o e-mail.');
      setCarregando(false);
      return;
    }

    if (!senha.trim()) {
      setErro('Informe a senha.');
      setCarregando(false);
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        senha: senha.trim(),
      });

      localStorage.setItem('usuario', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('manterConectado', manterConectado ? 'true' : 'false');

      if (manterConectado) {
        sessionStorage.removeItem('sessaoAtiva');
      } else {
        sessionStorage.setItem('sessaoAtiva', 'true');
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.log(error);

      const resposta = error.response?.data;

      if (typeof resposta === 'string') {
        setErro(resposta);
      } else if (resposta?.message) {
        setErro(resposta.message);
      } else {
        setErro('E-mail ou senha inválidos.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-box">
          <img src={logoSigts} alt="SIGTS" className="login-logo-img" />
        </div>

        <h1>SIGTS</h1>
        <p className="login-subtitle">
          Sistema Inteligente de Gestão de Transporte Sanitário
        </p>

        {erro && <div className="error-message">{erro}</div>}

        <form onSubmit={entrar} className="login-form">
          <div className="login-input-group">
            <label>E-mail</label>

            <div className="login-input-icon">
              <Mail size={18} />
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="login-input-group">
            <label>Senha</label>

            <div className="login-input-icon">
              <Lock size={18} />
              <PasswordInput
                placeholder="Digite sua senha"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
              />
            </div>
          </div>

          <label className="login-remember-row">
            <input
              type="checkbox"
              checked={manterConectado}
              onChange={(event) => setManterConectado(event.target.checked)}
            />
            Manter conectado neste navegador
          </label>

          <button type="submit" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="login-footnote">TCC ADS - Sistema de Transporte Sanitário</p>
      </div>
    </div>
  );
}

export default Login;