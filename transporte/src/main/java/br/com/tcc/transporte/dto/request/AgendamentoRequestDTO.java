package br.com.tcc.transporte.dto.request;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class AgendamentoRequestDTO {

    private Long cidadeOrigemId;

    private Long cidadeDestinoId;

    private LocalDateTime dataHora;

    // rota escolhida pelo usuario entre as opcoes mostradas no mapa;
    // se vier nula, o backend calcula a rota padrao (OSRM)
    private Double distanciaKm;

    private Double duracaoMinutos;

}