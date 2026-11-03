package br.com.tcc.transporte.controller;

import br.com.tcc.transporte.dto.request.VeiculoRequestDTO;
import br.com.tcc.transporte.dto.response.VeiculoResponseDTO;
import br.com.tcc.transporte.entity.Veiculo;
import br.com.tcc.transporte.service.VeiculoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/veiculos")
public class VeiculoController {

    private final VeiculoService service;

    public VeiculoController(VeiculoService service) {
        this.service = service;
    }

    @PostMapping
    public VeiculoResponseDTO criar(@Valid @RequestBody VeiculoRequestDTO dto) {
        Veiculo veiculo = service.salvar(dto);
        return new VeiculoResponseDTO(veiculo);
    }

    @GetMapping
    public List<VeiculoResponseDTO> listar() {
        return service.listarTodos()
                .stream()
                .map(VeiculoResponseDTO::new)
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}")
    public VeiculoResponseDTO atualizar(@PathVariable Long id,
                                         @Valid @RequestBody VeiculoRequestDTO dto) {
        Veiculo veiculo = service.atualizar(id, dto);
        return new VeiculoResponseDTO(veiculo);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}