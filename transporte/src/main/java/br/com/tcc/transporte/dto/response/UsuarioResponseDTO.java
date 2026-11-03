package br.com.tcc.transporte.dto.response;

import br.com.tcc.transporte.entity.Usuario;
import lombok.Getter;

@Getter
public class UsuarioResponseDTO {

    private final Long id;
    private final String nome;
    private final String email;
    private final String perfil;
    private final String telefone;
    private final Boolean ativo;

    public UsuarioResponseDTO(Usuario usuario) {
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.email = usuario.getEmail();
        this.perfil = usuario.getPerfil() != null ? usuario.getPerfil().name() : null;
        this.telefone = usuario.getTelefone();
        this.ativo = usuario.getAtivo();
    }
}