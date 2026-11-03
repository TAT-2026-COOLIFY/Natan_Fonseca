package br.com.tcc.transporte.dto.response;

import br.com.tcc.transporte.entity.Agendamento;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class AgendamentoResponseDTO {

    private Long id;

    private CidadeResponseDTO cidadeOrigem;
    private CidadeResponseDTO cidadeDestino;

    private LocalDateTime dataHora;

    private Double distanciaKm;
    private Double duracaoMinutos;

    private String status;

    private VeiculoResponseDTO veiculo;

    private Long motoristaId;
    private String motoristaNome;

    public AgendamentoResponseDTO(Agendamento agendamento) {
        this.id = agendamento.getId();

        if (agendamento.getCidadeOrigem() != null) {
            this.cidadeOrigem = new CidadeResponseDTO(agendamento.getCidadeOrigem());
        }

        if (agendamento.getCidadeDestino() != null) {
            this.cidadeDestino = new CidadeResponseDTO(agendamento.getCidadeDestino());
        }

        this.dataHora = agendamento.getDataHora();
        this.distanciaKm = agendamento.getDistanciaKm();
        this.duracaoMinutos = agendamento.getDuracaoMinutos();

        if (agendamento.getStatus() != null) {
            this.status = agendamento.getStatus().name();
        }

        if (agendamento.getVeiculo() != null) {
            this.veiculo = new VeiculoResponseDTO(agendamento.getVeiculo());
        }

        if (agendamento.getMotorista() != null) {
            this.motoristaId = agendamento.getMotorista().getId();
            this.motoristaNome = agendamento.getMotorista().getNome();
        }
    }
}