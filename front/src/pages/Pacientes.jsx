import { useState } from 'react';
import api from '../api/api';
import { useCadastro } from '../hooks/useCadastro';
import CidadeAutocomplete from '../components/CidadeAutocomplete';
import {
  classeStatus,
  extrairMensagemErro,
  formatarData,
  normalizarTexto,
  pegarNomeCidade,
} from '../utils/viagemHelpers';
import {
  Building2,
  ClipboardPlus,
  Clock3,
  History,
  ListChecks,
  Pencil,
  Route,
  Save,
  Search,
  Stethoscope,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';

function Pacientes() {
  const { itens: pacientes, mensagem, erro, setErro, setMensagem, salvar, atualizar, excluir } =
    useCadastro('/pacientes');

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);

  const [pacienteEditando, setPacienteEditando] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editCidadeTexto, setEditCidadeTexto] = useState('');
  const [editCidadeSelecionada, setEditCidadeSelecionada] = useState(null);

  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [pacienteHistorico, setPacienteHistorico] = useState(null);
  const [historicoPaciente, setHistoricoPaciente] = useState([]);
  const [historicoCarregando, setHistoricoCarregando] = useState(false);
  const [buscaHistorico, setBuscaHistorico] = useState('');

  async function salvarPaciente(event) {
    event.preventDefault();

    setErro('');

    if (!nome.trim() || !cpf.trim() || !telefone.trim()) {
      setErro('Preencha todos os campos do paciente.');
      return;
    }

    if (!cidadeSelecionada) {
      setErro('Selecione a cidade do paciente pela busca do Google.');
      return;
    }

    const dadosPaciente = {
      nome: nome.trim(),
      cpf: cpf.trim(),
      telefone: telefone.trim(),
      cidade: pegarNomeCidade(cidadeSelecionada),
    };

    const sucesso = await salvar(
      dadosPaciente,
      'Paciente cadastrado com sucesso.',
      'Erro ao salvar paciente. Verifique se o CPF já existe ou se os dados estão corretos.'
    );

    if (sucesso) {
      limparFormulario();
    }
  }

  async function abrirModalHistorico(paciente) {
    setPacienteHistorico(paciente);
    setHistoricoPaciente([]);
    setBuscaHistorico('');
    setModalHistoricoAberto(true);
    setHistoricoCarregando(true);
    setMensagem('');
    setErro('');

    try {
      const response = await api.get(`/agendamentos/paciente/${paciente.id}/historico`);
      setHistoricoPaciente(response.data);
    } catch (error) {
      console.log(error);
      setErro(extrairMensagemErro(error, 'Erro ao carregar histórico do paciente.'));
    } finally {
      setHistoricoCarregando(false);
    }
  }

  function fecharModalHistorico() {
    setModalHistoricoAberto(false);
    setPacienteHistorico(null);
    setHistoricoPaciente([]);
    setHistoricoCarregando(false);
    setBuscaHistorico('');
  }

  function historicoFiltrado() {
    const busca = normalizarTexto(buscaHistorico);

    if (!busca) {
      return historicoPaciente;
    }

    return historicoPaciente.filter((item) => {
      const campos = [
        item.cidadeOrigem,
        item.cidadeDestino,
        item.hospital,
        item.consultaNome,
        item.exameNome,
        item.motoristaNome,
        item.veiculo,
        item.status,
        formatarData(item.dataHoraViagem),
      ];

      return campos.some((campo) => normalizarTexto(campo).includes(busca));
    });
  }

  function abrirModalEdicao(paciente) {
    setPacienteEditando(paciente);
    setEditNome(paciente.nome || '');
    setEditCpf(paciente.cpf || '');
    setEditTelefone(paciente.telefone || '');
    setEditCidadeTexto(paciente.cidade || '');
    setEditCidadeSelecionada(paciente.cidade ? { nome: paciente.cidade, estado: '' } : null);
    setErro('');
  }

  function fecharModalEdicao() {
    setPacienteEditando(null);
    setEditNome('');
    setEditCpf('');
    setEditTelefone('');
    setEditCidadeTexto('');
    setEditCidadeSelecionada(null);
  }

  async function salvarEdicaoPaciente(event) {
    event.preventDefault();

    if (!editNome.trim() || !editCpf.trim() || !editTelefone.trim()) {
      setErro('Preencha todos os campos do paciente.');
      return;
    }

    if (!editCidadeSelecionada) {
      setErro('Selecione a cidade do paciente pela busca do Google.');
      return;
    }

    const dadosPaciente = {
      nome: editNome.trim(),
      cpf: editCpf.trim(),
      telefone: editTelefone.trim(),
      cidade: pegarNomeCidade(editCidadeSelecionada),
    };

    const sucesso = await atualizar(
      pacienteEditando.id,
      dadosPaciente,
      'Paciente atualizado com sucesso.',
      'Erro ao atualizar paciente. Verifique os dados informados.'
    );

    if (sucesso) {
      fecharModalEdicao();
    }
  }

  async function excluirPaciente(paciente) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o paciente "${paciente.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    await excluir(
      paciente.id,
      'Paciente excluído com sucesso.',
      'Erro ao excluir paciente. Verifique se ele não está vinculado a uma viagem.'
    );
  }

  function limparFormulario() {
    setNome('');
    setCpf('');
    setTelefone('');
    setCidadeSelecionada(null);
    setErro('');

    const inputCidade = document.querySelector(
      '.patient-cidade-field .cidade-autocomplete-input'
    );

    if (inputCidade) {
      inputCidade.value = '';
    }
  }

  function formatarHorario(data) {
    if (!data) {
      return '-';
    }

    return new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div>
      <div className="page-title">
        <h2>Pacientes</h2>
        <p>Cadastro dos pacientes que poderão ser vinculados às viagens sanitárias</p>
      </div>

      {mensagem && <div className="success-message">{mensagem}</div>}
      {erro && <div className="error-message-page">{erro}</div>}

      <div className="form-panel">
        <h3>Novo paciente</h3>

        <form onSubmit={salvarPaciente} className="form-grid">
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              placeholder="Digite o nome do paciente"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>CPF</label>
            <input
              type="text"
              placeholder="Digite o CPF"
              value={cpf}
              onChange={(event) => setCpf(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="text"
              placeholder="Digite o telefone"
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
            />
          </div>

          <div className="patient-cidade-field">
            <CidadeAutocomplete
              label="Cidade"
              placeholder="Digite a cidade do paciente"
              onCidadeSelecionada={setCidadeSelecionada}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              <UserPlus size={18} />
              Cadastrar paciente
            </button>

            <button type="button" className="btn-secondary" onClick={limparFormulario}>
              Limpar
            </button>
          </div>
        </form>
      </div>

      <div className="table-panel">
        <div className="table-title-row">
          <div>
            <h3>Pacientes cadastrados</h3>
            <p>Lista de pacientes disponíveis para vincular às viagens sanitárias</p>
          </div>

          <div className="table-count-badge">
            <ListChecks size={18} />
            {pacientes.length} cadastrado{pacientes.length === 1 ? '' : 's'}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Cidade</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {pacientes.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table">
                  Nenhum paciente cadastrado.
                </td>
              </tr>
            ) : (
              pacientes.map((paciente) => (
                <tr key={paciente.id}>
                  <td>{paciente.id}</td>
                  <td>
                    <strong>{paciente.nome}</strong>
                  </td>
                  <td>{paciente.cpf}</td>
                  <td>{paciente.telefone}</td>
                  <td>{paciente.cidade}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-small btn-manage"
                        onClick={() => abrirModalHistorico(paciente)}
                      >
                        <History size={14} />
                        Histórico
                      </button>

                      <button
                        className="btn-small btn-edit"
                        onClick={() => abrirModalEdicao(paciente)}
                      >
                        <Pencil size={14} />
                        Editar
                      </button>

                      <button
                        className="btn-small btn-delete"
                        onClick={() => excluirPaciente(paciente)}
                      >
                        <Trash2 size={14} />
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

      {modalHistoricoAberto && (
        <div className="cadastro-modal-overlay">
          <div className="cadastro-modal-card patient-history-modal-card">
            <div className="cadastro-modal-header">
              <div>
                <span>Histórico do paciente</span>
                <h3>{pacienteHistorico?.nome}</h3>
                <p>Viagens sanitárias em que este paciente foi transportado.</p>
              </div>

              <button className="modal-close" onClick={fecharModalHistorico}>
                <X size={20} />
              </button>
            </div>

            <div className="patient-history-body">
              {!historicoCarregando && historicoPaciente.length > 0 && (
                <div className="patient-history-search travel-filter-search">
                  <div className="travel-filter-input-icon">
                    <Search size={17} />
                    <input
                      type="text"
                      placeholder="Buscar por cidade, hospital, motorista, status ou data"
                      value={buscaHistorico}
                      onChange={(event) => setBuscaHistorico(event.target.value)}
                    />
                  </div>
                </div>
              )}

              {historicoCarregando ? (
                <div className="patient-history-empty">
                  Carregando histórico do paciente...
                </div>
              ) : historicoPaciente.length === 0 ? (
                <div className="patient-history-empty">
                  Nenhuma viagem encontrada para este paciente.
                </div>
              ) : historicoFiltrado().length === 0 ? (
                <div className="patient-history-empty">
                  Nenhuma viagem encontrada para "{buscaHistorico}".
                </div>
              ) : (
                <div className="patient-history-list">
                  {historicoFiltrado().map((item) => (
                  <div
                    className="patient-history-item"
                    key={`${item.viagemId}-${item.horarioAtendimento}`}
                  >
                    <div className="patient-history-top">
                      <div>
                        <span>Viagem #{item.viagemId}</span>
                        <strong>
                          {item.cidadeOrigem} → {item.cidadeDestino}
                        </strong>
                      </div>

                      <span className={classeStatus(item.status)}>
                        {item.status}
                      </span>
                    </div>

                    <div className="patient-history-grid">
                      <div>
                        <Clock3 size={17} />
                        <div>
                          <span>Data da viagem</span>
                          <strong>{formatarData(item.dataHoraViagem)}</strong>
                        </div>
                      </div>

                      <div>
                        <Building2 size={17} />
                        <div>
                          <span>Hospital / Clínica</span>
                          <strong>{item.hospital || '-'}</strong>
                        </div>
                      </div>

                      <div>
                        <Stethoscope size={17} />
                        <div>
                          <span>Consulta</span>
                          <strong>{item.consultaNome || '-'}</strong>
                        </div>
                      </div>

                      <div>
                        <ClipboardPlus size={17} />
                        <div>
                          <span>Exame</span>
                          <strong>{item.exameNome || '-'}</strong>
                        </div>
                      </div>

                      <div>
                        <Route size={17} />
                        <div>
                          <span>Motorista</span>
                          <strong>{item.motoristaNome || '-'}</strong>
                        </div>
                      </div>

                      <div>
                        <Clock3 size={17} />
                        <div>
                          <span>Horário do atendimento</span>
                          <strong>{formatarHorario(item.horarioAtendimento)}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="patient-history-footer">
                      Veículo: <strong>{item.veiculo || '-'}</strong>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {pacienteEditando && (
        <div className="cadastro-modal-overlay">
          <div className="cadastro-modal-card">
            <div className="cadastro-modal-header">
              <div>
                <span>Edição de paciente</span>
                <h3>Editar dados do paciente</h3>
                <p>Altere as informações e salve para atualizar o cadastro.</p>
              </div>

              <button className="modal-close" onClick={fecharModalEdicao}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvarEdicaoPaciente} className="cadastro-modal-form">
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={editNome}
                  onChange={(event) => setEditNome(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>CPF</label>
                <input
                  type="text"
                  value={editCpf}
                  onChange={(event) => setEditCpf(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="text"
                  value={editTelefone}
                  onChange={(event) => setEditTelefone(event.target.value)}
                />
              </div>

              <CidadeAutocomplete
                label="Cidade"
                placeholder="Digite a cidade do paciente"
                valorInicial={editCidadeTexto}
                onCidadeSelecionada={setEditCidadeSelecionada}
              />

              <div className="cadastro-modal-actions">
                <button type="button" className="btn-secondary" onClick={fecharModalEdicao}>
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

export default Pacientes;
