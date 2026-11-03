package br.com.tcc.transporte.service;

import br.com.tcc.transporte.entity.Agendamento;
import br.com.tcc.transporte.entity.HistoricoViagem;
import br.com.tcc.transporte.entity.Usuario;
import br.com.tcc.transporte.repository.HistoricoViagemRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HistoricoViagemService {

    private final HistoricoViagemRepository repository;

    public HistoricoViagemService(HistoricoViagemRepository repository) {
        this.repository = repository;
    }

    public void registrar(
            Agendamento agendamento,
            Usuario usuario,
            String acao,
            String descricao
    ) {
        HistoricoViagem historico = new HistoricoViagem();

        historico.setAgendamento(agendamento);
        historico.setUsuario(usuario);
        historico.setAcao(acao);
        historico.setDescricao(descricao);
        historico.setDataHora(LocalDateTime.now());

        repository.save(historico);
    }

    public List<HistoricoViagem> listarPorViagem(Long agendamentoId) {
        return repository.findByAgendamento_IdOrderByDataHoraDesc(agendamentoId);
    }

    public void excluirPorViagem(Long agendamentoId) {
        repository.deleteByAgendamento_Id(agendamentoId);
    }
}