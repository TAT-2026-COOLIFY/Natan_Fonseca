package br.com.tcc.transporte.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsuarioRequestDTO {

    private String nome;
    private String email;
    private String senha;
    private String perfil;
    private String telefone;
    private Boolean ativo;
}