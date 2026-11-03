package br.com.tcc.transporte.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class CidadeRequestDTO {

    @NotBlank(message = "Nome da cidade é obrigatório")
    private String nome;

    @NotBlank(message = "Estado é obrigatório")
    private String estado;

    private Double latitude;

    private Double longitude;
}