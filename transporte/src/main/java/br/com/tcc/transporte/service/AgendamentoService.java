package br.com.tcc.transporte.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.transporte.dto.request.AgendamentoRequestDTO;
import br.com.tcc.transporte.entity.Agendamento;
import br.com.tcc.transporte.entity.Cidade;
import br.com.tcc.transporte.entity.Consulta;
import br.com.tcc.transporte.entity.Exame;
import br.com.tcc.transporte.entity.HistoricoViagem;
import br.com.tcc.transporte.entity.Paciente;
import br.com.tcc.transporte.entity.PassageiroViagem;
import br.com.tcc.transporte.entity.Usuario;
import br.com.tcc.transporte.entity.Veiculo;
import br.com.tcc.transporte.enums.PerfilUsuario;
import br.com.tcc.transporte.enums.StatusAgendamento;
import br.com.tcc.transporte.exception.AcessoNegadoException;
import br.com.tcc.transporte.repository.AgendamentoRepository;
import br.com.tcc.transporte.repository.PassageiroViagemRepository;
import br.com.tcc.transporte.repository.UsuarioRepository;
import br.com.tcc.transporte.security.UsuarioAtualService;

@Service
public class AgendamentoService {

    private final AgendamentoRepository repository;
    private final PacienteService pacienteService;
    private final ConsultaService consultaService;
    private final ExameService exameService;
    private final CidadeService cidadeService;
    private final RouteService routeService;
    private final VeiculoService veiculoService;
    private final PassageiroViagemRepository passageiroRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacaoService notificacaoService;
    private final HistoricoViagemService historicoViagemService;
    private final UsuarioAtualService usuarioAtualService;

    public AgendamentoService(
            AgendamentoRepository repository,
            PacienteService pacienteService,
            ConsultaService consultaService,
            ExameService exameService,
            CidadeService cidadeService,
            RouteService routeService,
            VeiculoService veiculoService,
            PassageiroViagemRepository passageiroRepository,
            UsuarioRepository usuarioRepository,
            NotificacaoService notificacaoService,
            HistoricoViagemService historicoViagemService,
            UsuarioAtualService usuarioAtualService
    ) {
        this.repository = repository;
        this.pacienteService = pacienteService;
        this.consultaService = consultaService;
        this.exameService = exameService;
        this.cidadeService = cidadeService;
        this.routeService = routeService;
        this.veiculoService = veiculoService;
        this.passageiroRepository = passageiroRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacaoService = notificacaoService;
        this.historicoViagemService = historicoViagemService;
        this.usuarioAtualService = usuarioAtualService;
    }

    public Agendamento criarAgendamento(
            Long cidadeOrigemId,
            Long cidadeDestinoId,
            LocalDateTime dataHora,
            Double distanciaKm,
            Double duracaoMinutos
    ) {
        Cidade origem = cidadeService.buscarPorId(cidadeOrigemId);
        Cidade destino = cidadeService.buscarPorId(cidadeDestinoId);

        if (origem.getId().equals(destino.getId())) {
            throw new RuntimeException("Cidade origem e destino não podem ser iguais");
        }

        if (dataHora == null || dataHora.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("A data e hora da viagem não pode estar no passado");
        }

        double[] rota = rotaEscolhidaOuPadrao(origem, destino, distanciaKm, duracaoMinutos);

        Agendamento agendamento = new Agendamento();

        agendamento.setCidadeOrigem(origem);
        agendamento.setCidadeDestino(destino);
        agendamento.setDistanciaKm(rota[0]);
        agendamento.setDuracaoMinutos(rota[1]);
        agendamento.setDataHora(dataHora);
        agendamento.setStatus(StatusAgendamento.CRIADO);

        Agendamento agendamentoSalvo = repository.save(agendamento);

        historicoViagemService.registrar(
                agendamentoSalvo,
                null,
                "VIAGEM_CRIADA",
                "Viagem criada no sistema com origem em "
                        + origem.getNome() + " / " + origem.getEstado()
                        + " e destino em "
                        + destino.getNome() + " / " + destino.getEstado()
                        + "."
        );

        return agendamentoSalvo;
    }

