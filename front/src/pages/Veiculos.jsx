import { useState } from 'react';
import { useCadastro } from '../hooks/useCadastro';
import { ClipboardPlus, ListChecks, Pencil, Save, Trash2, X } from 'lucide-react';

function Veiculos() {
  const { itens: veiculos, mensagem, erro, setErro, salvar, atualizar, excluir } =
    useCadastro('/veiculos');

  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [ano, setAno] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [isolado, setIsolado] = useState(false);

  const [veiculoEditando, setVeiculoEditando] = useState(null);
  const [editModelo, setEditModelo] = useState('');
  const [editPlaca, setEditPlaca] = useState('');
  const [editAno, setEditAno] = useState('');
  const [editCapacidade, setEditCapacidade] = useState('');
  const [editIsolado, setEditIsolado] = useState(false);

  async function salvarVeiculo(event) {
    event.preventDefault();

    setErro('');

    if (!modelo.trim()) {
      setErro('Informe o modelo do veículo.');
      return;
    }

    if (!placa.trim()) {
      setErro('Informe a placa do veículo.');
      return;
    }

    if (!ano.trim()) {
      setErro('Informe o ano do veículo.');
      return;
    }

    if (!capacidade) {
      setErro('Informe a capacidade do veículo.');
      return;
    }

    const dadosVeiculo = {
      modelo: modelo.trim(),
      placa: placa.trim().toUpperCase(),
      ano: ano.trim(),
      capacidade: Number(capacidade),
      isolado,
    };

    const sucesso = await salvar(
      dadosVeiculo,
      'Veículo cadastrado com sucesso.',
      'Erro ao cadastrar veículo. Verifique se a placa já existe ou se os dados estão corretos.'
    );

    if (sucesso) {
      limparFormulario();
    }
  }

  function abrirModalEdicao(veiculo) {
    setVeiculoEditando(veiculo);
    setEditModelo(veiculo.modelo || '');
    setEditPlaca(veiculo.placa || '');
    setEditAno(veiculo.ano || '');
    setEditCapacidade(veiculo.capacidade ?? '');
    setEditIsolado(Boolean(veiculo.isolado));
    setErro('');
  }

  function fecharModalEdicao() {
    setVeiculoEditando(null);
    setEditModelo('');
    setEditPlaca('');
    setEditAno('');
    setEditCapacidade('');
    setEditIsolado(false);
  }

  async function salvarEdicaoVeiculo(event) {
    event.preventDefault();

    if (!editModelo.trim() || !editPlaca.trim() || !editAno.trim() || !editCapacidade) {
      setErro('Preencha todos os campos do veículo.');
      return;
    }

    const dadosVeiculo = {
      modelo: editModelo.trim(),
      placa: editPlaca.trim().toUpperCase(),
      ano: editAno.trim(),
      capacidade: Number(editCapacidade),
      isolado: editIsolado,
    };

    const sucesso = await atualizar(
      veiculoEditando.id,
      dadosVeiculo,
      'Veículo atualizado com sucesso.',
      'Erro ao atualizar veículo. Verifique se a placa já existe ou se os dados estão corretos.'
    );

    if (sucesso) {
      fecharModalEdicao();
    }
  }

  async function excluirVeiculo(veiculo) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o veículo "${veiculo.modelo} - ${veiculo.placa}"?`
    );

    if (!confirmar) {
      return;
    }

    await excluir(
      veiculo.id,
      'Veículo excluído com sucesso.',
      'Erro ao excluir veículo. Verifique se ele não está vinculado a uma viagem.'
    );
  }

  function limparFormulario() {
    setModelo('');
    setPlaca('');
    setAno('');
    setCapacidade('');
    setIsolado(false);
    setErro('');
  }

  return (
    <div>
      <div className="page-title">
        <h2>Veículos</h2>
        <p>Cadastro dos veículos disponíveis para utilização nas viagens sanitárias</p>
      </div>

      {mensagem && <div className="success-message">{mensagem}</div>}
      {erro && <div className="error-message-page">{erro}</div>}

      <div className="form-panel">
        <h3>Novo veículo</h3>

        <form onSubmit={salvarVeiculo} className="form-grid">
          <div className="form-group">
            <label>Modelo</label>
            <input
              type="text"
              placeholder="Exemplo: Van Renault Master"
              value={modelo}
              onChange={(event) => setModelo(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Placa</label>
            <input
              type="text"
              placeholder="Exemplo: ABC1D23"
              value={placa}
              onChange={(event) => setPlaca(event.target.value.toUpperCase())}
            />
          </div>

          <div className="form-group">
            <label>Ano</label>
            <input
              type="text"
              placeholder="Exemplo: 2022"
              value={ano}
              onChange={(event) => setAno(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Capacidade</label>
            <input
              type="number"
              placeholder="Exemplo: 15"
              value={capacidade}
              onChange={(event) => setCapacidade(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Veículo isolado?</label>
            <select
              value={isolado ? 'sim' : 'nao'}
              onChange={(event) => setIsolado(event.target.value === 'sim')}
            >
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              <ClipboardPlus size={18} />
              Cadastrar veículo
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
            <h3>Veículos cadastrados</h3>
            <p>Lista da frota disponível para utilização nas viagens sanitárias</p>
          </div>

          <div className="table-count-badge">
            <ListChecks size={18} />
            {veiculos.length} cadastrado{veiculos.length === 1 ? '' : 's'}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Modelo</th>
              <th>Placa</th>
              <th>Ano</th>
              <th>Capacidade</th>
              <th>Isolado</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {veiculos.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-table">
                  Nenhum veículo cadastrado.
                </td>
              </tr>
            ) : (
              veiculos.map((veiculo) => (
                <tr key={veiculo.id}>
                  <td>{veiculo.id}</td>
                  <td>
                    <strong>{veiculo.modelo}</strong>
                  </td>
                  <td>{veiculo.placa}</td>
                  <td>{veiculo.ano || '-'}</td>
                  <td>{veiculo.capacidade || '-'}</td>
                  <td>
                    <span className={veiculo.isolado ? 'badge-danger' : 'badge-success'}>
                      {veiculo.isolado ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-small btn-edit"
                        onClick={() => abrirModalEdicao(veiculo)}
                      >
                        <Pencil size={14} />
                        Editar
                      </button>

                      <button
                        className="btn-small btn-delete"
                        onClick={() => excluirVeiculo(veiculo)}
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

      {veiculoEditando && (
        <div className="cadastro-modal-overlay">
          <div className="cadastro-modal-card">
            <div className="cadastro-modal-header">
              <div>
                <span>Edição de veículo</span>
                <h3>{veiculoEditando.modelo}</h3>
                <p>Altere os dados e salve para atualizar o cadastro.</p>
              </div>

              <button className="modal-close" onClick={fecharModalEdicao}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvarEdicaoVeiculo} className="cadastro-modal-form">
              <div className="form-group">
                <label>Modelo</label>
                <input
                  type="text"
                  value={editModelo}
                  onChange={(event) => setEditModelo(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Placa</label>
                <input
                  type="text"
                  value={editPlaca}
                  onChange={(event) => setEditPlaca(event.target.value.toUpperCase())}
                />
              </div>

              <div className="form-group">
                <label>Ano</label>
                <input
                  type="text"
                  value={editAno}
                  onChange={(event) => setEditAno(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Capacidade</label>
                <input
                  type="number"
                  value={editCapacidade}
                  onChange={(event) => setEditCapacidade(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Veículo isolado?</label>
                <select
                  value={editIsolado ? 'sim' : 'nao'}
                  onChange={(event) => setEditIsolado(event.target.value === 'sim')}
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

export default Veiculos;
