package br.com.tcc.transporte.controller;

import br.com.tcc.transporte.dto.request.ExameRequestDTO;
import br.com.tcc.transporte.dto.response.ExameResponseDTO;
import br.com.tcc.transporte.entity.Exame;
import br.com.tcc.transporte.service.ExameService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/exames")
public class ExameController {

    private final ExameService service;

    public ExameController(ExameService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ExameResponseDTO> criar(
            @Valid @RequestBody ExameRequestDTO dto) {

        Exame exame = service.salvar(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ExameResponseDTO(exame));
    }

    @GetMapping
    public ResponseEntity<List<ExameResponseDTO>> listar() {

        List<ExameResponseDTO> lista = service.listarTodos()
                .stream()
                .map(ExameResponseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExameResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ExameRequestDTO dto) {

        Exame exame = service.atualizar(id, dto);

        return ResponseEntity.ok(new ExameResponseDTO(exame));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}