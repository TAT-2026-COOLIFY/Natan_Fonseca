package br.com.tcc.transporte.service;

import br.com.tcc.transporte.dto.request.VeiculoRequestDTO;
import br.com.tcc.transporte.entity.Veiculo;
import br.com.tcc.transporte.exception.VeiculoDuplicadoException;
import br.com.tcc.transporte.repository.VeiculoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VeiculoService {

    private final VeiculoRepository repository;
    private final ExclusaoComVinculoHelper exclusaoHelper;

    public VeiculoService(VeiculoRepository repository, ExclusaoComVinculoHelper exclusaoHelper) {
        this.repository = repository;
        this.exclusaoHelper = exclusaoHelper;
    }

    public Veiculo salvar(VeiculoRequestDTO dto) {

        repository.findByPlaca(dto.getPlaca())
                .ifPresent(veiculo -> {
                    throw new VeiculoDuplicadoException(dto.getPlaca());
                });

        Veiculo veiculo = new Veiculo();

        veiculo.setPlaca(dto.getPlaca());
        veiculo.setModelo(dto.getModelo());
        veiculo.setAno(dto.getAno());
        veiculo.setCapacidade(dto.getCapacidade());
        veiculo.setIsolado(Boolean.TRUE.equals(dto.getIsolado()));

        return repository.save(veiculo);
    }

    public List<Veiculo> listarTodos() {
        return repository.findAll();
    }

    public Veiculo buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Veículo não encontrado"));
    }

    public Veiculo atualizar(Long id, VeiculoRequestDTO dto) {

        Veiculo veiculo = buscarPorId(id);

        repository.findByPlaca(dto.getPlaca())
                .filter(outro -> !outro.getId().equals(id))
                .ifPresent(outro -> {
                    throw new VeiculoDuplicadoException(dto.getPlaca());
                });

        veiculo.setPlaca(dto.getPlaca());
        veiculo.setModelo(dto.getModelo());
        veiculo.setAno(dto.getAno());
        veiculo.setCapacidade(dto.getCapacidade());
        veiculo.setIsolado(Boolean.TRUE.equals(dto.getIsolado()));

        return repository.save(veiculo);
    }

    @Transactional
    public void excluir(Long id) {
        Veiculo veiculo = buscarPorId(id);

        exclusaoHelper.excluir(
                repository,
                veiculo,
                "Este veículo já está vinculado a uma viagem e não pode ser excluído."
        );
    }
}