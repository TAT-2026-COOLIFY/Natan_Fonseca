package br.com.tcc.transporte.dto.response;

import br.com.tcc.transporte.entity.Agendamento;
import br.com.tcc.transporte.entity.PassageiroViagem;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class HistoricoPacienteResponseDTO {

    private final Long viagemId;
    private final String pacienteNome;

    private final String cidadeOrigem;
    private final String cidadeDestino;

    private final LocalDateTime dataHoraViagem;
    private final String status;

    private final String hospital;
    private final String consultaNome;
    private final String exameNome;
    private final LocalDateTime horarioAtendimento;

    private final String motoristaNome;
    private final String veiculo;

    public HistoricoPacienteResponseDTO(PassageiroViagem passageiro) {
        Agendamento agendamento = passageiro.getAgendamento();

        this.viagemId = agendamento != null ? agendamento.getId() : null;

        this.pacienteNome = passageiro.getPaciente() != null
                ? passageiro.getPaciente().getNome()
                : "-";

        if (agendamento != null && agendamento.getCidadeOrigem() != null) {
            this.cidadeOrigem = agendamento.getCidadeOrigem().getNome()
                    + " / "
                    + agendamento.getCidadeOrigem().getEstado();
        } else {
            this.cidadeOrigem = "-";
        }

        if (agendamento != null && agendamento.getCidadeDestino() != null) {
            this.cidadeDestino = agendamento.getCidadeDestino().getNome()
                    + " / "
                    + agendamento.getCidadeDestino().getEstado();
        } else {
            this.cidadeDestino = "-";
        }

        this.dataHoraViagem = agendamento != null ? agendamento.getDataHora() : null;

        this.status = agendamento != null && agendamento.getStatus() != null
                ? agendamento.getStatus().name()
                : "-";

        this.hospital = passageiro.getHospital() != null
                ? passageiro.getHospital()
                : "-";

        this.consultaNome = passageiro.getConsulta() != null
                ? passageiro.getConsulta().getNome()
                : "-";

        this.exameNome = passageiro.getExame() != null
                ? passageiro.getExame().getNome()
                : "-";

        this.horarioAtendimento = passageiro.getHorarioAtendimento();

        if (agendamento != null && agendamento.getMotorista() != null) {
            this.motoristaNome = agendamento.getMotorista().getNome();
        } else {
            this.motoristaNome = "-";
        }

        if (agendamento != null && agendamento.getVeiculo() != null) {
            this.veiculo = agendamento.getVeiculo().getModelo()
                    + " - "
                    + agendamento.getVeiculo().getPlaca();
        } else {
            this.veiculo = "-";
        }
    }
}