package br.com.tcc.transporte.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ConsultaRequestDTO {

    @NotBlank(message = "Nome da consulta é obrigatório")
    private String nome;

    private String descricao;
}