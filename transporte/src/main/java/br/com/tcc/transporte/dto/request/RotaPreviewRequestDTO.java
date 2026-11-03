package br.com.tcc.transporte.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RotaPreviewRequestDTO {

    private Double origemLatitude;
    private Double origemLongitude;

    private Double destinoLatitude;
    private Double destinoLongitude;
}