    // usa a rota que o usuario escolheu no mapa (entre as opcoes de trajeto);
    // se ele nao escolheu nenhuma, cai no calculo padrao via OSRM
    private double[] rotaEscolhidaOuPadrao(
            Cidade origem,
            Cidade destino,
            Double distanciaKm,
            Double duracaoMinutos
    ) {
        if (distanciaKm != null && duracaoMinutos != null) {
            return new double[]{distanciaKm, duracaoMinutos};
        }

        return routeService.calcularRota(origem, destino);
    }

    public Agendamento confirmarAgendamento(
            Long agendamentoId,
            Long veiculoId,
            Long motoristaId
    ) {
        Agendamento agendamento = buscarPorId(agendamentoId);

        Veiculo veiculo = veiculoService.buscarPorId(veiculoId);

        Usuario motorista = usuarioRepository.findById(motoristaId)
                .orElseThrow(() -> new RuntimeException("Motorista não encontrado"));

        if (motorista.getPerfil() != PerfilUsuario.MOTORISTA) {
            throw new RuntimeException("O usuário selecionado não possui perfil de motorista");
        }

        verificarConflitoDeAgenda(agendamento, veiculo, motorista);

        agendamento.setVeiculo(veiculo);
        agendamento.setMotorista(motorista);
        agendamento.setStatus(StatusAgendamento.CONFIRMADO);

        Agendamento agendamentoSalvo = repository.save(agendamento);

        historicoViagemService.registrar(
                agendamentoSalvo,
                null,
                "VIAGEM_CONFIRMADA",
                "Viagem confirmada com o motorista "
                        + motorista.getNome()
                        + " e veículo "
                        + veiculo.getModelo()
                        + " - "
                        + veiculo.getPlaca()
                        + "."
        );

        return agendamentoSalvo;
    }

    // nao deixa confirmar viagem com motorista/veiculo que ja ta confirmado,
    // ou em andamento em outra viagem no mesmo horario. Se nao tiver
    // duracao estimada, considera 60 min de margem
    private void verificarConflitoDeAgenda(Agendamento agendamento, Veiculo veiculo, Usuario motorista) {
        LocalDateTime inicio = agendamento.getDataHora();
        long duracao = agendamento.getDuracaoMinutos() != null
                ? agendamento.getDuracaoMinutos().longValue()
                : 60;
        LocalDateTime fim = inicio.plusMinutes(duracao);

        List<Agendamento> viagensDoVeiculo = repository.findByVeiculo_Id(veiculo.getId());

        for (Agendamento outra : viagensDoVeiculo) {
            if (haConflito(agendamento, outra, inicio, fim)) {
                throw new RuntimeException(
                        "O veículo " + veiculo.getModelo() + " - " + veiculo.getPlaca()
                                + " já está atribuído a outra viagem nesse horário."
                );
            }
        }

        List<Agendamento> viagensDoMotorista = repository.findByMotorista_Id(motorista.getId());

        for (Agendamento outra : viagensDoMotorista) {
            if (haConflito(agendamento, outra, inicio, fim)) {
                throw new RuntimeException(
                        "O motorista " + motorista.getNome()
                                + " já está atribuído a outra viagem nesse horário."
                );
            }
        }
    }

    private boolean haConflito(Agendamento atual, Agendamento outra, LocalDateTime inicio, LocalDateTime fim) {
        if (outra.getId().equals(atual.getId())) {
            return false;
        }

        if (outra.getStatus() != StatusAgendamento.CONFIRMADO
                && outra.getStatus() != StatusAgendamento.EM_ANDAMENTO) {
            return false;
        }

        if (outra.getDataHora() == null) {
            return false;
        }

        long duracaoOutra = outra.getDuracaoMinutos() != null
                ? outra.getDuracaoMinutos().longValue()
                : 60;
        LocalDateTime inicioOutra = outra.getDataHora();
        LocalDateTime fimOutra = inicioOutra.plusMinutes(duracaoOutra);

        return inicio.isBefore(fimOutra) && inicioOutra.isBefore(fim);
    }

