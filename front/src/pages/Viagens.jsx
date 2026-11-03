import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import CidadeAutocomplete from '../components/CidadeAutocomplete';
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
  CalendarClock,
  CheckCircle2,
  Filter,
  RefreshCcw,
  Save,
  Search,
  X,
} from 'lucide-react';

function Viagens() {
  const navigate = useNavigate();

  const [viagens, setViagens] = useState([]);

  const [cidadeOrigem, setCidadeOrigem] = useState(null);
  const [cidadeDestino, setCidadeDestino] = useState(null);
  const [dataHora, setDataHora] = useState('');
  const [dataHoraConfirmada, setDataHoraConfirmada] = useState(false);
  const [previewRota, setPreviewRota] = useState(null);
  const [rotaEscolhida, setRotaEscolhida] = useState(null);

  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [viagemEditando, setViagemEditando] = useState(null);
  const [editCidadeOrigem, setEditCidadeOrigem] = useState(null);
  const [editCidadeDestino, setEditCidadeDestino] = useState(null);
  const [editDataHora, setEditDataHora] = useState('');
  const [editPreviewRota, setEditPreviewRota] = useState(null);
  const [editRotaEscolhida, setEditRotaEscolhida] = useState(null);

  const [buscaFiltro, setBuscaFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [dataInicialFiltro, setDataInicialFiltro] = useState('');
  const [dataFinalFiltro, setDataFinalFiltro] = useState('');

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarViagens();
  }, []);

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

  async function carregarViagens() {
    try {
      const response = await api.get('/agendamentos');
      setViagens(response.data);
    } catch (error) {
      console.log(error);
      setErro('Erro ao carregar viagens.');
    }
  }

  async function calcularPreviewRota(origem, destino, setPreview) {
    if (!origem || !destino) {
      setPreview(null);
      return;
    }

    try {
      setErro('');

      const response = await api.post('/rotas/preview', {
        origemLatitude: origem.latitude,
        origemLongitude: origem.longitude,
        destinoLatitude: destino.latitude,
        destinoLongitude: destino.longitude,
      });

      setPreview(response.data);
    } catch (error) {
      console.log(error);
      setPreview(null);
      setErro('Não foi possível calcular a prévia da rota.');
    }
  }

  function selecionarOrigem(cidade) {
    setCidadeOrigem(cidade);
    setRotaEscolhida(null);
    calcularPreviewRota(cidade, cidadeDestino, setPreviewRota);
  }

  function selecionarDestino(cidade) {
    setCidadeDestino(cidade);
    setRotaEscolhida(null);
    calcularPreviewRota(cidadeOrigem, cidade, setPreviewRota);
  }

  function selecionarEditOrigem(cidade) {
    setEditCidadeOrigem(cidade);
    setEditRotaEscolhida(null);
    calcularPreviewRota(cidade, editCidadeDestino, setEditPreviewRota);
  }

  function selecionarEditDestino(cidade) {
    setEditCidadeDestino(cidade);
    setEditRotaEscolhida(null);
    calcularPreviewRota(editCidadeOrigem, cidade, setEditPreviewRota);
  }

  function alterarDataHora(valor) {
    setDataHora(valor);
    setDataHoraConfirmada(false);
  }

  function confirmarDataHora() {
    if (!dataHora) {
      setErro('Informe a data e hora da viagem.');
      return;
    }

    setDataHoraConfirmada(true);
    setErro('');
  }

  function dataHoraMinima() {
    const agora = new Date();
    agora.setSeconds(0, 0);
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    return agora.toISOString().slice(0, 16);
  }

  function formatarDataHoraEscolhida(data) {
    if (!data) {
      return 'Nenhuma data selecionada';
    }

    return new Date(data).toLocaleString('pt-BR');
  }

  async function salvarViagem(event) {
    event.preventDefault();

    setMensagem('');
    setErro('');

    if (!cidadeOrigem) {
      setErro('Selecione a cidade de origem pelo Google.');
      return;
    }

    if (!cidadeDestino) {
      setErro('Selecione a cidade de destino pelo Google.');
      return;
    }

    if (!dataHora) {
      setErro('Informe a data e hora da viagem.');
      return;
    }

    if (!dataHoraConfirmada) {
      setErro('Confirme a data e hora da viagem antes de criar.');
      return;
    }

    if (
      cidadeOrigem.nome === cidadeDestino.nome &&
      cidadeOrigem.estado === cidadeDestino.estado
    ) {
      setErro('A cidade de origem e a cidade de destino não podem ser iguais.');
      return;
    }

    try {
      const origemResponse = await api.post('/cidades/google', {
        nome: cidadeOrigem.nome,
        estado: cidadeOrigem.estado,
        latitude: cidadeOrigem.latitude,
        longitude: cidadeOrigem.longitude,
      });

      const destinoResponse = await api.post('/cidades/google', {
        nome: cidadeDestino.nome,
        estado: cidadeDestino.estado,
        latitude: cidadeDestino.latitude,
        longitude: cidadeDestino.longitude,
      });

      const dadosViagem = {
        cidadeOrigemId: origemResponse.data.id,
        cidadeDestinoId: destinoResponse.data.id,
        dataHora,
        distanciaKm: rotaEscolhida?.distanciaKm ?? null,
        duracaoMinutos: rotaEscolhida?.duracaoMinutos ?? null,
      };

      await api.post('/agendamentos', dadosViagem);

      setMensagem('Viagem criada com sucesso.');
      limparFormularioCriacao();
      carregarViagens();
    } catch (error) {
      tratarErro(error, 'Erro ao criar viagem. Verifique os dados informados.');
    }
  }

  function abrirModalEdicao(viagem) {
    if (viagem.status !== 'CRIADO') {
      setErro('Somente viagens com status CRIADO podem ser editadas.');
      return;
    }

    setMensagem('');
    setErro('');

    setViagemEditando(viagem);
    setEditCidadeOrigem(viagem.cidadeOrigem);
    setEditCidadeDestino(viagem.cidadeDestino);
    setEditDataHora(converterParaInputDateTime(viagem.dataHora));

    calcularPreviewRota(
      viagem.cidadeOrigem,
      viagem.cidadeDestino,
      setEditPreviewRota
    );

    setModalEditarAberto(true);
  }

  function fecharModalEdicao() {
    setModalEditarAberto(false);
    setViagemEditando(null);
    setEditCidadeOrigem(null);
    setEditCidadeDestino(null);
    setEditDataHora('');
    setEditPreviewRota(null);
    setEditRotaEscolhida(null);
  }

  async function salvarEdicaoViagem(event) {
    event.preventDefault();

    setMensagem('');
    setErro('');

    if (!editCidadeOrigem) {
      setErro('Selecione a cidade de origem.');
      return;
    }

    if (!editCidadeDestino) {
      setErro('Selecione a cidade de destino.');
      return;
    }

    if (!editDataHora) {
      setErro('Informe a data e hora da viagem.');
      return;
    }

    if (
      editCidadeOrigem.nome === editCidadeDestino.nome &&
      editCidadeOrigem.estado === editCidadeDestino.estado
    ) {
      setErro('A cidade de origem e a cidade de destino não podem ser iguais.');
      return;
    }

    try {
      const origemResponse = await api.post('/cidades/google', {
        nome: editCidadeOrigem.nome,
        estado: editCidadeOrigem.estado,
        latitude: editCidadeOrigem.latitude,
        longitude: editCidadeOrigem.longitude,
      });

      const destinoResponse = await api.post('/cidades/google', {
        nome: editCidadeDestino.nome,
        estado: editCidadeDestino.estado,
        latitude: editCidadeDestino.latitude,
        longitude: editCidadeDestino.longitude,
      });

      const dadosViagem = {
        cidadeOrigemId: origemResponse.data.id,
        cidadeDestinoId: destinoResponse.data.id,
        dataHora: editDataHora,
        distanciaKm: editRotaEscolhida?.distanciaKm ?? null,
        duracaoMinutos: editRotaEscolhida?.duracaoMinutos ?? null,
      };

      await api.put(`/agendamentos/${viagemEditando.id}`, dadosViagem);

      setMensagem('Viagem atualizada com sucesso.');
      fecharModalEdicao();
      carregarViagens();
    } catch (error) {
      tratarErro(error, 'Erro ao atualizar viagem.');
    }
  }

  async function excluirViagem(viagem) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir a viagem #${viagem.id}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await api.delete(`/agendamentos/${viagem.id}`);

      setMensagem('Viagem excluída com sucesso.');
      setErro('');
      carregarViagens();
    } catch (error) {
      tratarErro(error, 'Erro ao excluir viagem.');
    }
  }

  function limparFormularioCriacao() {
    setCidadeOrigem(null);
    setCidadeDestino(null);
    setDataHora('');
    setDataHoraConfirmada(false);
    setPreviewRota(null);
    setRotaEscolhida(null);
    setErro('');

    const inputs = document.querySelectorAll('.cidade-autocomplete-input');

    inputs.forEach((input) => {
      input.value = '';
    });
  }

  function limparFiltros() {
    setBuscaFiltro('');
    setStatusFiltro('');
    setDataInicialFiltro('');
    setDataFinalFiltro('');
  }

  function tratarErro(error, mensagemPadrao) {
    console.log('ERRO:', error);
    setErro(extrairMensagemErro(error, mensagemPadrao));
  }

  function converterParaInputDateTime(data) {
    if (!data) {
      return '';
    }

    return data.slice(0, 16);
  }

  function pegarNomeMotorista(viagem) {
    if (viagem?.motoristaNome) {
      return viagem.motoristaNome;
    }

    if (viagem?.motorista?.nome) {
      return viagem.motorista.nome;
    }

    return '';
  }

  function statusNormalizado(status) {
    if (status === 'CONCLUIDO') {
      return 'FINALIZADO';
    }

    return status || '';
  }

  function viagemDentroDoPeriodo(viagem) {
    if (!viagem.dataHora) {
      return false;
    }

    const dataViagem = viagem.dataHora.slice(0, 10);

    if (dataInicialFiltro && dataViagem < dataInicialFiltro) {
      return false;
    }

    if (dataFinalFiltro && dataViagem > dataFinalFiltro) {
      return false;
    }

    return true;
  }

  function viagensFiltradas() {
  const busca = normalizarTexto(buscaFiltro);

  return viagens.filter((viagem) => {
    const origem = normalizarTexto(pegarNomeCidade(viagem.cidadeOrigem));
    const destino = normalizarTexto(pegarNomeCidade(viagem.cidadeDestino));
    const veiculo = normalizarTexto(pegarNomeVeiculo(viagem.veiculo));
    const motorista = normalizarTexto(pegarNomeMotorista(viagem));
    const status = statusNormalizado(viagem.status);
    const statusBusca = normalizarTexto(status);

    const bateBusca =
      !busca ||
      String(viagem.id).includes(busca) ||
      origem.includes(busca) ||
      destino.includes(busca) ||
      veiculo.includes(busca) ||
      motorista.includes(busca) ||
      statusBusca.includes(busca);

    const bateStatus = !statusFiltro || status === statusFiltro;

    return bateBusca && bateStatus && viagemDentroDoPeriodo(viagem);
  });
}

  function quantidadePorStatus(status) {
    return viagens.filter((viagem) => statusNormalizado(viagem.status) === status).length;
  }

  const listaFiltrada = viagensFiltradas();

  return (
    <div>
      <div className="page-title">
        <h2>Viagens</h2>
        <p>Planeje uma nova viagem sanitária e acompanhe as viagens cadastradas</p>
      </div>

      {mensagem && <div className="success-message">{mensagem}</div>}
      {erro && <div className="error-message-page">{erro}</div>}

      <div className="trip-planner-card">
        <div className="trip-planner-header">
          <h3>Nova viagem sanitária</h3>
        </div>

        <form onSubmit={salvarViagem}>
          <div className="trip-planner-grid">
            <div className="trip-fields-area">
              <div className="trip-section-title">
                <strong>Dados da rota</strong>
                <span>Selecione as cidades usando a busca automática do Google</span>
              </div>

              <div className="trip-fields-grid">
                <CidadeAutocomplete
                  label="Cidade de origem"
                  placeholder="Digite a cidade de origem"
                  onCidadeSelecionada={selecionarOrigem}
                />

                <CidadeAutocomplete
                  label="Cidade de destino"
                  placeholder="Digite a cidade de destino"
                  onCidadeSelecionada={selecionarDestino}
                />

                <div className="date-time-card">
                  <div className="date-time-header">
                    <div className="date-time-icon">
                      <CalendarClock size={24} />
                    </div>

                    <div>
                      <span>Agendamento</span>
                      <strong>Data e hora da viagem</strong>
                    </div>
                  </div>

                  <div className="date-time-input-row">
                    <input
                      type="datetime-local"
                      value={dataHora}
                      min={dataHoraMinima()}
                      onChange={(event) => alterarDataHora(event.target.value)}
                    />

                    <button
                      type="button"
                      className={
                        dataHoraConfirmada
                          ? 'btn-date-confirmed'
                          : 'btn-date-confirm'
                      }
                      onClick={confirmarDataHora}
                    >
                      {dataHoraConfirmada ? (
                        <>
                          <CheckCircle2 size={18} />
                          Confirmada
                        </>
                      ) : (
                        'Confirmar data'
                      )}
                    </button>
                  </div>

                  <div
                    className={
                      dataHoraConfirmada
                        ? 'date-time-status confirmed'
                        : 'date-time-status'
                    }
                  >
                    <span>Selecionado</span>
                    <strong>{formatarDataHoraEscolhida(dataHora)}</strong>
                  </div>
                </div>
              </div>

              <div className="trip-actions-row">
                <button
                  type="submit"
                  className="btn-primary btn-confirm-trip"
                  disabled={
                    !cidadeOrigem ||
                    !cidadeDestino ||
                    !dataHora ||
                    !dataHoraConfirmada
                  }
                >
                  Confirmar e criar viagem
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={limparFormularioCriacao}
                >
                  Limpar
                </button>
              </div>
            </div>

            <div className="trip-preview-area">
              <div className="trip-section-title">
                <strong>Resumo da viagem</strong>
                <span>Prévia calculada antes do agendamento</span>
              </div>

              {!cidadeOrigem && !cidadeDestino && (
                <div className="empty-route-preview">
                  <div className="empty-route-icon">⌖</div>
                  <strong>Nenhuma rota selecionada</strong>
                  <p>
                    Escolha a origem e o destino para visualizar a distância,
                    duração e trajeto.
                  </p>
                </div>
              )}

              {(cidadeOrigem || cidadeDestino) && (
                <div className="route-summary-box">
                  <div className="route-summary-line">
                    <span>Origem</span>
                    <strong>
                      {cidadeOrigem
                        ? `${cidadeOrigem.nome} / ${cidadeOrigem.estado}`
                        : 'Não selecionada'}
                    </strong>
                  </div>

                  <div className="route-summary-divider"></div>

                  <div className="route-summary-line">
                    <span>Destino</span>
                    <strong>
                      {cidadeDestino
                        ? `${cidadeDestino.nome} / ${cidadeDestino.estado}`
                        : 'Não selecionado'}
                    </strong>
                  </div>
                </div>
              )}

              {(rotaEscolhida || previewRota) && (
                <div className="route-metrics">
                  <div>
                    <span>Distância estimada</span>
                    <strong>
                      {rotaEscolhida
                        ? rotaEscolhida.distanciaTexto
                        : `${previewRota.distanciaKm.toFixed(2)} km`}
                    </strong>
                  </div>

                  <div>
                    <span>Duração estimada</span>
                    <strong>
                      {rotaEscolhida
                        ? rotaEscolhida.duracaoTexto
                        : previewRota.duracaoFormatada ||
                          formatarDuracao(previewRota.duracaoMinutos)}
                    </strong>
                  </div>
                </div>
              )}

              {rotaEscolhida && (
                <div className="route-summary-line">
                  <span>Rota escolhida</span>
                  <strong>via {rotaEscolhida.resumo}</strong>
                </div>
              )}
            </div>
          </div>

          {cidadeOrigem && cidadeDestino && (
            <div className="trip-map-wrapper">
              <MapaRota
                origem={cidadeOrigem}
                destino={cidadeDestino}
                onRotaSelecionada={setRotaEscolhida}
              />
            </div>
          )}
        </form>
      </div>

      <div className="table-panel">
        <div className="table-title-row">
          <div>
            <h3>Viagens cadastradas</h3>
            <p>
              {listaFiltrada.length} de {viagens.length} viagem
              {viagens.length === 1 ? '' : 's'} encontrada
              {viagens.length === 1 ? '' : 's'}
            </p>
          </div>

          <button className="btn-secondary" onClick={carregarViagens}>
            <RefreshCcw size={16} />
            Atualizar
          </button>
        </div>

        <div className="travel-status-summary">
          <div>
            <span>Criadas</span>
            <strong>{quantidadePorStatus('CRIADO')}</strong>
          </div>

          <div>
            <span>Confirmadas</span>
            <strong>{quantidadePorStatus('CONFIRMADO')}</strong>
          </div>

          <div>
            <span>Em andamento</span>
            <strong>{quantidadePorStatus('EM_ANDAMENTO')}</strong>
          </div>

          <div>
            <span>Finalizadas</span>
            <strong>{quantidadePorStatus('FINALIZADO')}</strong>
          </div>

          <div>
            <span>Canceladas</span>
            <strong>{quantidadePorStatus('CANCELADO')}</strong>
          </div>
        </div>

        <div className="travel-filters-panel">
          <div className="travel-filter-search">
            <label>Buscar viagem</label>
            <div className="travel-filter-input-icon">
              <Search size={17} />
              <input
                type="text"
                placeholder="Buscar por cidade, veículo, motorista, status ou ID"
                value={buscaFiltro}
                onChange={(event) => setBuscaFiltro(event.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={statusFiltro}
              onChange={(event) => setStatusFiltro(event.target.value)}
            >
              <option value="">Todos</option>
              <option value="CRIADO">Criado</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          <div className="form-group">
            <label>Data inicial</label>
            <input
              type="date"
              value={dataInicialFiltro}
              onChange={(event) => setDataInicialFiltro(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Data final</label>
            <input
              type="date"
              value={dataFinalFiltro}
              onChange={(event) => setDataFinalFiltro(event.target.value)}
            />
          </div>

          <button type="button" className="btn-secondary" onClick={limparFiltros}>
            <Filter size={16} />
            Limpar filtros
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Origem</th>
              <th>Destino</th>
              <th>Data e hora</th>
              <th>Distância</th>
              <th>Duração</th>
              <th>Veículo</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-table">
                  Nenhuma viagem encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              listaFiltrada.map((viagem) => (
                <tr key={viagem.id}>
                  <td>{viagem.id}</td>
                  <td>{pegarNomeCidade(viagem.cidadeOrigem)}</td>
                  <td>{pegarNomeCidade(viagem.cidadeDestino)}</td>
                  <td>{formatarData(viagem.dataHora)}</td>
                  <td>{formatarDistancia(viagem.distanciaKm)}</td>
                  <td>{formatarDuracao(viagem.duracaoMinutos)}</td>
                  <td>{pegarNomeVeiculo(viagem.veiculo)}</td>
                  <td>
                    <span className={classeStatus(viagem.status)}>
                      {viagem.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-small btn-manage"
                        onClick={() => navigate(`/viagens/${viagem.id}`)}
                      >
                        Gerenciar
                      </button>

                      <button
                        className="btn-small btn-edit"
                        onClick={() => abrirModalEdicao(viagem)}
                        disabled={viagem.status !== 'CRIADO'}
                      >
                        Editar
                      </button>

                      <button
                        className="btn-small btn-delete"
                        onClick={() => excluirViagem(viagem)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalEditarAberto && (
        <div className="trip-edit-modal-overlay">
          <div className="trip-edit-modal-card trip-edit-modal-card-large">
            <div className="trip-edit-modal-header">
              <div>
                <span>Edição de viagem</span>
                <h3>Editar dados da viagem</h3>
                <p>
                  Atualize origem, destino e data da viagem antes da confirmação.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={fecharModalEdicao}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvarEdicaoViagem} className="trip-edit-modal-form">
              <div className="trip-edit-info-box">
                <CalendarClock size={22} />

                <div>
                  <strong>Alteração permitida</strong>
                  <p>
                    Somente viagens com status CRIADO podem ser editadas.
                    Depois de confirmada, a viagem passa a fazer parte do fluxo operacional.
                  </p>
                </div>
              </div>

              <div className="trip-edit-grid">
                <CidadeAutocomplete
                  label="Cidade de origem"
                  placeholder="Digite a cidade de origem"
                  valorInicial={editCidadeOrigem ? pegarNomeCidade(editCidadeOrigem) : ''}
                  onCidadeSelecionada={selecionarEditOrigem}
                />

                <CidadeAutocomplete
                  label="Cidade de destino"
                  placeholder="Digite a cidade de destino"
                  valorInicial={editCidadeDestino ? pegarNomeCidade(editCidadeDestino) : ''}
                  onCidadeSelecionada={selecionarEditDestino}
                />

                <div className="form-group trip-edit-full">
                  <label>Data e hora da viagem</label>
                  <input
                    type="datetime-local"
                    value={editDataHora}
                    min={dataHoraMinima()}
                    onChange={(event) => setEditDataHora(event.target.value)}
                  />
                </div>
              </div>

              {(editRotaEscolhida || editPreviewRota) && (
                <div className="trip-edit-route-preview">
                  <div>
                    <span>Distância estimada</span>
                    <strong>
                      {editRotaEscolhida
                        ? editRotaEscolhida.distanciaTexto
                        : `${editPreviewRota.distanciaKm.toFixed(2)} km`}
                    </strong>
                  </div>

                  <div>
                    <span>Duração estimada</span>
                    <strong>
                      {editRotaEscolhida
                        ? editRotaEscolhida.duracaoTexto
                        : editPreviewRota.duracaoFormatada ||
                          formatarDuracao(editPreviewRota.duracaoMinutos)}
                    </strong>
                  </div>
                </div>
              )}

              {editCidadeOrigem && editCidadeDestino && (
                <div className="trip-edit-map-wrapper">
                  <MapaRota
                    origem={editCidadeOrigem}
                    destino={editCidadeDestino}
                    distanciaReferenciaKm={viagemEditando?.distanciaKm}
                    onRotaSelecionada={setEditRotaEscolhida}
                  />
                </div>
              )}

              <div className="trip-edit-modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={fecharModalEdicao}
                >
                  Cancelar
                </button>

                <button type="submit" className="btn-primary">
                  <Save size={18} />
                  Salvar alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Viagens;