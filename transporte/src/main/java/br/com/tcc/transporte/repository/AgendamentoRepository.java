package br.com.tcc.transporte.repository;

import br.com.tcc.transporte.entity.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    List<Agendamento> findAllByOrderByIdDesc();

    @Query("SELECT COUNT(a) FROM Agendamento a")
    Long contarViagens();

    @Query("SELECT SUM(a.distanciaKm) FROM Agendamento a")
    Double somarKm();

    List<Agendamento> findByDataHoraBetween(
            LocalDateTime inicio,
            LocalDateTime fim
    );

    List<Agendamento> findByMotorista_Id(Long motoristaId);

    List<Agendamento> findByVeiculo_Id(Long veiculoId);
}