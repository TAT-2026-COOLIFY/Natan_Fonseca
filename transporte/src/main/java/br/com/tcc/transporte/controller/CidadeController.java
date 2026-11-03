package br.com.tcc.transporte.controller;

import br.com.tcc.transporte.dto.request.CidadeRequestDTO;
import br.com.tcc.transporte.dto.response.CidadeResponseDTO;
import br.com.tcc.transporte.entity.Cidade;
import br.com.tcc.transporte.service.CidadeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/cidades")
public class CidadeController {

    private final CidadeService service;

    public CidadeController(CidadeService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CidadeResponseDTO> criar(
            @Valid @RequestBody CidadeRequestDTO dto) {

        Cidade cidade = service.salvar(dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new CidadeResponseDTO(cidade));
    }

    @PostMapping("/google")
    public ResponseEntity<CidadeResponseDTO> salvarOuBuscarGoogle(
            @Valid @RequestBody CidadeRequestDTO dto) {

        Cidade cidade = service.salvarOuBuscarGoogle(dto);

        return ResponseEntity.ok(new CidadeResponseDTO(cidade));
    }


    @GetMapping
    public ResponseEntity<List<CidadeResponseDTO>> listar() {

        List<CidadeResponseDTO> lista = service.listarTodos()
                .stream()
                .map(CidadeResponseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CidadeResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody CidadeRequestDTO dto) {

        Cidade cidade = service.atualizar(id, dto);

        return ResponseEntity.ok(new CidadeResponseDTO(cidade));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

}