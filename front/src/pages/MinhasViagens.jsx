import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
  classeStatus,
  formatarData,
  normalizarTexto,
  pegarNomeCidade,
  pegarNomeVeiculo,
} from '../utils/viagemHelpers';
import {
  CalendarClock,
  FileDown,
  Filter,
  MapPin,
  Route,
  Search,
  UserRound,
} from 'lucide-react';

function MinhasViagens() {
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [viagens, setViagens] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [pdfUrl, setPdfUrl] = useState('');
  const [modalPdfAberto, setModalPdfAberto] = useState(false);
  const [pdfCarregando, setPdfCarregando] = useState(false);
  const [pdfViagemId, setPdfViagemId] = useState(null);

  const [buscaFiltro, setBuscaFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [dataInicialFiltro, setDataInicialFiltro] = useState('');
  const [dataFinalFiltro, setDataFinalFiltro] = useState('');

  useEffect(() => {
    carregarMinhasViagens();
  }, []);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  async function carregarMinhasViagens() {
    if (!usuario?.motoristaId) {
      setErro('Usuário motorista não possui motorista vinculado.');
      return;
    }

    try {
      setCarregando(true);
      setErro('');

      const response = await api.get(`/agendamentos/motorista/${usuario.id}`)

      setViagens(response.data);
    } catch (error) {
      console.log(error);
      setErro('Erro ao carregar suas viagens.');
    } finally {
      setCarregando(false);
    }
  }

  async function abrirPreviaPdf(id) {
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
      setPdfViagemId(id);
      setModalPdfAberto(true);
    } catch (error) {
      console.log(error);
      setErro('Erro ao carregar prévia do PDF.');
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
    link.setAttribute('download', `relatorio_viagem_${pdfViagemId}.pdf`);
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
      setPdfViagemId(null);
    }
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
      const status = statusNormalizado(viagem.status);
      const statusBusca = normalizarTexto(status);

      const bateBusca =
        !busca ||
        String(viagem.id).includes(busca) ||
        origem.includes(busca) ||
        destino.includes(busca) ||
        veiculo.includes(busca) ||
        statusBusca.includes(busca);

      const bateStatus = !statusFiltro || status === statusFiltro;

      return bateBusca && bateStatus && viagemDentroDoPeriodo(viagem);
    });
  }

  function limparFiltros() {
    setBuscaFiltro('');
    setStatusFiltro('');
    setDataInicialFiltro('');
    setDataFinalFiltro('');
  }

  const listaFiltrada = viagensFiltradas();

  return (
    <div>
      <div className="dashboard-hero">
        <div>
          <span>Área do motorista</span>
          <h2>Minhas viagens</h2>
          <p>
            Visualize as viagens atribuídas ao seu veículo, inicie o percurso,
            finalize a viagem e baixe o relatório.
          </p>
        </div>

        <div className="hero-badge">
          Motorista
        </div>
      </div>

      {erro && <div className="error-message-page">{erro}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Route size={26} />
          </div>

          <div>
            <span>Total</span>
            <strong>{viagens.length}</strong>
            <p>Viagens atribuídas a você</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CalendarClock size={26} />
          </div>

          <div>
            <span>Confirmadas</span>
            <strong>
              {viagens.filter((viagem) => viagem.status === 'CONFIRMADO').length}
            </strong>
            <p>Prontas para iniciar</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <MapPin size={26} />
          </div>

          <div>
            <span>Em andamento</span>
            <strong>
              {viagens.filter((viagem) => viagem.status === 'EM_ANDAMENTO').length}
            </strong>
            <p>Viagens iniciadas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <UserRound size={26} />
          </div>

          <div>
            <span>Finalizadas</span>
            <strong>
              {
                viagens.filter(
                  (viagem) =>
                    viagem.status === 'FINALIZADO' ||
                    viagem.status === 'CONCLUIDO'
                ).length
              }
            </strong>
            <p>Histórico concluído</p>
          </div>
        </div>
      </div>

      <div className="table-panel">
        <div className="table-title-row">
          <div>
            <h3>Viagens atribuídas ao motorista</h3>
            <p>
              {listaFiltrada.length} de {viagens.length} viagem
              {viagens.length === 1 ? '' : 's'} encontrada
              {viagens.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="travel-filters-panel">
          <div className="travel-filter-search">
            <label>Buscar viagem</label>
            <div className="travel-filter-input-icon">
              <Search size={17} />
              <input
                type="text"
                placeholder="Buscar por cidade, veículo, status ou ID"
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

        {carregando ? (
          <p className="empty-table">Carregando suas viagens...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Data e hora</th>
                <th>Origem</th>
                <th>Destino</th>
                <th>Status</th>
                <th>Veículo</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    {viagens.length === 0
                      ? 'Nenhuma viagem atribuída a este motorista.'
                      : 'Nenhuma viagem encontrada com os filtros selecionados.'}
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((viagem) => (
                  <tr key={viagem.id}>
                    <td>{viagem.id}</td>
                    <td>{formatarData(viagem.dataHora)}</td>
                    <td>{pegarNomeCidade(viagem.cidadeOrigem)}</td>
                    <td>{pegarNomeCidade(viagem.cidadeDestino)}</td>
                    <td>
                      <span className={classeStatus(viagem.status)}>
                        {viagem.status}
                      </span>
                    </td>
                    <td>
                      {viagem.veiculo
                        ? `${viagem.veiculo.modelo} - ${viagem.veiculo.placa}`
                        : '-'}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-small btn-edit"
                          onClick={() => navigate(`/viagens/${viagem.id}`)}
                        >
                          Gerenciar
                        </button>

                        <button
                          className="btn-small btn-view"
                          onClick={() => abrirPreviaPdf(viagem.id)}
                          disabled={pdfCarregando}
                        >
                          <FileDown size={14} />
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
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

export default MinhasViagens;