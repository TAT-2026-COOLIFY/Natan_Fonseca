import { useState } from 'react';
import { useCadastro } from '../hooks/useCadastro';
import { ClipboardPlus, ListChecks, Pencil, Save, Trash2, X } from 'lucide-react';

function Consultas() {
  const { itens: consultas, mensagem, erro, setErro, salvar, atualizar, excluir } =
    useCadastro('/consultas');

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const [consultaEditando, setConsultaEditando] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editDescricao, setEditDescricao] = useState('');

  async function salvarConsulta(event) {
    event.preventDefault();

    setErro('');

    if (!nome.trim()) {
      setErro('Informe o nome da consulta.');
      return;
    }

    const dadosConsulta = {
      nome: nome.trim(),
      descricao: descricao.trim(),
    };

    const sucesso = await salvar(
      dadosConsulta,
      'Consulta cadastrada com sucesso.',
      'Erro ao cadastrar consulta. Verifique os dados informados.'
    );

    if (sucesso) {
      limparFormulario();
    }
  }

  function abrirModalEdicao(consulta) {
    setConsultaEditando(consulta);
    setEditNome(consulta.nome || '');
    setEditDescricao(consulta.descricao || '');
    setErro('');
  }

  function fecharModalEdicao() {
    setConsultaEditando(null);
    setEditNome('');
    setEditDescricao('');
  }

  async function salvarEdicaoConsulta(event) {
    event.preventDefault();

    if (!editNome.trim()) {
      setErro('Informe o nome da consulta.');
      return;
    }

    const dadosConsulta = {
      nome: editNome.trim(),
      descricao: editDescricao.trim(),
    };

    const sucesso = await atualizar(
      consultaEditando.id,
      dadosConsulta,
      'Consulta atualizada com sucesso.',
      'Erro ao atualizar consulta. Verifique os dados informados.'
    );

    if (sucesso) {
      fecharModalEdicao();
    }
  }

  async function excluirConsulta(consulta) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir a consulta "${consulta.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    await excluir(
      consulta.id,
      'Consulta excluída com sucesso.',
      'Erro ao excluir consulta. Verifique se ela não está vinculada a uma viagem.'
    );
  }

  function limparFormulario() {
    setNome('');
    setDescricao('');
    setErro('');
  }

  return (
    <div>
      <div className="page-title">
        <h2>Consultas</h2>
        <p>Cadastro dos tipos de consulta utilizados no gerenciamento das viagens sanitárias</p>
      </div>

      {mensagem && <div className="success-message">{mensagem}</div>}
      {erro && <div className="error-message-page">{erro}</div>}

      <div className="form-panel">
        <h3>Nova consulta</h3>

        <form onSubmit={salvarConsulta} className="form-grid">
          <div className="form-group">
            <label>Nome da consulta</label>
            <input
              type="text"
              placeholder="Exemplo: Cardiologia"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <input
              type="text"
              placeholder="Exemplo: Consulta com especialista em coração"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              <ClipboardPlus size={18} />
              Cadastrar consulta
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
            <h3>Consultas cadastradas</h3>
            <p>Lista de tipos de consulta disponíveis para as viagens</p>
          </div>

          <div className="table-count-badge">
            <ListChecks size={18} />
            {consultas.length} cadastrada{consultas.length === 1 ? '' : 's'}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome da consulta</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {consultas.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-table">
                  Nenhuma consulta cadastrada.
                </td>
              </tr>
            ) : (
              consultas.map((consulta) => (
                <tr key={consulta.id}>
                  <td>{consulta.id}</td>
                  <td>
                    <strong>{consulta.nome}</strong>
                  </td>
                  <td>{consulta.descricao || '-'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-small btn-edit"
                        onClick={() => abrirModalEdicao(consulta)}
                      >
                        <Pencil size={14} />
                        Editar
                      </button>

                      <button
                        className="btn-small btn-delete"
                        onClick={() => excluirConsulta(consulta)}
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

      {consultaEditando && (
        <div className="cadastro-modal-overlay">
          <div className="cadastro-modal-card">
            <div className="cadastro-modal-header">
              <div>
                <span>Edição de consulta</span>
                <h3>{consultaEditando.nome}</h3>
                <p>Altere os dados e salve para atualizar o cadastro.</p>
              </div>

              <button className="modal-close" onClick={fecharModalEdicao}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvarEdicaoConsulta} className="cadastro-modal-form">
              <div className="form-group">
                <label>Nome da consulta</label>
                <input
                  type="text"
                  value={editNome}
                  onChange={(event) => setEditNome(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  value={editDescricao}
                  onChange={(event) => setEditDescricao(event.target.value)}
                />
              </div>

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

export default Consultas;
