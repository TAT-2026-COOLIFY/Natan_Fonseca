package br.com.tcc.transporte.repository;

import br.com.tcc.transporte.entity.HistoricoViagem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoricoViagemRepository extends JpaRepository<HistoricoViagem, Long> {

    List<HistoricoViagem> findByAgendamento_IdOrderByDataHoraDesc(Long agendamentoId);

    void deleteByAgendamento_Id(Long agendamentoId);
}