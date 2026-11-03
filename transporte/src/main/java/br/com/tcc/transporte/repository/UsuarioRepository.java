package br.com.tcc.transporte.repository;

import br.com.tcc.transporte.entity.Usuario;
import br.com.tcc.transporte.enums.PerfilUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    List<Usuario> findByPerfil(PerfilUsuario perfil);

    boolean existsByEmail(String email);
}