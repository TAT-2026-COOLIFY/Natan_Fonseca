package br.com.tcc.transporte.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.tcc.transporte.entity.Usuario;
import br.com.tcc.transporte.repository.UsuarioRepository;

@Service
public class AuthService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario autenticar(String email, String senha) {

        Usuario usuario = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (passwordEncoder.matches(senha, usuario.getSenha())) {
            return usuario;
        }

       
        if (senha.equals(usuario.getSenha())) {
            usuario.setSenha(passwordEncoder.encode(senha));
            repository.save(usuario);
            return usuario;
        }

        throw new RuntimeException("Senha inválida");
    }
}