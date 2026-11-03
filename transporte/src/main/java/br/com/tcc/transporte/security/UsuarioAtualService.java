package br.com.tcc.transporte.security;

import br.com.tcc.transporte.entity.Usuario;
import br.com.tcc.transporte.exception.AcessoNegadoException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

// pega o usuario logado a partir do token, pros services nao terem que
// confiar em um usuarioId que o front mandasse
@Component
public class UsuarioAtualService {

    public Usuario getUsuarioAtual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof Usuario usuario)) {
            throw new AcessoNegadoException("Usuário não autenticado.");
        }

        return usuario;
    }
}
