package br.com.tcc.transporte.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class PassageiroRequestDTO {

    private Long pacienteId;

    private String hospital;

    private Long consultaId;

    private Long exameId;

    private LocalDateTime horarioAtendimento;

    private String observacao;

}