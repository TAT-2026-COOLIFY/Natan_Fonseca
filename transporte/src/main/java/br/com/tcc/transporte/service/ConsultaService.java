package br.com.tcc.transporte.service;

import br.com.tcc.transporte.dto.request.ConsultaRequestDTO;
import br.com.tcc.transporte.entity.Consulta;
import br.com.tcc.transporte.repository.ConsultaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ConsultaService {

    private final ConsultaRepository repository;
    private final ExclusaoComVinculoHelper exclusaoHelper;

    public ConsultaService(ConsultaRepository repository, ExclusaoComVinculoHelper exclusaoHelper) {
        this.repository = repository;
        this.exclusaoHelper = exclusaoHelper;
    }

    public Consulta salvar(ConsultaRequestDTO dto) {

        Consulta consulta = new Consulta();

        consulta.setNome(dto.getNome());
        consulta.setDescricao(dto.getDescricao());

        return repository.save(consulta);
    }

    public List<Consulta> listarTodos() {
        return repository.findAll();
    }

    public Consulta buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
    }

    public Consulta atualizar(Long id, ConsultaRequestDTO dto) {

        Consulta consulta = buscarPorId(id);

        consulta.setNome(dto.getNome());
        consulta.setDescricao(dto.getDescricao());

        return repository.save(consulta);
    }

    @Transactional
    public void excluir(Long id) {
        Consulta consulta = buscarPorId(id);

        exclusaoHelper.excluir(
                repository,
                consulta,
                "Esta consulta já está vinculada a uma viagem e não pode ser excluída."
        );
    }
}