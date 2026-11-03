package br.com.tcc.transporte.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class ExameRequestDTO {

    @NotBlank(message = "Nome do exame é obrigatório")
    private String nome;

    @NotNull(message = "Informar se exige isolamento")
    private Boolean exigeIsolamento;
}