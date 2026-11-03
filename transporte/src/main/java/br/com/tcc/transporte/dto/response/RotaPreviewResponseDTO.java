package br.com.tcc.transporte.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RotaPreviewResponseDTO {

    private Double distanciaKm;
    private Double duracaoMinutos;
    private String duracaoFormatada;
}