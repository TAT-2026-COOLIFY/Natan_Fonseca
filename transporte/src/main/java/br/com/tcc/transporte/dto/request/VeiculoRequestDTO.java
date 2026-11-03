package br.com.tcc.transporte.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VeiculoRequestDTO {

    private String modelo;

    private String placa;

    private String ano;

    private Integer capacidade;

    private Boolean isolado;
}