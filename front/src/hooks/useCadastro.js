import { useEffect, useState } from 'react';
import api from '../api/api';
import { extrairMensagemErro } from '../utils/viagemHelpers';

export function useCadastro(endpoint) {
  const [itens, setItens] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregar();
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

  async function carregar() {
    try {
      const response = await api.get(endpoint);
      setItens(response.data);
    } catch (error) {
      console.log(error);
      setErro('Erro ao carregar dados.');
    }
  }

  async function salvar(dados, mensagemSucesso, mensagemErroPadrao) {
    try {
      await api.post(endpoint, dados);
      setMensagem(mensagemSucesso);
      setErro('');
      await carregar();
      return true;
    } catch (error) {
      console.log(error);
      setErro(extrairMensagemErro(error, mensagemErroPadrao));
      return false;
    }
  }

  async function atualizar(id, dados, mensagemSucesso, mensagemErroPadrao) {
    try {
      await api.put(`${endpoint}/${id}`, dados);
      setMensagem(mensagemSucesso);
      setErro('');
      await carregar();
      return true;
    } catch (error) {
      console.log(error);
      setErro(extrairMensagemErro(error, mensagemErroPadrao));
      return false;
    }
  }

  async function excluir(id, mensagemSucesso, mensagemErroPadrao) {
    try {
      await api.delete(`${endpoint}/${id}`);
      setMensagem(mensagemSucesso);
      setErro('');
      await carregar();
      return true;
    } catch (error) {
      console.log(error);
      setErro(extrairMensagemErro(error, mensagemErroPadrao));
      return false;
    }
  }

  return { itens, mensagem, erro, setMensagem, setErro, carregar, salvar, atualizar, excluir };
}
