import { useState } from 'react';
import { useCadastro } from '../hooks/useCadastro';
import { ClipboardPlus, ListChecks, Pencil, Save, Trash2, X } from 'lucide-react';

function Exames() {
  const { itens: exames, mensagem, erro, setErro, salvar, atualizar, excluir } =
    useCadastro('/exames');

  const [nome, setNome] = useState('');
  const [exigeIsolamento, setExigeIsolamento] = useState(false);

  const [exameEditando, setExameEditando] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editExigeIsolamento, setEditExigeIsolamento] = useState(false);

  async function salvarExame(event) {
    event.preventDefault();

    setErro('');

    if (!nome.trim()) {
      setErro('Informe o nome do exame.');
      return;
    }

    const dadosExame = {
      nome: nome.trim(),
      exigeIsolamento,
    };

    const sucesso = await salvar(
      dadosExame,
      'Exame cadastrado com sucesso.',
      'Erro ao cadastrar exame. Verifique os dados informados.'
    );

    if (sucesso) {
      limparFormulario();
    }
  }

  function abrirModalEdicao(exame) {
    setExameEditando(exame);
    setEditNome(exame.nome || '');
    setEditExigeIsolamento(Boolean(exame.exigeIsolamento));
    setErro('');
  }

  function fecharModalEdicao() {
    setExameEditando(null);
    setEditNome('');
    setEditExigeIsolamento(false);
  }

  async function salvarEdicaoExame(event) {
    event.preventDefault();

    if (!editNome.trim()) {
      setErro('Informe o nome do exame.');
      return;
    }

    const dadosExame = {
      nome: editNome.trim(),
      exigeIsolamento: editExigeIsolamento,
    };

    const sucesso = await atualizar(
      exameEditando.id,
      dadosExame,
      'Exame atualizado com sucesso.',
      'Erro ao atualizar exame. Verifique os dados informados.'
    );

    if (sucesso) {
      fecharModalEdicao();
    }
  }

  async function excluirExame(exame) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o exame "${exame.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    await excluir(
      exame.id,
      'Exame excluído com sucesso.',
      'Erro ao excluir exame. Verifique se ele não está vinculado a uma viagem.'
    );
  }

  function limparFormulario() {
    setNome('');
    setExigeIsolamento(false);
    setErro('');
  }

  return (
    <div>
      <div className="page-title">
        <h2>Exames</h2>
        <p>Cadastro dos exames utilizados nas viagens sanitárias e da regra de isolamento no transporte</p>
      </div>

      {mensagem && <div className="success-message">{mensagem}</div>}
      {erro && <div className="error-message-page">{erro}</div>}

      <div className="form-panel">
        <h3>Novo exame</h3>

        <form onSubmit={salvarExame} className="form-grid">
          <div className="form-group">
            <label>Nome do exame</label>
            <input
              type="text"
              placeholder="Exemplo: Hemodiálise"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Exige isolamento?</label>
            <select
              value={exigeIsolamento ? 'sim' : 'nao'}
              onChange={(event) => setExigeIsolamento(event.target.value === 'sim')}
            >
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              <ClipboardPlus size={18} />
              Cadastrar exame
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
            <h3>Exames cadastrados</h3>
            <p>Lista de exames disponíveis para vincular aos passageiros das viagens</p>
          </div>

          <div className="table-count-badge">
            <ListChecks size={18} />
            {exames.length} cadastrado{exames.length === 1 ? '' : 's'}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome do exame</th>
              <th>Exige isolamento</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {exames.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-table">
                  Nenhum exame cadastrado.
                </td>
              </tr>
            ) : (
              exames.map((exame) => (
                <tr key={exame.id}>
                  <td>{exame.id}</td>
                  <td>
                    <strong>{exame.nome}</strong>
                  </td>
                  <td>
                    <span className={exame.exigeIsolamento ? 'badge-danger' : 'badge-success'}>
                      {exame.exigeIsolamento ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-small btn-edit"
                        onClick={() => abrirModalEdicao(exame)}
                      >
                        <Pencil size={14} />
                        Editar
                      </button>

                      <button
                        className="btn-small btn-delete"
                        onClick={() => excluirExame(exame)}
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

      {exameEditando && (
        <div className="cadastro-modal-overlay">
          <div className="cadastro-modal-card">
            <div className="cadastro-modal-header">
              <div>
                <span>Edição de exame</span>
                <h3>{exameEditando.nome}</h3>
                <p>Altere os dados e salve para atualizar o cadastro.</p>
              </div>

              <button className="modal-close" onClick={fecharModalEdicao}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvarEdicaoExame} className="cadastro-modal-form">
              <div className="form-group">
                <label>Nome do exame</label>
                <input
                  type="text"
                  value={editNome}
                  onChange={(event) => setEditNome(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Exige isolamento?</label>
                <select
                  value={editExigeIsolamento ? 'sim' : 'nao'}
                  onChange={(event) => setEditExigeIsolamento(event.target.value === 'sim')}
                >
                  <option value="nao">Não</option>
                  <option value="sim">Sim</option>
                </select>
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

export default Exames;
