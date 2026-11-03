package br.com.tcc.transporte.dto.response;

import br.com.tcc.transporte.entity.Veiculo;
import lombok.Getter;

@Getter
public class VeiculoResponseDTO {

    private final Long id;
    private final String placa;
    private final String modelo;
    private final String ano;
    private final Integer capacidade;
    private final Boolean isolado;

    public VeiculoResponseDTO(Veiculo veiculo) {
        this.id = veiculo.getId();
        this.placa = veiculo.getPlaca();
        this.modelo = veiculo.getModelo();
        this.ano = veiculo.getAno();
        this.capacidade = veiculo.getCapacidade();
        this.isolado = veiculo.getIsolado();
    }
}