package br.com.tcc.transporte.dto.response;

import br.com.tcc.transporte.entity.Consulta;
import lombok.Getter;

@Getter
public class ConsultaResponseDTO {

    private final Long id;
    private final String nome;
    private final String descricao;

    public ConsultaResponseDTO(Consulta consulta) {
        this.id = consulta.getId();
        this.nome = consulta.getNome();
        this.descricao = consulta.getDescricao();
    }
}