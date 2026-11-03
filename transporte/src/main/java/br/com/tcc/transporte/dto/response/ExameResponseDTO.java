package br.com.tcc.transporte.dto.response;

import br.com.tcc.transporte.entity.Exame;
import lombok.Getter;

@Getter
public class ExameResponseDTO {

    private final Long id;
    private final String nome;
    private final Boolean exigeIsolamento;

    public ExameResponseDTO(Exame exame) {
        this.id = exame.getId();
        this.nome = exame.getNome();
        this.exigeIsolamento = exame.getExigeIsolamento();
    }
}