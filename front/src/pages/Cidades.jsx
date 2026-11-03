import { useState } from 'react';
import { useCadastro } from '../hooks/useCadastro';
import { ListChecks, Pencil, Save, Trash2, X } from 'lucide-react';

function Cidades() {
  const { itens: cidades, mensagem, erro, setErro, salvar, atualizar, excluir } =
    useCadastro('/cidades');

  const [nome, setNome] = useState('');
  const [estado, setEstado] = useState('');

  const [cidadeEditando, setCidadeEditando] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editEstado, setEditEstado] = useState('');

  async function salvarCidade(event) {
    event.preventDefault();

    setErro('');

    if (!nome.trim()) {
      setErro('Informe o nome da cidade.');
      return;
    }

    if (!estado.trim()) {
      setErro('Informe o estado da cidade.');
      return;
    }

    const dadosCidade = {
      nome: nome.trim(),
      estado: estado.trim(),
    };

    const sucesso = await salvar(
      dadosCidade,
      'Cidade cadastrada com sucesso.',
      'Erro ao cadastrar cidade. Verifique se ela já existe ou se os dados estão corretos.'
    );

    if (sucesso) {
      limparFormulario();
    }
  }

  function abrirModalEdicao(cidade) {
    setCidadeEditando(cidade);
    setEditNome(cidade.nome || '');
    setEditEstado(cidade.estado || '');
    setErro('');
  }

  function fecharModalEdicao() {
    setCidadeEditando(null);
    setEditNome('');
    setEditEstado('');
  }

  async function salvarEdicaoCidade(event) {
    event.preventDefault();

    if (!editNome.trim()) {
      setErro('Informe o nome da cidade.');
      return;
    }

    if (!editEstado.trim()) {
      setErro('Informe o estado da cidade.');
      return;
    }

    const dadosCidade = {
      nome: editNome.trim(),
      estado: editEstado.trim(),
    };

    const sucesso = await atualizar(
      cidadeEditando.id,
      dadosCidade,
      'Cidade atualizada com sucesso.',
      'Erro ao atualizar cidade. Verifique os dados informados.'
    );

    if (sucesso) {
      fecharModalEdicao();
    }
  }

  async function excluirCidade(cidade) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir a cidade "${cidade.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    await excluir(
      cidade.id,
      'Cidade excluída com sucesso.',
      'Erro ao excluir cidade. Verifique se ela não está vinculada a uma viagem.'
    );
  }

  function limparFormulario() {
    setNome('');
    setEstado('');
    setErro('');
  }

  return (
    <div>
      <div className="page-title">
        <h2>Cidades</h2>
        <p>Cadastro das cidades utilizadas como origem e destino das viagens</p>
      </div>

      {mensagem && <div className="success-message">{mensagem}</div>}
      {erro && <div className="error-message-page">{erro}</div>}

      <div className="form-panel">
        <h3>Nova cidade</h3>

        <form onSubmit={salvarCidade} className="form-grid">
          <div className="form-group">
            <label>Nome da cidade</label>
            <input
              type="text"
              placeholder="Exemplo: Marília"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Estado</label>
            <input
              type="text"
              placeholder="Exemplo: SP"
              value={estado}
              onChange={(event) => setEstado(event.target.value.toUpperCase())}
              maxLength="2"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Cadastrar
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
            <h3>Cidades cadastradas</h3>
            <p>Lista de cidades disponíveis para origem e destino das viagens</p>
          </div>

          <div className="table-count-badge">
            <ListChecks size={18} />
            {cidades.length} cadastrada{cidades.length === 1 ? '' : 's'}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cidade</th>
              <th>Estado</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {cidades.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table">
                  Nenhuma cidade cadastrada.
                </td>
              </tr>
            ) : (
              cidades.map((cidade) => (
                <tr key={cidade.id}>
                  <td>{cidade.id}</td>
                  <td>{cidade.nome}</td>
                  <td>{cidade.estado}</td>
                  <td>{cidade.latitude}</td>
                  <td>{cidade.longitude}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-small btn-edit"
                        onClick={() => abrirModalEdicao(cidade)}
                      >
                        <Pencil size={14} />
                        Editar
                      </button>

                      <button
                        className="btn-small btn-delete"
                        onClick={() => excluirCidade(cidade)}
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

      {cidadeEditando && (
        <div className="cadastro-modal-overlay">
          <div className="cadastro-modal-card">
            <div className="cadastro-modal-header">
              <div>
                <span>Edição de cidade</span>
                <h3>{cidadeEditando.nome}</h3>
                <p>Altere os dados e salve para atualizar o cadastro.</p>
              </div>

              <button className="modal-close" onClick={fecharModalEdicao}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvarEdicaoCidade} className="cadastro-modal-form">
              <div className="form-group">
                <label>Nome da cidade</label>
                <input
                  type="text"
                  value={editNome}
                  onChange={(event) => setEditNome(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <input
                  type="text"
                  value={editEstado}
                  onChange={(event) => setEditEstado(event.target.value.toUpperCase())}
                  maxLength="2"
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

export default Cidades;
