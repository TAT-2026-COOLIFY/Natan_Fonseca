package br.com.tcc.transporte.controller;

import br.com.tcc.transporte.dto.request.LoginRequestDTO;
import br.com.tcc.transporte.dto.response.LoginResponseDTO;
import br.com.tcc.transporte.entity.Usuario;
import br.com.tcc.transporte.enums.PerfilUsuario;
import br.com.tcc.transporte.security.JwtService;
import br.com.tcc.transporte.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;
    private final JwtService jwtService;

    public AuthController(AuthService service, JwtService jwtService) {
        this.service = service;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO dto) {

        Usuario usuario = service.autenticar(dto.getEmail(), dto.getSenha());

        Long motoristaId = null;

        if (usuario.getPerfil() == PerfilUsuario.MOTORISTA) {
            motoristaId = usuario.getId();
        }

        String token = jwtService.gerarToken(usuario);

        LoginResponseDTO response = new LoginResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().name(),
                motoristaId,
                token
        );

        return ResponseEntity.ok(response);
    }
}