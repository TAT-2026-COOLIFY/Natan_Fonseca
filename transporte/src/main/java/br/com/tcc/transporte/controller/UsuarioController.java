package br.com.tcc.transporte.controller;

import br.com.tcc.transporte.dto.request.UsuarioRequestDTO;
import br.com.tcc.transporte.dto.response.UsuarioResponseDTO;
import br.com.tcc.transporte.entity.Usuario;
import br.com.tcc.transporte.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> cadastrar(@RequestBody UsuarioRequestDTO dto) {
        Usuario usuario = service.cadastrar(dto);

        return ResponseEntity.ok(new UsuarioResponseDTO(usuario));
    }

    @GetMapping
    public List<UsuarioResponseDTO> listarTodos() {
        return service.listarTodos()
                .stream()
                .map(UsuarioResponseDTO::new)
                .toList();
    }

    @GetMapping("/motoristas")
    public List<UsuarioResponseDTO> listarMotoristas() {
        return service.listarMotoristas()
                .stream()
                .map(UsuarioResponseDTO::new)
                .toList();
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody UsuarioRequestDTO dto
    ) {
        Usuario usuario = service.atualizar(id, dto);

        return ResponseEntity.ok(new UsuarioResponseDTO(usuario));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UsuarioResponseDTO> alterarStatus(
            @PathVariable Long id,
            @RequestParam Boolean ativo
    ) {
        Usuario usuario = service.alterarStatus(id, ativo);

        return ResponseEntity.ok(new UsuarioResponseDTO(usuario));
    }
}