    public List<Agendamento> listarTodos() {
        return repository.findAllByOrderByIdDesc();
    }

    public Agendamento buscarPorId(Long id) {
        Agendamento agendamento = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        verificarAcessoDoMotorista(agendamento);

        return agendamento;
    }

    // se for MOTORISTA, so pode acessar a viagem se ele for o motorista
    // atribuido (funcionario acessa qualquer uma)
    private void verificarAcessoDoMotorista(Agendamento agendamento) {
        Usuario usuarioAtual = usuarioAtualService.getUsuarioAtual();

        if (usuarioAtual.getPerfil() != PerfilUsuario.MOTORISTA) {
            return;
        }

        boolean ehOMotoristaDaViagem = agendamento.getMotorista() != null
                && agendamento.getMotorista().getId().equals(usuarioAtual.getId());

        if (!ehOMotoristaDaViagem) {
            throw new AcessoNegadoException("Esta viagem não está atribuída a você.");
        }
    }

    public int calcularVagasRestantes(Long agendamentoId) {
        Agendamento agendamento = buscarPorId(agendamentoId);

        if (agendamento.getVeiculo() == null) {
            throw new RuntimeException("Viagem não possui veículo");
        }

        if (agendamento.getVeiculo().getCapacidade() == null) {
            throw new RuntimeException("Veículo não possui capacidade cadastrada");
        }

        int capacidade;

        if (Boolean.TRUE.equals(agendamento.getVeiculo().getIsolado())) {
            capacidade = 1;
        } else {
            capacidade = agendamento.getVeiculo().getCapacidade();
        }

        long ocupados = passageiroRepository.countByAgendamento_Id(agendamentoId);

        return capacidade - (int) ocupados;
    }

    public Agendamento iniciarViagem(Long agendamentoId) {
        Agendamento agendamento = buscarPorId(agendamentoId);
        Usuario usuarioAtual = usuarioAtualService.getUsuarioAtual();

        // so o motorista atribuido inicia a viagem, funcionario nao inicia mais
        validarMotoristaDaViagem(agendamento, usuarioAtual, "iniciar");

        if (agendamento.getStatus() != StatusAgendamento.CONFIRMADO) {
            throw new RuntimeException("Viagem precisa estar CONFIRMADA");
        }

        agendamento.setStatus(StatusAgendamento.EM_ANDAMENTO);

        Agendamento agendamentoSalvo = repository.save(agendamento);

        historicoViagemService.registrar(
                agendamentoSalvo,
                usuarioAtual,
                "VIAGEM_INICIADA",
                "Viagem iniciada por " + usuarioAtual.getNome() + "."
        );

        return agendamentoSalvo;
    }

    public Agendamento finalizarViagem(Long agendamentoId) {
        Agendamento agendamento = buscarPorId(agendamentoId);
        Usuario usuarioAtual = usuarioAtualService.getUsuarioAtual();

        validarMotoristaDaViagem(agendamento, usuarioAtual, "finalizar");

        if (agendamento.getStatus() != StatusAgendamento.EM_ANDAMENTO) {
            throw new RuntimeException("Viagem precisa estar EM_ANDAMENTO");
        }

        agendamento.setStatus(StatusAgendamento.FINALIZADO);

        Agendamento agendamentoSalvo = repository.save(agendamento);

        historicoViagemService.registrar(
                agendamentoSalvo,
                usuarioAtual,
                "VIAGEM_FINALIZADA",
                "Viagem finalizada pelo motorista " + usuarioAtual.getNome() + "."
        );

        return agendamentoSalvo;
    }

