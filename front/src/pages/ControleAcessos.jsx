import { useState } from 'react';
import api from '../api/api';
import { useCadastro } from '../hooks/useCadastro';
import { extrairMensagemErro } from '../utils/viagemHelpers';
import PasswordInput from '../components/PasswordInput';
import {
  ListChecks,
  Pencil,
  Power,
  UserPlus,
  X,
} from 'lucide-react';

function ControleAcessos() {
  const { itens: usuarios, mensagem, erro, setErro, salvar, atualizar, carregar } =
    useCadastro('/usuarios');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('MOTORISTA');
  const [telefone, setTelefone] = useState('');

  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSenha, setEditSenha] = useState('');
  const [editPerfil, setEditPerfil] = useState('MOTORISTA');
  const [editTelefone, setEditTelefone] = useState('');
  const [editAtivo, setEditAtivo] = useState(true);

  async function salvarUsuario(event) {
    event.preventDefault();

    setErro('');

    if (!nome.trim() || !email.trim() || !senha.trim() || !perfil) {
      setErro('Preencha todos os campos do usuário.');
      return;
    }

    const dados = {
      nome: nome.trim(),
      email: email.trim(),
      senha: senha.trim(),
      perfil,
      telefone: telefone.trim(),
    };

    const sucesso = await salvar(
      dados,
      'Usuário cadastrado com sucesso.',
      'Erro ao cadastrar usuário.'
    );

    if (sucesso) {
      limparFormulario();
    }
  }

  function abrirModalEdicao(usuario) {
    setUsuarioEditando(usuario);
    setEditNome(usuario.nome || '');
    setEditEmail(usuario.email || '');
    setEditSenha('');
    setEditPerfil(usuario.perfil || 'MOTORISTA');
    setEditTelefone(usuario.telefone || '');
    setEditAtivo(usuario.ativo !== false);
    setErro('');
  }

  function fecharModalEdicao() {
    setUsuarioEditando(null);
    setEditNome('');
    setEditEmail('');
    setEditSenha('');
    setEditPerfil('MOTORISTA');
    setEditTelefone('');
    setEditAtivo(true);
  }

  async function salvarEdicaoUsuario(event) {
    event.preventDefault();

    if (!editNome.trim() || !editEmail.trim() || !editPerfil) {
      setErro('Preencha todos os campos do usuário.');
      return;
    }

    const dados = {
      nome: editNome.trim(),
      email: editEmail.trim(),
      senha: editSenha.trim(),
      perfil: editPerfil,
      telefone: editTelefone.trim(),
      ativo: editAtivo,
    };

    const sucesso = await atualizar(
      usuarioEditando.id,
      dados,
      'Usuário atualizado com sucesso.',
      'Erro ao atualizar usuário.'
    );

    if (sucesso) {
      fecharModalEdicao();
    }
  }

  async function alterarStatusUsuario(usuario) {
    const novoStatus = !usuario.ativo;

    const confirmar = window.confirm(
      novoStatus
        ? `Deseja ativar o usuário "${usuario.nome}"?`
        : `Deseja inativar o usuário "${usuario.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await api.patch(`/usuarios/${usuario.id}/status?ativo=${novoStatus}`);
      await carregar();
    } catch (error) {
      console.log(error);
      setErro(extrairMensagemErro(error, 'Erro ao alterar status do usuário.'));
    }
  }

  function limparFormulario() {
    setNome('');
    setEmail('');
    setSenha('');
    setPerfil('MOTORISTA');
    setTelefone('');
  }

  function formatarPerfil(perfilUsuario) {
    if (perfilUsuario === 'FUNCIONARIO') {
      return 'Funcionário';
    }

    if (perfilUsuario === 'MOTORISTA') {
      return 'Motorista';
    }

    return perfilUsuario || '-';
  }

  return (
    <div>
      <div className="page-title">
        <h2>Controle de acessos</h2>
        <p>
          Cadastre funcionários e motoristas e controle as permissões de acesso ao sistema.
          Motoristas precisam ter telefone cadastrado para receber a mensagem da viagem pelo WhatsApp.
        </p>
      </div>

      {mensagem && <div className="success-message">{mensagem}</div>}
      {erro && <div className="error-message-page">{erro}</div>}

      <div className="form-panel">
        <h3>Novo usuário</h3>

        <form onSubmit={salvarUsuario} className="form-grid">
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              placeholder="Exemplo: Motorista João"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="Exemplo: joao@sigts.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <PasswordInput
              placeholder="Senha de acesso"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Perfil</label>
            <select
              value={perfil}
              onChange={(event) => setPerfil(event.target.value)}
            >
              <option value="MOTORISTA">Motorista</option>
              <option value="FUNCIONARIO">Funcionário</option>
            </select>
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="text"
              placeholder="Exemplo: 5518999999999"
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              <UserPlus size={18} />
              Cadastrar usuário
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
            <h3>Usuários cadastrados</h3>
            <p>Funcionários e motoristas com acesso ao sistema</p>
          </div>

          <div className="table-count-badge">
            <ListChecks size={18} />
            {usuarios.length} cadastrado{usuarios.length === 1 ? '' : 's'}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Telefone</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-table">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>
                    <strong>{usuario.nome}</strong>
                  </td>
                  <td>{usuario.email}</td>
                  <td>{formatarPerfil(usuario.perfil)}</td>
                  <td>{usuario.telefone || '-'}</td>
                  <td>
                    <span className={usuario.ativo === false ? 'badge-danger' : 'badge-success'}>
                      {usuario.ativo === false ? 'INATIVO' : 'ATIVO'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-small btn-edit"
                        onClick={() => abrirModalEdicao(usuario)}
                      >
                        <Pencil size={14} />
                        Editar
                      </button>

                      <button
                        className={usuario.ativo === false ? 'btn-small' : 'btn-small btn-delete'}
                        onClick={() => alterarStatusUsuario(usuario)}
                      >
                        <Power size={14} />
                        {usuario.ativo === false ? 'Ativar' : 'Inativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {usuarioEditando && (
        <div className="cadastro-modal-overlay">
          <div className="cadastro-modal-card">
            <div className="cadastro-modal-header">
              <div>
                <span>Editar acesso</span>
                <h3>{usuarioEditando.nome}</h3>
                <p>Atualize os dados do usuário selecionado.</p>
              </div>

              <button className="modal-close" onClick={fecharModalEdicao}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={salvarEdicaoUsuario} className="cadastro-modal-form">
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={editNome}
                  onChange={(event) => setEditNome(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(event) => setEditEmail(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Nova senha</label>
                <PasswordInput
                  placeholder="Deixe vazio para manter a senha atual"
                  value={editSenha}
                  onChange={(event) => setEditSenha(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Perfil</label>
                <select
                  value={editPerfil}
                  onChange={(event) => setEditPerfil(event.target.value)}
                >
                  <option value="MOTORISTA">Motorista</option>
                  <option value="FUNCIONARIO">Funcionário</option>
                </select>
              </div>

              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="text"
                  value={editTelefone}
                  onChange={(event) => setEditTelefone(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editAtivo ? 'true' : 'false'}
                  onChange={(event) => setEditAtivo(event.target.value === 'true')}
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>

              <div className="cadastro-modal-actions">
                <button type="button" className="btn-secondary" onClick={fecharModalEdicao}>
                  Cancelar
                </button>

                <button type="submit" className="btn-primary">
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

export default ControleAcessos;
