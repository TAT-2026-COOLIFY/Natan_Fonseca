package br.com.tcc.transporte.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConfirmarAgendamentoDTO {

    private Long veiculoId;

    private Long motoristaId;
}