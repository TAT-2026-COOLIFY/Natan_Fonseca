package br.com.tcc.transporte.dto.response;

import br.com.tcc.transporte.entity.Cidade;
import lombok.Getter;

@Getter
public class CidadeResponseDTO {

    private final Long id;
    private final String nome;
    private final String estado;
    private final Double latitude;
    private final Double longitude;

    public CidadeResponseDTO(Cidade cidade) {
        this.id = cidade.getId();
        this.nome = cidade.getNome();
        this.estado = cidade.getEstado();
        this.latitude = cidade.getLatitude();
        this.longitude = cidade.getLongitude();
    }
}