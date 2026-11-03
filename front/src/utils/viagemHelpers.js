// funcoes que varias telas usam (Dashboard, Viagens, DetalheViagem,
// MinhasViagens, Pacientes) pra formatar dado de viagem e erro de API

export function classeStatus(status) {
  if (status === 'CRIADO') {
    return 'badge-info';
  }

  if (status === 'CONFIRMADO') {
    return 'badge-success';
  }

  if (status === 'EM_ANDAMENTO') {
    return 'badge-warning';
  }

  if (status === 'FINALIZADO' || status === 'CONCLUIDO') {
    return 'badge-neutral';
  }

  if (status === 'CANCELADO') {
    return 'badge-danger';
  }

  return 'badge-neutral';
}

export function formatarData(data) {
  if (!data) {
    return '-';
  }

  return new Date(data).toLocaleString('pt-BR');
}

export function formatarDistancia(distancia) {
  if (distancia === null || distancia === undefined) {
    return '-';
  }

  return `${distancia.toFixed(2)} km`;
}

export function formatarDuracao(minutos) {
  if (minutos === null || minutos === undefined) {
    return '-';
  }

  const horas = Math.floor(minutos / 60);
  const minutosRestantes = Math.round(minutos % 60);

  if (horas === 0) {
    return `${minutosRestantes} min`;
  }

  return `${horas}h ${minutosRestantes}min`;
}

export function pegarNomeCidade(cidade) {
  if (!cidade) {
    return '-';
  }

  if (typeof cidade === 'string') {
    return cidade;
  }

  const nome = cidade.nome || cidade.nomeCidade || cidade.cidade;
  const estado = cidade.estado || cidade.uf;

  if (nome && estado) {
    return `${nome} / ${estado}`;
  }

  if (nome) {
    return nome;
  }

  return '-';
}

export function pegarNomeVeiculo(veiculo) {
  if (!veiculo) {
    return 'Não atribuído';
  }

  return `${veiculo.modelo} - ${veiculo.placa}`;
}


export function normalizarTexto(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}


export function extrairMensagemErro(error, mensagemPadrao) {
  if (error.response) {
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }

    if (error.response.data?.message) {
      return error.response.data.message;
    }

    if (error.response.data?.error) {
      return error.response.data.error;
    }

    return mensagemPadrao;
  }

  return 'Backend não respondeu. Verifique se o Spring Boot está rodando.';
}