    // so motorista inicia/finaliza viagem, e so a viagem que é dele
    private void validarMotoristaDaViagem(Agendamento agendamento, Usuario usuarioAtual, String acao) {
        if (usuarioAtual.getPerfil() != PerfilUsuario.MOTORISTA) {
            throw new AcessoNegadoException("Somente motorista pode " + acao + " a viagem.");
        }

        boolean ehOMotoristaDaViagem = agendamento.getMotorista() != null
                && agendamento.getMotorista().getId().equals(usuarioAtual.getId());

        if (!ehOMotoristaDaViagem) {
            throw new AcessoNegadoException("Você não é o motorista atribuído a esta viagem.");
        }
    }

    public Agendamento cancelarViagem(Long agendamentoId) {
        Agendamento agendamento = buscarPorId(agendamentoId);

        if (agendamento.getStatus() == StatusAgendamento.FINALIZADO) {
            throw new RuntimeException("Viagem já finalizada");
        }

        agendamento.setStatus(StatusAgendamento.CANCELADO);

        Agendamento agendamentoSalvo = repository.save(agendamento);

        historicoViagemService.registrar(
                agendamentoSalvo,
                null,
                "VIAGEM_CANCELADA",
                "Viagem cancelada no sistema."
        );

        return agendamentoSalvo;
    }

    public Agendamento adicionarPassageiro(
            Long agendamentoId,
            Long pacienteId,
            String hospital,
            Long consultaId,
            Long exameId,
            LocalDateTime horarioAtendimento,
            String observacao
    ) {
        Agendamento agendamento = buscarPorId(agendamentoId);

        if (agendamento.getVeiculo() == null) {
            throw new RuntimeException("Viagem ainda não possui veículo");
        }

        if (passageiroRepository.existsByAgendamento_IdAndPaciente_Id(agendamentoId, pacienteId)) {
            throw new RuntimeException("Paciente já está nesta viagem");
        }

        int vagasRestantes = calcularVagasRestantes(agendamentoId);

        if (vagasRestantes <= 0) {
            throw new RuntimeException("Veículo lotado");
        }

        Paciente paciente = pacienteService.buscarPorId(pacienteId);

        Consulta consulta = null;
        if (consultaId != null) {
            consulta = consultaService.buscarPorId(consultaId);
        }

        Exame exame = null;
        if (exameId != null) {
            exame = exameService.buscarPorId(exameId);
        }

        if (exame != null
                && Boolean.TRUE.equals(exame.getExigeIsolamento())
                && !Boolean.TRUE.equals(agendamento.getVeiculo().getIsolado())) {
            throw new RuntimeException(
                    "O exame " + exame.getNome() + " exige veículo isolado, "
                            + "mas o veículo desta viagem não é isolado."
            );
        }

        PassageiroViagem passageiro = new PassageiroViagem();

        passageiro.setAgendamento(agendamento);
        passageiro.setPaciente(paciente);
        passageiro.setHospital(hospital);
        passageiro.setConsulta(consulta);
        passageiro.setExame(exame);
        passageiro.setHorarioAtendimento(horarioAtendimento);
        passageiro.setObservacao(observacao);

        passageiroRepository.save(passageiro);

        historicoViagemService.registrar(
                agendamento,
                null,
                "PASSAGEIRO_ADICIONADO",
                "Paciente " + paciente.getNome() + " adicionado à viagem."
        );

        return buscarPorId(agendamentoId);
    }

    public List<PassageiroViagem> listarPassageiros(Long agendamentoId) {
        buscarPorId(agendamentoId);

        List<PassageiroViagem> passageiros =
                passageiroRepository.buscarPassageirosComPaciente(agendamentoId);

        passageiros.sort(
                Comparator.comparing(
                        PassageiroViagem::getHorarioAtendimento,
                        Comparator.nullsLast(Comparator.naturalOrder())
                )
        );

        return passageiros;
    }

