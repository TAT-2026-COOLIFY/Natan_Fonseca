package br.com.tcc.transporte.service;

import br.com.tcc.transporte.dto.request.ExameRequestDTO;
import br.com.tcc.transporte.entity.Exame;
import br.com.tcc.transporte.repository.ExameRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExameService {

    private final ExameRepository repository;
    private final ExclusaoComVinculoHelper exclusaoHelper;

    public ExameService(ExameRepository repository, ExclusaoComVinculoHelper exclusaoHelper) {
        this.repository = repository;
        this.exclusaoHelper = exclusaoHelper;
    }

    public Exame salvar(ExameRequestDTO dto) {

        // nao deixa cadastrar exame com nome repetido
        repository.findByNome(dto.getNome())
                .ifPresent(e -> {
                    throw new RuntimeException("Já existe exame com esse nome");
                });

        Exame exame = new Exame();
        exame.setNome(dto.getNome());
        exame.setExigeIsolamento(dto.getExigeIsolamento());

        return repository.save(exame);
    }

    public List<Exame> listarTodos() {
        return repository.findAll();
    }

    public Exame buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exame não encontrado"));
    }

    public Exame atualizar(Long id, ExameRequestDTO dto) {

        Exame exame = buscarPorId(id);

        repository.findByNome(dto.getNome())
                .filter(outro -> !outro.getId().equals(id))
                .ifPresent(outro -> {
                    throw new RuntimeException("Já existe exame com esse nome");
                });

        exame.setNome(dto.getNome());
        exame.setExigeIsolamento(dto.getExigeIsolamento());

        return repository.save(exame);
    }

    @Transactional
    public void excluir(Long id) {
        Exame exame = buscarPorId(id);

        exclusaoHelper.excluir(
                repository,
                exame,
                "Este exame já está vinculado a uma viagem e não pode ser excluído."
        );
    }
}