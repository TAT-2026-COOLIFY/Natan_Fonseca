import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import EstabelecimentoAutocomplete from '../components/EstabelecimentoAutocomplete';
import MapaRota from '../components/MapaRota';
import {
  classeStatus,
  extrairMensagemErro,
  formatarData,
  formatarDistancia,
  formatarDuracao,
  normalizarTexto,
  pegarNomeCidade,
  pegarNomeVeiculo,
} from '../utils/viagemHelpers';
import {
  Ambulance,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileDown,
  History,
  MapPin,
  MessageCircle,
  PlayCircle,
  Search,
  Square,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';

function DetalheViagem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const ehFuncionario = usuario?.perfil === 'FUNCIONARIO';
  const ehMotorista = usuario?.perfil === 'MOTORISTA';

  const [viagem, setViagem] = useState(null);
  const [passageiros, setPassageiros] = useState([]);
  const [vagas, setVagas] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [buscaHistorico, setBuscaHistorico] = useState('');

  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [exames, setExames] = useState([]);

  const [motoristaId, setMotoristaId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');

  const [pacienteId, setPacienteId] = useState('');
  const [hospital, setHospital] = useState('');
  const [consultaId, setConsultaId] = useState('');
  const [exameId, setExameId] = useState('');
  const [horarioAtendimento, setHorarioAtendimento] = useState('');
  const [observacao, setObservacao] = useState('');
  const [erroPassageiro, setErroPassageiro] = useState('');

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [erroOperacao, setErroOperacao] = useState('');

  const [pdfUrl, setPdfUrl] = useState('');
  const [modalPdfAberto, setModalPdfAberto] = useState(false);
  const [pdfCarregando, setPdfCarregando] = useState(false);

  const [viagemLiberadaParaMotorista, setViagemLiberadaParaMotorista] = useState(false);
  const [verificacaoMotoristaConcluida, setVerificacaoMotoristaConcluida] = useState(!ehMotorista);

  useEffect(() => {
    carregarTudo();
  }, [id]);

  useEffect(() => {
    if (!mensagem && !erro) {
      return;
    }

    const timer = setTimeout(() => {
      setMensagem('');
      setErro('');
    }, 2200);

    return () => clearTimeout(timer);
  }, [mensagem, erro]);

  useEffect(() => {
    if (!erroPassageiro) {
      return;
    }

    const timer = setTimeout(() => {
      setErroPassageiro('');
    }, 2200);

    return () => clearTimeout(timer);
  }, [erroPassageiro]);

  useEffect(() => {
    if (!erroOperacao) {
      return;
    }

    const timer = setTimeout(() => {
      setErroOperacao('');
    }, 2200);

    return () => clearTimeout(timer);
  }, [erroOperacao]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  async function carregarTudo() {
    setViagemLiberadaParaMotorista(false);

    if (ehMotorista) {
      setVerificacaoMotoristaConcluida(false);
    }

    await carregarViagem();

    if (ehMotorista && usuario?.id) {
      await verificarSeViagemPertenceAoMotorista();
    } else {
      setVerificacaoMotoristaConcluida(true);
    }

    await carregarListas();
    await carregarPassageiros();
    await carregarVagas();

    if (ehFuncionario) {
      await carregarHistorico();
    } else {
      setHistorico([]);
    }
  }

  async function carregarViagem() {
    try {
      const response = await api.get(`/agendamentos/${id}`);
      const viagemCarregada = response.data;

      setViagem(viagemCarregada);

      if (viagemCarregada.veiculo?.id) {
        setVeiculoId(viagemCarregada.veiculo.id);
      }

      if (viagemCarregada.motoristaId) {
        setMotoristaId(viagemCarregada.motoristaId);
      }

      if (viagemCarregada.motorista?.id) {
        setMotoristaId(viagemCarregada.motorista.id);
      }

      return viagemCarregada;
    } catch (error) {
      console.log(error);
      setErro('Erro ao carregar dados da viagem.');
      return null;
    }
  }

  async function verificarSeViagemPertenceAoMotorista() {
    try {
      const response = await api.get(`/agendamentos/motorista/${usuario.id}`);

      const encontrada = response.data.some((viagemMotorista) => {
        return String(viagemMotorista.id) === String(id);
      });

      setViagemLiberadaParaMotorista(encontrada);
    } catch (error) {
      console.log(error);
      setViagemLiberadaParaMotorista(false);
    } finally {
      setVerificacaoMotoristaConcluida(true);
    }
  }

  async function carregarListas() {
    if (!ehFuncionario) {
      return;
    }

    try {
      const [
        veiculosResponse,
        motoristasResponse,
        pacientesResponse,
        consultasResponse,
        examesResponse,
      ] = await Promise.all([
        api.get('/veiculos'),
        api.get('/usuarios/motoristas'),
        api.get('/pacientes'),
        api.get('/consultas'),
        api.get('/exames'),
      ]);

      setVeiculos(veiculosResponse.data);
      setMotoristas(motoristasResponse.data);
      setPacientes(pacientesResponse.data);
      setConsultas(consultasResponse.data);
      setExames(examesResponse.data);
    } catch (error) {
      console.log(error);
      setErro('Erro ao carregar listas auxiliares.');
    }
  }

  async function carregarPassageiros() {
    try {
      const response = await api.get(`/agendamentos/${id}/passageiros`);
      setPassageiros(response.data);
    } catch (error) {
      console.log(error);
      setPassageiros([]);
    }
  }

  async function carregarVagas() {
    try {
      const response = await api.get(`/agendamentos/${id}/vagas`);
      setVagas(response.data);
    } catch (error) {
      console.log(error);
      setVagas(null);
    }
  }

  async function carregarHistorico() {
    if (!ehFuncionario) {
      setHistorico([]);
      return;
    }

    try {
      const response = await api.get(`/agendamentos/${id}/historico`);
      setHistorico(response.data);
    } catch (error) {
      console.log(error);
      setHistorico([]);
    }
  }

  async function confirmarViagem() {
    if (!ehFuncionario) {
      setErroOperacao('Somente funcionário pode confirmar a viagem.');
      return;
    }

    if (!motoristaId) {
      setErroOperacao('Selecione um motorista antes de confirmar a viagem.');
      return;
    }

    if (!veiculoId) {
      setErroOperacao('Selecione um veículo antes de confirmar a viagem.');
      return;
    }

    try {
      await api.post(`/agendamentos/${id}/confirmar`, {
        veiculoId: Number(veiculoId),
        motoristaId: Number(motoristaId),
      });

      setMensagem('Viagem confirmada e atribuída ao motorista com sucesso.');
      setErroOperacao('');
      carregarTudo();
    } catch (error) {
      tratarErroOperacao(error, 'Erro ao confirmar viagem.');
    }
  }

  async function iniciarViagem() {
    if (!podeIniciarViagem()) {
      setErroOperacao('Você não tem permissão para iniciar esta viagem ou ela não está confirmada.');
      return;
    }

    try {
      await api.post(`/agendamentos/${id}/iniciar`);

      setMensagem('Viagem iniciada com sucesso.');
      setErroOperacao('');
      carregarTudo();
    } catch (error) {
      tratarErroOperacao(error, 'Erro ao iniciar viagem.');
    }
  }

  async function finalizarViagem() {
    if (!ehMotorista) {
      setErroOperacao('Somente motorista pode finalizar a viagem.');
      return;
    }

    if (!podeFinalizarViagem()) {
      setErroOperacao('Você não tem permissão para finalizar esta viagem.');
      return;
    }

    try {
      await api.post(`/agendamentos/${id}/finalizar`);

      setMensagem('Viagem finalizada com sucesso.');
      setErroOperacao('');
      carregarTudo();
    } catch (error) {
      tratarErroOperacao(error, 'Erro ao finalizar viagem.');
    }
  }

  async function cancelarViagem() {
    if (!ehFuncionario) {
      setErroOperacao('Somente funcionário pode cancelar a viagem.');
      return;
    }

    const confirmar = window.confirm('Tem certeza que deseja cancelar esta viagem?');

    if (!confirmar) {
      return;
    }

    try {
      await api.post(`/agendamentos/${id}/cancelar`);

      setMensagem('Viagem cancelada com sucesso.');
      setErroOperacao('');
      carregarTudo();
    } catch (error) {
      tratarErroOperacao(error, 'Erro ao cancelar viagem.');
    }
  }

  async function notificarMotorista() {
    if (!ehFuncionario) {
      setErroOperacao('Somente funcionário pode notificar o motorista.');
      return;
    }

    if (!podeNotificarMotorista()) {
      setErroOperacao('Confirme a viagem e atribua um motorista antes de enviar a notificação.');
      return;
    }

    try {
      setMensagem('');
      setErroOperacao('');

      const response = await api.post(`/agendamentos/${id}/notificar-motorista`);

      if (response.data?.link) {
        window.open(response.data.link, '_blank');
        setMensagem('WhatsApp aberto com a mensagem da viagem.');
        carregarHistorico();
      } else {
        setErroOperacao('O backend não retornou o link do WhatsApp.');
      }
    } catch (error) {
      tratarErroOperacao(error, 'Erro ao gerar mensagem para o motorista.');
    }
  }

  async function adicionarPassageiro(event) {
    event.preventDefault();

    if (!ehFuncionario) {
      setErroPassageiro('Somente funcionário pode adicionar passageiro.');
      return;
    }

    if (!viagem.veiculo) {
      setErroPassageiro('Não é possível adicionar passageiro sem veículo confirmado.');
      return;
    }

    if (!pacienteId) {
      setErroPassageiro('Selecione um paciente.');
      return;
    }

    if (!hospital) {
      setErroPassageiro('Informe o hospital ou clínica.');
      return;
    }

    if (!horarioAtendimento) {
      setErroPassageiro('Informe o horário de atendimento.');
      return;
    }

    const dataDaViagem = viagem.dataHora.slice(0, 10);
    const horarioAtendimentoCompleto = `${dataDaViagem}T${horarioAtendimento}:00`;

    const dados = {
      pacienteId: Number(pacienteId),
      hospital,
      consultaId: consultaId ? Number(consultaId) : null,
      exameId: exameId ? Number(exameId) : null,
      horarioAtendimento: horarioAtendimentoCompleto,
      observacao: observacao.trim() || null,
    };

    try {
      await api.post(`/agendamentos/${id}/passageiros`, dados);

      setMensagem('Passageiro adicionado com sucesso.');
      setErroPassageiro('');
      limparFormularioPassageiro();
      carregarTudo();
    } catch (error) {
      console.log(error);
      setErroPassageiro(extrairMensagemErro(error, 'Erro ao adicionar passageiro.'));
    }
  }

  async function removerPassageiro(passageiro) {
    if (!ehFuncionario) {
      setErro('Somente funcionário pode remover passageiro.');
      return;
    }

    const confirmar = window.confirm('Remover este passageiro da viagem?');

    if (!confirmar) {
      return;
    }

    try {
      await api.delete(`/agendamentos/${id}/passageiros/${passageiro.paciente.id}`);

      setMensagem('Passageiro removido com sucesso.');
      setErro('');
      carregarTudo();
    } catch (error) {
      tratarErro(error, 'Erro ao remover passageiro.');
    }
  }

  async function abrirPreviaPdf() {
    if (!podeVisualizarPdf()) {
      setErro('Você não tem permissão para visualizar o relatório desta viagem.');
      return;
    }

    try {
      setPdfCarregando(true);
      setErro('');

      const response = await api.get(`/agendamentos/${id}/relatorio`, {
        responseType: 'blob',
      });

      const arquivoPdf = new Blob([response.data], {
        type: 'application/pdf',
      });

      const url = window.URL.createObjectURL(arquivoPdf);

      setPdfUrl(url);
      setModalPdfAberto(true);
    } catch (error) {
      tratarErro(error, 'Erro ao carregar prévia do PDF.');
    } finally {
      setPdfCarregando(false);
    }
  }

  function baixarPdfDaPrevia() {
    if (!pdfUrl) {
      return;
    }

    const link = document.createElement('a');

    link.href = pdfUrl;
    link.setAttribute('download', `relatorio_viagem_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function abrirPdfNovaAba() {
    if (!pdfUrl) {
      return;
    }

    window.open(pdfUrl, '_blank');
  }

  function fecharPreviaPdf() {
    setModalPdfAberto(false);

    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl('');
    }
  }

  function tratarErro(error, mensagemPadrao) {
    console.log(error);
    setErro(extrairMensagemErro(error, mensagemPadrao));
  }

  function tratarErroOperacao(error, mensagemPadrao) {
    console.log(error);
    setErroOperacao(extrairMensagemErro(error, mensagemPadrao));
  }

  function limparFormularioPassageiro() {
    setPacienteId('');
    setHospital('');
    setConsultaId('');
    setExameId('');
    setHorarioAtendimento('');
    setObservacao('');
    setErroPassageiro('');
  }

  function formatarHorario(dataHora) {
    if (!dataHora) {
      return '-';
    }

    return new Date(dataHora).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function temCoordenadasDaRota() {
    return (
      viagem?.cidadeOrigem?.latitude !== null &&
      viagem?.cidadeOrigem?.latitude !== undefined &&
      viagem?.cidadeOrigem?.longitude !== null &&
      viagem?.cidadeOrigem?.longitude !== undefined &&
      viagem?.cidadeDestino?.latitude !== null &&
      viagem?.cidadeDestino?.latitude !== undefined &&
      viagem?.cidadeDestino?.longitude !== null &&
      viagem?.cidadeDestino?.longitude !== undefined
    );
  }

  function pegarNomeMotoristaDaViagem() {
    if (viagem?.motoristaNome) {
      return viagem.motoristaNome;
    }

    if (viagem?.motorista?.nome) {
      return viagem.motorista.nome;
    }

    return 'Não atribuído';
  }

  function viagemBloqueada() {
    return viagem.status === 'FINALIZADO' || viagem.status === 'CANCELADO';
  }

  function passageiroBloqueado() {
    return !ehFuncionario || !viagem.veiculo || viagemBloqueada();
  }

  function pegarMotoristaIdDaViagem() {
    if (viagem?.motoristaId) {
      return viagem.motoristaId;
    }

    if (viagem?.motorista?.id) {
      return viagem.motorista.id;
    }

    return null;
  }

  function pegarMotoristaIdDoUsuarioLogado() {
    if (usuario?.motoristaId) {
      return usuario.motoristaId;
    }

    if (usuario?.perfil === 'MOTORISTA' && usuario?.id) {
      return usuario.id;
    }

    return null;
  }

  function motoristaDaViagem() {
    const motoristaIdDaViagem = pegarMotoristaIdDaViagem();
    const motoristaIdDoUsuario = pegarMotoristaIdDoUsuarioLogado();

    if (!motoristaIdDaViagem || !motoristaIdDoUsuario) {
      return false;
    }

    return String(motoristaIdDaViagem) === String(motoristaIdDoUsuario);
  }

  function motoristaPodeOperarViagem() {
    if (!ehMotorista) {
      return false;
    }

    return motoristaDaViagem() || viagemLiberadaParaMotorista;
  }

  function podeAcessarViagem() {
    if (ehFuncionario) {
      return true;
    }

    if (ehMotorista) {
      return motoristaPodeOperarViagem();
    }

    return false;
  }

  function podeConfirmarViagem() {
    return ehFuncionario && viagem.status === 'CRIADO';
  }

  function podeIniciarViagem() {
    if (viagem.status !== 'CONFIRMADO') {
      return false;
    }

    return motoristaPodeOperarViagem();
  }

  function podeFinalizarViagem() {
    return motoristaPodeOperarViagem() && viagem.status === 'EM_ANDAMENTO';
  }

  function podeCancelarViagem() {
    return ehFuncionario && viagem.status !== 'FINALIZADO' && viagem.status !== 'CANCELADO';
  }

  function podeVisualizarPdf() {
    if (ehFuncionario) {
      return true;
    }

    return motoristaPodeOperarViagem();
  }

  function podeNotificarMotorista() {
    if (!ehFuncionario) {
      return false;
    }

    if (viagem.status === 'CRIADO') {
      return false;
    }

    if (viagem.status === 'CANCELADO') {
      return false;
    }

    return Boolean(pegarMotoristaIdDaViagem() || motoristaId);
  }

  function formatarAcaoHistorico(acao) {
    const nomes = {
      VIAGEM_CRIADA: 'Viagem criada',
      VIAGEM_EDITADA: 'Viagem editada',
      VIAGEM_CONFIRMADA: 'Viagem confirmada',
      MOTORISTA_NOTIFICADO: 'Motorista notificado',
      VIAGEM_INICIADA: 'Viagem iniciada',
      VIAGEM_FINALIZADA: 'Viagem finalizada',
      VIAGEM_CANCELADA: 'Viagem cancelada',
      PASSAGEIRO_ADICIONADO: 'Passageiro adicionado',
      PASSAGEIRO_REMOVIDO: 'Passageiro removido',
    };

    return nomes[acao] || acao || 'Registro operacional';
  }

  function historicoFiltrado() {
    const busca = normalizarTexto(buscaHistorico);

    if (!busca) {
      return historico;
    }

    return historico.filter((item) => {
      const campos = [
        formatarAcaoHistorico(item.acao),
        item.descricao,
        item.usuarioNome,
        formatarData(item.dataHora),
      ];

      return campos.some((campo) => normalizarTexto(campo).includes(busca));
    });
  }

  function classeAcaoHistorico(acao) {
    if (acao === 'VIAGEM_CANCELADA') {
      return 'history-dot danger';
    }

    if (acao === 'VIAGEM_FINALIZADA') {
      return 'history-dot neutral';
    }

    if (acao === 'VIAGEM_INICIADA') {
      return 'history-dot warning';
    }

    if (acao === 'VIAGEM_CONFIRMADA' || acao === 'MOTORISTA_NOTIFICADO') {
      return 'history-dot success';
    }

    return 'history-dot info';
  }

  if (!viagem) {
    return (
      <div>
        <div className="page-title">
          <h2>Gerenciar viagem</h2>
          <p>Carregando informações da viagem...</p>
        </div>
      </div>
    );
  }

  if (ehMotorista && !verificacaoMotoristaConcluida) {
    return (
      <div>
        <div className="page-title">
          <h2>Gerenciar viagem</h2>
          <p>Verificando permissão do motorista...</p>
        </div>
      </div>
    );
  }

  if (!podeAcessarViagem()) {
    return (
      <div>
        <div className="page-title page-title-row">
          <div>
            <h2>Acesso não permitido</h2>
            <p>Esta viagem não está vinculada ao motorista logado.</p>
          </div>

          <button className="btn-secondary" onClick={() => navigate('/viagens')}>
            Voltar
          </button>
        </div>

        <div className="error-message-page">
          Você só pode visualizar viagens atribuídas ao seu motorista.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-title page-title-row">
        <div>
          <h2>Gerenciar viagem</h2>
          <p>
            Acompanhe rota, veículo, motorista responsável, passageiros,
            status operacional e relatório da viagem.
          </p>
        </div>

        <button className="btn-secondary" onClick={() => navigate('/viagens')}>
          Voltar
        </button>
      </div>

      {mensagem && <div className="success-message">{mensagem}</div>}
      {erro && <div className="error-message-page">{erro}</div>}

      <div className="trip-planner-card">
        <div className="trip-planner-header">
          <h3>{ehMotorista ? 'Área do motorista' : 'Controle da viagem sanitária'}</h3>
        </div>

        <div className="manage-trip-body">
          <div className="manage-route-card">
            <div className="trip-section-title">
              <strong>Resumo da rota</strong>
              <span>Origem, destino e dados estimados da viagem</span>
            </div>

            <div className="route-summary-box">
              <div className="route-summary-line">
                <span>Origem</span>
                <strong>{pegarNomeCidade(viagem.cidadeOrigem)}</strong>
              </div>

              <div className="route-summary-divider"></div>

              <div className="route-summary-line">
                <span>Destino</span>
                <strong>{pegarNomeCidade(viagem.cidadeDestino)}</strong>
              </div>
            </div>

            <div className="manage-metrics-grid">
              <div>
                <CalendarClock size={22} />
                <span>Data e hora</span>
                <strong>{formatarData(viagem.dataHora)}</strong>
              </div>

              <div>
                <MapPin size={22} />
                <span>Distância</span>
                <strong>{formatarDistancia(viagem.distanciaKm)}</strong>
              </div>

              <div>
                <CheckCircle2 size={22} />
                <span>Duração</span>
                <strong>{formatarDuracao(viagem.duracaoMinutos)}</strong>
              </div>

              <div>
                <Users size={22} />
                <span>Vagas</span>
                <strong>{vagas === null ? '-' : vagas}</strong>
              </div>
            </div>
          </div>

          <div className="manage-status-card">
            <div className="trip-section-title">
              <strong>Status operacional</strong>
              <span>Situação atual da viagem</span>
            </div>

            <div className="status-big-box">
              <span className={classeStatus(viagem.status)}>{viagem.status}</span>
              <p>
                {viagem.status === 'CRIADO' &&
                  'A viagem foi criada e ainda precisa ser confirmada com motorista e veículo.'}
                {viagem.status === 'CONFIRMADO' &&
                  'A viagem está confirmada e pronta para ser iniciada.'}
                {viagem.status === 'EM_ANDAMENTO' &&
                  'A viagem está em andamento e pode ser finalizada pelo motorista responsável.'}
                {(viagem.status === 'FINALIZADO' || viagem.status === 'CONCLUIDO') &&
                  'A viagem foi finalizada e está disponível para histórico e relatório.'}
                {viagem.status === 'CANCELADO' &&
                  'A viagem foi cancelada e não permite novas operações.'}
              </p>
            </div>

            <div className="vehicle-selected-box">
              <span>Motorista responsável</span>
              <strong>{pegarNomeMotoristaDaViagem()}</strong>
            </div>

            <div className="vehicle-selected-box">
              <span>Veículo atual</span>
              <strong>{pegarNomeVeiculo(viagem.veiculo)}</strong>
            </div>
          </div>
        </div>
      </div>

      {ehMotorista && temCoordenadasDaRota() && (
        <div className="driver-route-map-section">
          <MapaRota
            origem={viagem.cidadeOrigem}
            destino={viagem.cidadeDestino}
            distanciaReferenciaKm={viagem.distanciaKm}
            selecionavel={false}
          />
        </div>
      )}

      <div className={ehFuncionario ? 'manage-grid' : 'manage-grid single-panel'}>
        <div className="form-panel manage-panel">
          <div className="panel-title-inline">
            <Ambulance size={22} />
            <div>
              <h3>{ehMotorista ? 'Operações do motorista' : 'Motorista, veículo e operação'}</h3>
              <p>
                {ehMotorista
                  ? 'Inicie, finalize e visualize o relatório da viagem'
                  : 'Atribua motorista e veículo, e inicie ou cancele a viagem'}
              </p>
            </div>
          </div>

          {ehFuncionario && (
            <>
              <div className="form-group">
                <label>Motorista responsável</label>
                <select
                  value={motoristaId}
                  onChange={(event) => setMotoristaId(event.target.value)}
                  disabled={viagem.status !== 'CRIADO'}
                >
                  <option value="">Selecione um motorista</option>

                  {motoristas.map((motorista) => (
                    <option key={motorista.id} value={motorista.id}>
                      {motorista.nome} - {motorista.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Veículo da viagem</label>
                <select
                  value={veiculoId}
                  onChange={(event) => setVeiculoId(event.target.value)}
                  disabled={viagem.status !== 'CRIADO'}
                >
                  <option value="">Selecione um veículo</option>

                  {veiculos.map((veiculo) => (
                    <option key={veiculo.id} value={veiculo.id}>
                      {veiculo.modelo} - {veiculo.placa} | Capacidade: {veiculo.capacidade}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {erroOperacao && (
            <div className="error-message-page">{erroOperacao}</div>
          )}

          <div className="manage-actions-grid">
            {ehFuncionario && (
              <button
                className="btn-primary"
                onClick={confirmarViagem}
                disabled={!podeConfirmarViagem()}
              >
                <CheckCircle2 size={18} />
                Confirmar
              </button>
            )}

            {ehMotorista && (
              <button
                className="btn-primary"
                onClick={iniciarViagem}
                disabled={!podeIniciarViagem()}
              >
                <PlayCircle size={18} />
                Iniciar
              </button>
            )}

            {ehMotorista && (
              <button
                className="btn-primary"
                onClick={finalizarViagem}
                disabled={!podeFinalizarViagem()}
              >
                <Square size={18} />
                Finalizar
              </button>
            )}

            {ehFuncionario && (
              <button
                className="btn-danger-action"
                onClick={cancelarViagem}
                disabled={!podeCancelarViagem()}
              >
                <XCircle size={18} />
                Cancelar
              </button>
            )}

            {ehFuncionario && (
              <button
                className="btn-secondary"
                onClick={notificarMotorista}
                disabled={!podeNotificarMotorista()}
              >
                <MessageCircle size={18} />
                Notificar motorista
              </button>
            )}

            <button
              className="btn-secondary"
              onClick={abrirPreviaPdf}
              disabled={pdfCarregando || !podeVisualizarPdf()}
            >
              <FileDown size={18} />
              {pdfCarregando ? 'Carregando...' : 'Visualizar PDF'}
            </button>
          </div>
        </div>

        {ehFuncionario && (
          <div className="form-panel manage-panel">
            <div className="panel-title-inline">
              <UserPlus size={22} />
              <div>
                <h3>Adicionar passageiro</h3>
                <p>Vincule pacientes, atendimento e exame à viagem</p>
              </div>
            </div>

            {!viagem.veiculo && (
              <div className="passenger-warning">
                <strong>Veículo não confirmado</strong>
                <p>
                  Não é possível adicionar passageiro sem veículo. Selecione um motorista,
                  escolha o veículo e confirme a viagem primeiro.
                </p>
              </div>
            )}

            <form onSubmit={adicionarPassageiro} className="passenger-form-grid">
              <div className="form-group">
                <label>Paciente</label>
                <select
                  value={pacienteId}
                  onChange={(event) => {
                    setPacienteId(event.target.value);
                    setConsultaId('');
                  }}
                  disabled={passageiroBloqueado()}
                >
                  <option value="">Selecione um paciente</option>

                  {pacientes.map((paciente) => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <EstabelecimentoAutocomplete
                label="Hospital / Clínica"
                placeholder={`Digite o hospital ou clínica em ${viagem.cidadeDestino?.nome || 'destino'}`}
                valorInicial={hospital}
                disabled={passageiroBloqueado()}
                cidade={viagem.cidadeDestino}
                onEstabelecimentoSelecionado={(estabelecimento) => {
                  // guarda o endereco junto pro motorista saber onde fica
                  const texto = estabelecimento.enderecoCompleto
                    ? `${estabelecimento.nome} - ${estabelecimento.enderecoCompleto}`
                    : estabelecimento.nome;

                  setHospital(texto.slice(0, 255));
                }}
              />

              <div className="form-group">
                <label>Consulta</label>
                <select
                  value={consultaId}
                  onChange={(event) => setConsultaId(event.target.value)}
                  disabled={passageiroBloqueado()}
                >
                  <option value="">Sem consulta</option>

                  {consultas.map((consulta) => (
                    <option key={consulta.id} value={consulta.id}>
                      {consulta.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Exame</label>
                <select
                  value={exameId}
                  onChange={(event) => setExameId(event.target.value)}
                  disabled={passageiroBloqueado()}
                >
                  <option value="">Sem exame</option>

                  {exames.map((exame) => (
                    <option key={exame.id} value={exame.id}>
                      {exame.nome} {exame.exigeIsolamento ? '(isolamento)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Horário de atendimento</label>
                <input
                  type="time"
                  value={horarioAtendimento}
                  onChange={(event) => setHorarioAtendimento(event.target.value)}
                  disabled={passageiroBloqueado()}
                />
              </div>

              <div className="form-group">
                <label>Observação</label>
                <input
                  type="text"
                  placeholder="Ex: cadeira de rodas, acompanhante, alergia..."
                  value={observacao}
                  onChange={(event) => setObservacao(event.target.value)}
                  disabled={passageiroBloqueado()}
                />
              </div>

              {erroPassageiro && (
                <div className="error-message-page passenger-full">
                  {erroPassageiro}
                </div>
              )}

              <div className="form-actions passenger-full">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={passageiroBloqueado()}
                >
                  Adicionar passageiro
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={limparFormularioPassageiro}
                >
                  Limpar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {ehFuncionario && (
        <div className="history-panel">
          <div className="history-panel-header">
            <div className="panel-title-inline">
              <History size={22} />
              <div>
                <h3>Histórico operacional</h3>
                <p>Registro das principais ações realizadas nesta viagem</p>
              </div>
            </div>

            <button className="btn-secondary" onClick={carregarHistorico}>
              Atualizar
            </button>
          </div>

          {historico.length > 0 && (
            <div className="history-search travel-filter-search">
              <div className="travel-filter-input-icon">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Buscar por ação, descrição, responsável ou data"
                  value={buscaHistorico}
                  onChange={(event) => setBuscaHistorico(event.target.value)}
                />
              </div>
            </div>
          )}

          {historico.length === 0 ? (
            <div className="history-empty">
              Nenhum registro operacional encontrado para esta viagem.
            </div>
          ) : historicoFiltrado().length === 0 ? (
            <div className="history-empty">
              Nenhum registro encontrado para "{buscaHistorico}".
            </div>
          ) : (
            <div className="history-timeline">
              {historicoFiltrado().map((item) => (
                <div className="history-item" key={item.id}>
                  <div className={classeAcaoHistorico(item.acao)}></div>

                  <div className="history-content">
                    <div className="history-title-row">
                      <strong>{formatarAcaoHistorico(item.acao)}</strong>

                      <span>
                        <Clock3 size={14} />
                        {formatarData(item.dataHora)}
                      </span>
                    </div>

                    <p>{item.descricao}</p>

                    <small>Registrado por: {item.usuarioNome || 'Sistema'}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="table-panel">
        <h3>Passageiros da viagem</h3>

        <table className="data-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Hospital</th>
              <th>Consulta</th>
              <th>Exame</th>
              <th>Horário</th>
              <th>Observação</th>
              {ehFuncionario && <th>Ações</th>}
            </tr>
          </thead>

          <tbody>
            {passageiros.length === 0 ? (
              <tr>
                <td colSpan={ehFuncionario ? '7' : '6'} className="empty-table">
                  Nenhum passageiro adicionado.
                </td>
              </tr>
            ) : (
              passageiros.map((passageiro) => (
                <tr key={passageiro.id}>
                  <td>{passageiro.paciente?.nome || '-'}</td>
                  <td>{passageiro.hospital || '-'}</td>
                  <td>{passageiro.consulta ? passageiro.consulta.nome : '-'}</td>
                  <td>
                    {passageiro.exame ? (
                      <span className={passageiro.exame.exigeIsolamento ? 'badge-danger' : 'badge-success'}>
                        {passageiro.exame.nome}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{formatarHorario(passageiro.horarioAtendimento)}</td>
                  <td>{passageiro.observacao || '-'}</td>

                  {ehFuncionario && (
                    <td>
                      <button
                        className="btn-small btn-delete"
                        onClick={() => removerPassageiro(passageiro)}
                        disabled={viagemBloqueada()}
                      >
                        Remover
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalPdfAberto && (
        <div className="pdf-modal-overlay">
          <div className="pdf-modal-card">
            <div className="pdf-modal-header">
              <div>
                <h3>Prévia do relatório da viagem</h3>
                <p>Confira o PDF antes de baixar o arquivo.</p>
              </div>

              <button className="modal-close" onClick={fecharPreviaPdf}>
                ×
              </button>
            </div>

            <div className="pdf-preview-area">
              <iframe
                src={pdfUrl}
                title="Prévia do relatório da viagem"
                className="pdf-preview-frame"
              />
            </div>

            <div className="pdf-modal-actions">
              <button className="btn-secondary" onClick={fecharPreviaPdf}>
                Fechar
              </button>

              <button className="btn-secondary" onClick={abrirPdfNovaAba}>
                Abrir em nova aba
              </button>

              <button className="btn-primary" onClick={baixarPdfDaPrevia}>
                <FileDown size={18} />
                Baixar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalheViagem;