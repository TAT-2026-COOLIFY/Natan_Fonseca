package br.com.tcc.transporte.controller;

import br.com.tcc.transporte.dto.request.PacienteRequestDTO;
import br.com.tcc.transporte.dto.response.PacienteResponseDTO;
import br.com.tcc.transporte.entity.Paciente;
import br.com.tcc.transporte.service.PacienteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pacientes")
public class PacienteController {

    private final PacienteService service;

    public PacienteController(PacienteService service) {
        this.service = service;
    }

    @PostMapping
    public PacienteResponseDTO criar(@Valid @RequestBody PacienteRequestDTO dto) {
        Paciente paciente = service.salvar(dto);
        return new PacienteResponseDTO(paciente);
    }

    @GetMapping
    public List<PacienteResponseDTO> listar() {
        return service.listarTodos()
                .stream()
                .map(PacienteResponseDTO::new)
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}")
    public PacienteResponseDTO atualizar(@PathVariable Long id,
                                         @Valid @RequestBody PacienteRequestDTO dto) {
        return new PacienteResponseDTO(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}