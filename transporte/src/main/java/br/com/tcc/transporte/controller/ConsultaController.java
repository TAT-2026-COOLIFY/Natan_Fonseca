package br.com.tcc.transporte.controller;

import br.com.tcc.transporte.dto.request.ConsultaRequestDTO;
import br.com.tcc.transporte.dto.response.ConsultaResponseDTO;
import br.com.tcc.transporte.entity.Consulta;
import br.com.tcc.transporte.service.ConsultaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/consultas")
public class ConsultaController {

    private final ConsultaService service;

    public ConsultaController(ConsultaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ConsultaResponseDTO> criar(
            @Valid @RequestBody ConsultaRequestDTO dto) {

        Consulta consulta = service.salvar(dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ConsultaResponseDTO(consulta));
    }

    @GetMapping
    public ResponseEntity<List<ConsultaResponseDTO>> listar() {

        List<ConsultaResponseDTO> lista = service.listarTodos()
                .stream()
                .map(ConsultaResponseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConsultaResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ConsultaRequestDTO dto) {

        Consulta consulta = service.atualizar(id, dto);

        return ResponseEntity.ok(new ConsultaResponseDTO(consulta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}