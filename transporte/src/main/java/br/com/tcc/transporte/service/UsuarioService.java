package br.com.tcc.transporte.service;

import br.com.tcc.transporte.dto.request.UsuarioRequestDTO;
import br.com.tcc.transporte.entity.Usuario;
import br.com.tcc.transporte.enums.PerfilUsuario;
import br.com.tcc.transporte.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario cadastrar(UsuarioRequestDTO dto) {
        validarDados(dto);

        if (repository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Já existe um usuário cadastrado com este e-mail.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome().trim());
        usuario.setEmail(dto.getEmail().trim().toLowerCase());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        usuario.setPerfil(PerfilUsuario.valueOf(dto.getPerfil()));
        usuario.setTelefone(dto.getTelefone());
        usuario.setAtivo(true);

        return repository.save(usuario);
    }

    public Usuario atualizar(Long id, UsuarioRequestDTO dto) {
        Usuario usuario = buscarPorId(id);

        if (dto.getNome() == null || dto.getNome().isBlank()) {
            throw new RuntimeException("Nome é obrigatório.");
        }

        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new RuntimeException("E-mail é obrigatório.");
        }

        if (dto.getPerfil() == null || dto.getPerfil().isBlank()) {
            throw new RuntimeException("Perfil é obrigatório.");
        }

        usuario.setNome(dto.getNome().trim());
        usuario.setEmail(dto.getEmail().trim().toLowerCase());
        usuario.setPerfil(PerfilUsuario.valueOf(dto.getPerfil()));
        usuario.setTelefone(dto.getTelefone());

        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        if (dto.getAtivo() != null) {
            usuario.setAtivo(dto.getAtivo());
        }

        return repository.save(usuario);
    }

    public List<Usuario> listarTodos() {
        return repository.findAll();
    }

    public List<Usuario> listarMotoristas() {
        return repository.findByPerfil(PerfilUsuario.MOTORISTA);
    }

    public Usuario buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
    }

    public Usuario alterarStatus(Long id, Boolean ativo) {
        Usuario usuario = buscarPorId(id);

        usuario.setAtivo(ativo);

        return repository.save(usuario);
    }

    private void validarDados(UsuarioRequestDTO dto) {
        if (dto.getNome() == null || dto.getNome().isBlank()) {
            throw new RuntimeException("Nome é obrigatório.");
        }

        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new RuntimeException("E-mail é obrigatório.");
        }

        if (dto.getSenha() == null || dto.getSenha().isBlank()) {
            throw new RuntimeException("Senha é obrigatória.");
        }

        if (dto.getPerfil() == null || dto.getPerfil().isBlank()) {
            throw new RuntimeException("Perfil é obrigatório.");
        }

        try {
            PerfilUsuario.valueOf(dto.getPerfil());
        } catch (Exception e) {
            throw new RuntimeException("Perfil inválido. Use FUNCIONARIO ou MOTORISTA.");
        }
    }
}