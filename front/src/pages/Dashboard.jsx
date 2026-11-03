import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { classeStatus, formatarData, pegarNomeCidade } from '../utils/viagemHelpers';
import {
  Ambulance,
  CalendarCheck,
  Users,
  UserRound,
  MapPin,
  ClipboardList,
  Route,
  ArrowRight,
  Activity,
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [viagens, setViagens] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [erro, setErro] = useState('');

  const ehFuncionario = usuario?.perfil === 'FUNCIONARIO';
  const ehMotorista = usuario?.perfil === 'MOTORISTA';

  useEffect(() => {
    if (ehFuncionario) {
      carregarDashboardFuncionario();
    }

    if (ehMotorista) {
      carregarDashboardMotorista();
    }
  }, []);

  async function carregarDashboardFuncionario() {
    try {
      const [
        viagensResponse,
        pacientesResponse,
        motoristasResponse,
        veiculosResponse,
      ] = await Promise.all([
        api.get('/agendamentos'),
        api.get('/pacientes'),
        api.get('/usuarios/motoristas'),
        api.get('/veiculos'),
      ]);

      setViagens(viagensResponse.data);
      setPacientes(pacientesResponse.data);
      setMotoristas(motoristasResponse.data);
      setVeiculos(veiculosResponse.data);
    } catch (error) {
      console.log(error);
      setErro('Erro ao carregar dashboard.');
    }
  }

  async function carregarDashboardMotorista() {
  if (!usuario?.id) {
    setErro('Usuário motorista não encontrado. Faça login novamente.');
    return;
  }

  try {
    const response = await api.get(`/agendamentos/motorista/${usuario.id}`);
    setViagens(response.data);
  } catch (error) {
    console.log(error);
    setErro('Erro ao carregar dashboard do motorista.');
  }
}

  function dataHojeLocal() {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  function viagensHoje() {
    const hoje = dataHojeLocal();

    return viagens.filter((viagem) => {
      if (!viagem.dataHora) {
        return false;
      }

      return viagem.dataHora.slice(0, 10) === hoje;
    });
  }

  function viagensCriadas() {
    return viagens.filter((viagem) => viagem.status === 'CRIADO');
  }

  function viagensConfirmadas() {
    return viagens.filter((viagem) => viagem.status === 'CONFIRMADO');
  }

  function viagensEmAndamento() {
    return viagens.filter((viagem) => viagem.status === 'EM_ANDAMENTO');
  }

  function viagensFinalizadas() {
    return viagens.filter(
      (viagem) =>
        viagem.status === 'FINALIZADO' ||
        viagem.status === 'CONCLUIDO'
    );
  }

  function proximasViagens() {
    return viagens
      .filter(
        (viagem) =>
          viagem.status === 'CONFIRMADO' ||
          viagem.status === 'EM_ANDAMENTO'
      )
      .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
      .slice(0, 4);
  }

  function viagensOperacionais() {
    return viagens
      .filter(
        (viagem) =>
          viagem.status === 'CRIADO' ||
          viagem.status === 'CONFIRMADO' ||
          viagem.status === 'EM_ANDAMENTO'
      )
      .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
      .slice(0, 5);
  }

  if (ehMotorista) {
    return (
      <div className="dashboard-pro">
        <div className="dashboard-top-pro">
          <div>
            <span className="dashboard-kicker">Área do motorista</span>
            <h2>Olá, {usuario?.nome}</h2>
            <p>
              Acompanhe suas viagens atribuídas, inicie percursos, finalize atendimentos
              e consulte relatórios.
            </p>
          </div>

          <button className="dashboard-main-action" onClick={() => navigate('/viagens')}>
            Ver minhas viagens
            <ArrowRight size={18} />
          </button>
        </div>

        {erro && <div className="error-message-page">{erro}</div>}

        <div className="dashboard-stat-pro-grid">
          <div className="dashboard-stat-pro">
            <div className="dashboard-stat-icon">
              <CalendarCheck size={24} />
            </div>
            <span>Minhas viagens</span>
            <strong>{viagens.length}</strong>
            <p>Total atribuído</p>
          </div>

          <div className="dashboard-stat-pro">
            <div className="dashboard-stat-icon">
              <Users size={24} />
            </div>
            <span>Hoje</span>
            <strong>{viagensHoje().length}</strong>
            <p>Agendadas para hoje</p>
          </div>

          <div className="dashboard-stat-pro">
            <div className="dashboard-stat-icon">
              <MapPin size={24} />
            </div>
            <span>Em andamento</span>
            <strong>{viagensEmAndamento().length}</strong>
            <p>Viagens iniciadas</p>
          </div>

          <div className="dashboard-stat-pro">
            <div className="dashboard-stat-icon">
              <Ambulance size={24} />
            </div>
            <span>Finalizadas</span>
            <strong>{viagensFinalizadas().length}</strong>
            <p>Histórico concluído</p>
          </div>
        </div>

        <div className="dashboard-pro-grid">
          <div className="dashboard-pro-panel large">
            <div className="dashboard-panel-header">
              <div>
                <span>Operação</span>
                <h3>Próximas viagens</h3>
              </div>
              <Route size={22} />
            </div>

            {proximasViagens().length === 0 ? (
              <div className="dashboard-empty-state">
                <Activity size={36} />
                <strong>Nenhuma viagem ativa</strong>
                <p>Você ainda não possui viagens confirmadas ou em andamento.</p>
              </div>
            ) : (
              <div className="dashboard-trip-list">
                {proximasViagens().map((viagem) => (
                  <div className="dashboard-trip-item" key={viagem.id}>
                    <div>
                      <strong>
                        {pegarNomeCidade(viagem.cidadeOrigem)} → {pegarNomeCidade(viagem.cidadeDestino)}
                      </strong>
                      <span>{formatarData(viagem.dataHora)}</span>
                    </div>

                    <div className="dashboard-trip-actions">
                      <span className={classeStatus(viagem.status)}>
                        {viagem.status}
                      </span>

                      <button
                        className="btn-small btn-edit"
                        onClick={() => navigate(`/viagens/${viagem.id}`)}
                      >
                        Abrir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-pro-panel">
            <div className="dashboard-panel-header">
              <div>
                <span>Sessão</span>
                <h3>Usuário logado</h3>
              </div>
              <UserRound size={22} />
            </div>

            <div className="dashboard-profile-pro">
              <div className="dashboard-profile-avatar">
                {usuario?.nome?.charAt(0)}
              </div>

              <h4>{usuario?.nome}</h4>
              <p>{usuario?.email}</p>

              <div className="dashboard-profile-row">
                <span>Perfil</span>
                <strong>{usuario?.perfil}</strong>
              </div>

              {usuario?.motoristaId && (
                <div className="dashboard-profile-row">
                  <span>ID motorista</span>
                  <strong>{usuario.motoristaId}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-pro">
      <div className="dashboard-top-pro">
        <div>
          <span className="dashboard-kicker">Painel administrativo</span>
          <h2>Olá, {usuario?.nome}</h2>
          <p>
            Gerencie pacientes, motoristas, veículos, consultas, exames e viagens
            sanitárias em um único painel.
          </p>
        </div>

        <button className="dashboard-main-action" onClick={() => navigate('/viagens')}>
          Criar ou gerenciar viagem
          <ArrowRight size={18} />
        </button>
      </div>

      {erro && <div className="error-message-page">{erro}</div>}

      <div className="dashboard-stat-pro-grid">
        <div className="dashboard-stat-pro">
          <div className="dashboard-stat-icon">
            <CalendarCheck size={24} />
          </div>
          <span>Viagens</span>
          <strong>{viagens.length}</strong>
          <p>Total cadastradas</p>
        </div>

        <div className="dashboard-stat-pro">
          <div className="dashboard-stat-icon">
            <Users size={24} />
          </div>
          <span>Pacientes</span>
          <strong>{pacientes.length}</strong>
          <p>Pacientes registrados</p>
        </div>

        <div className="dashboard-stat-pro">
          <div className="dashboard-stat-icon">
            <UserRound size={24} />
          </div>
          <span>Motoristas</span>
          <strong>{motoristas.length}</strong>
          <p>Motoristas ativos</p>
        </div>

        <div className="dashboard-stat-pro">
          <div className="dashboard-stat-icon">
            <Ambulance size={24} />
          </div>
          <span>Veículos</span>
          <strong>{veiculos.length}</strong>
          <p>Frota cadastrada</p>
        </div>
      </div>

      <div className="dashboard-pro-grid">
        <div className="dashboard-pro-panel large">
          <div className="dashboard-panel-header">
            <div>
              <span>Resumo operacional</span>
              <h3>Fila de acompanhamento</h3>
            </div>
            <ClipboardList size={22} />
          </div>

          <div className="dashboard-operation-grid">
            <button
              type="button"
              className="dashboard-operation-card"
              onClick={() => navigate('/viagens')}
            >
              <span>Para confirmar</span>
              <strong>{viagensCriadas().length}</strong>
              <p>Viagens criadas aguardando veículo</p>
            </button>

            <button
              type="button"
              className="dashboard-operation-card"
              onClick={() => navigate('/viagens')}
            >
              <span>Prontas</span>
              <strong>{viagensConfirmadas().length}</strong>
              <p>Viagens confirmadas para iniciar</p>
            </button>

            <button
              type="button"
              className="dashboard-operation-card"
              onClick={() => navigate('/viagens')}
            >
              <span>Em andamento</span>
              <strong>{viagensEmAndamento().length}</strong>
              <p>Viagens que já foram iniciadas</p>
            </button>

            <button
              type="button"
              className="dashboard-operation-card"
              onClick={() => navigate('/viagens')}
            >
              <span>Hoje</span>
              <strong>{viagensHoje().length}</strong>
              <p>Viagens agendadas para hoje</p>
            </button>
          </div>

          <div className="dashboard-attention-list">
            <div className="dashboard-attention-header">
              <h4>Viagens que precisam de acompanhamento</h4>

              <button className="btn-small btn-edit" onClick={() => navigate('/viagens')}>
                Ver todas
              </button>
            </div>

            {viagensOperacionais().length === 0 ? (
              <div className="dashboard-empty-state compact">
                <Activity size={30} />
                <strong>Nenhuma viagem pendente</strong>
                <p>Não há viagens criadas, confirmadas ou em andamento no momento.</p>
              </div>
            ) : (
              <div className="dashboard-attention-items">
                {viagensOperacionais().map((viagem) => (
                  <div className="dashboard-attention-item" key={viagem.id}>
                    <div>
                      <strong>
                        {pegarNomeCidade(viagem.cidadeOrigem)} → {pegarNomeCidade(viagem.cidadeDestino)}
                      </strong>
                      <span>{formatarData(viagem.dataHora)}</span>
                    </div>

                    <div className="dashboard-attention-actions">
                      <span className={classeStatus(viagem.status)}>
                        {viagem.status}
                      </span>

                      <button
                        className="btn-small btn-edit"
                        onClick={() => navigate(`/viagens/${viagem.id}`)}
                      >
                        Abrir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-pro-panel">
          <div className="dashboard-panel-header">
            <div>
              <span>Sessão</span>
              <h3>Usuário logado</h3>
            </div>
            <UserRound size={22} />
          </div>

          <div className="dashboard-profile-pro">
            <div className="dashboard-profile-avatar">
              {usuario?.nome?.charAt(0)}
            </div>

            <h4>{usuario?.nome}</h4>
            <p>{usuario?.email}</p>

            <div className="dashboard-profile-row">
              <span>Perfil</span>
              <strong>{usuario?.perfil}</strong>
            </div>

            {usuario?.motoristaId && (
              <div className="dashboard-profile-row">
                <span>ID motorista</span>
                <strong>{usuario.motoristaId}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;