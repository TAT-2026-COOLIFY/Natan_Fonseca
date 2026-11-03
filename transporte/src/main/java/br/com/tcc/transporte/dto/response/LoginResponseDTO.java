package br.com.tcc.transporte.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponseDTO {

    private final Long id;
    private final String nome;
    private final String email;
    private final String perfil;
    private final Long motoristaId;
    private final String token;
}
