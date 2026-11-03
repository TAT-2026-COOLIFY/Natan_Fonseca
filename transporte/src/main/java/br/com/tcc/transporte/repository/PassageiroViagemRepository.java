package br.com.tcc.transporte.repository;

import br.com.tcc.transporte.entity.Agendamento;
import br.com.tcc.transporte.entity.PassageiroViagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PassageiroViagemRepository extends JpaRepository<PassageiroViagem, Long> {

    List<PassageiroViagem> findByAgendamento_Id(Long agendamentoId);

    List<PassageiroViagem> findByPaciente_Id(Long pacienteId);

    boolean existsByAgendamento_IdAndPaciente_Id(Long agendamentoId, Long pacienteId);

    long countByAgendamento_Id(Long agendamentoId);

    Optional<PassageiroViagem> findByAgendamento_IdAndPaciente_Id(
            Long agendamentoId,
            Long pacienteId
    );

    void deleteByAgendamento_Id(Long agendamentoId);

    @Query("""
           SELECT p
           FROM PassageiroViagem p
           JOIN FETCH p.paciente
           WHERE p.agendamento.id = :agendamentoId
           """)
    List<PassageiroViagem> buscarPassageirosComPaciente(Long agendamentoId);

    @Query("""
           SELECT DISTINCT p.agendamento
           FROM PassageiroViagem p
           WHERE p.paciente.id = :pacienteId
           """)
    List<Agendamento> buscarAgendamentosPorPaciente(Long pacienteId);

    @Query("""
           SELECT p
           FROM PassageiroViagem p
           JOIN FETCH p.paciente
           JOIN FETCH p.agendamento a
           LEFT JOIN FETCH a.cidadeOrigem
           LEFT JOIN FETCH a.cidadeDestino
           LEFT JOIN FETCH a.motorista
           LEFT JOIN FETCH a.veiculo
           LEFT JOIN FETCH p.consulta
           LEFT JOIN FETCH p.exame
           WHERE p.paciente.id = :pacienteId
           ORDER BY a.dataHora DESC
           """)
    List<PassageiroViagem> buscarHistoricoCompletoPorPaciente(@Param("pacienteId") Long pacienteId);
}