    public Agendamento removerPassageiro(Long agendamentoId, Long pacienteId) {
        Agendamento agendamento = buscarPorId(agendamentoId);

        PassageiroViagem passageiro = passageiroRepository
                .findByAgendamento_IdAndPaciente_Id(agendamentoId, pacienteId)
                .orElseThrow(() -> new RuntimeException("Passageiro não encontrado nesta viagem"));

        String nomePaciente = passageiro.getPaciente() != null
                ? passageiro.getPaciente().getNome()
                : "Paciente";

        passageiroRepository.delete(passageiro);

        historicoViagemService.registrar(
                agendamento,
                null,
                "PASSAGEIRO_REMOVIDO",
                nomePaciente + " removido da viagem."
        );

        return buscarPorId(agendamentoId);
    }

    @Transactional(readOnly = true)
    public List<PassageiroViagem> historicoPaciente(Long pacienteId) {
        pacienteService.buscarPorId(pacienteId);

        return passageiroRepository.buscarHistoricoCompletoPorPaciente(pacienteId);
    }

    public Agendamento atualizar(Long id, AgendamentoRequestDTO dto) {
        Agendamento agendamento = buscarPorId(id);

        if (!agendamento.getStatus().name().equals("CRIADO")) {
            throw new RuntimeException("Somente viagens com status CRIADO podem ser editadas");
        }

        Cidade origem = cidadeService.buscarPorId(dto.getCidadeOrigemId());
        Cidade destino = cidadeService.buscarPorId(dto.getCidadeDestinoId());

        if (origem.getId().equals(destino.getId())) {
            throw new RuntimeException("Origem e destino não podem ser iguais");
        }

        if (dto.getDataHora() == null || dto.getDataHora().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("A data e hora da viagem não pode estar no passado");
        }

        double[] rota = rotaEscolhidaOuPadrao(origem, destino, dto.getDistanciaKm(), dto.getDuracaoMinutos());

        agendamento.setCidadeOrigem(origem);
        agendamento.setCidadeDestino(destino);
        agendamento.setDataHora(dto.getDataHora());
        agendamento.setDistanciaKm(rota[0]);
        agendamento.setDuracaoMinutos(rota[1]);

        Agendamento agendamentoSalvo = repository.save(agendamento);

        historicoViagemService.registrar(
                agendamentoSalvo,
                null,
                "VIAGEM_EDITADA",
                "Dados da viagem foram atualizados."
        );

        return agendamentoSalvo;
    }

    @Transactional
    public void excluir(Long id) {
        Agendamento agendamento = buscarPorId(id);

        passageiroRepository.deleteByAgendamento_Id(id);

        historicoViagemService.excluirPorViagem(id);

        repository.delete(agendamento);
    }

    public List<Agendamento> listarPorMotorista(Long motoristaId) {
        Usuario usuarioAtual = usuarioAtualService.getUsuarioAtual();

        boolean motoristaConsultandoOutroMotorista =
                usuarioAtual.getPerfil() == PerfilUsuario.MOTORISTA
                        && !usuarioAtual.getId().equals(motoristaId);

        if (motoristaConsultandoOutroMotorista) {
            throw new AcessoNegadoException("Você só pode ver as viagens atribuídas a você.");
        }

        return repository.findByMotorista_Id(motoristaId)
                .stream()
                .sorted(Comparator.comparing(
                        Agendamento::getDataHora,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    public String gerarLinkNotificacaoMotorista(Long id) {
        Agendamento agendamento = buscarPorId(id);

        if (agendamento.getMotorista() == null) {
            throw new RuntimeException("A viagem ainda não possui motorista atribuído.");
        }

        if (agendamento.getStatus() == null || agendamento.getStatus().name().equals("CRIADO")) {
            throw new RuntimeException("Confirme a viagem antes de notificar o motorista.");
        }

        String link = notificacaoService.gerarLinkWhatsAppMotorista(agendamento);

        historicoViagemService.registrar(
                agendamento,
                null,
                "MOTORISTA_NOTIFICADO",
                "Mensagem de WhatsApp gerada para o motorista "
                        + agendamento.getMotorista().getNome()
                        + "."
        );

        return link;
    }

    public List<HistoricoViagem> listarHistorico(Long agendamentoId) {
        buscarPorId(agendamentoId);

        return historicoViagemService.listarPorViagem(agendamentoId);
    }
}