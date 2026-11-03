package br.com.tcc.transporte.service;

import br.com.tcc.transporte.dto.request.PacienteRequestDTO;
import br.com.tcc.transporte.entity.Paciente;
import br.com.tcc.transporte.exception.PacienteNotFoundException;
import br.com.tcc.transporte.repository.PacienteRepository;
import br.com.tcc.transporte.util.CpfValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PacienteService {

    private final PacienteRepository repository;
    private final ExclusaoComVinculoHelper exclusaoHelper;

    public PacienteService(PacienteRepository repository, ExclusaoComVinculoHelper exclusaoHelper) {
        this.repository = repository;
        this.exclusaoHelper = exclusaoHelper;
    }

    public Paciente salvar(PacienteRequestDTO dto) {

        String cpf = validarCpf(dto.getCpf());

        repository.findByCpf(cpf)
                .ifPresent(existente -> {
                    throw new RuntimeException("Já existe um paciente cadastrado com este CPF");
                });

        Paciente paciente = new Paciente();

        paciente.setNome(dto.getNome());
        paciente.setCpf(cpf);
        paciente.setTelefone(dto.getTelefone());
        paciente.setCidade(dto.getCidade());

        return repository.save(paciente);
    }

    private String validarCpf(String cpfInformado) {
        if (!CpfValidator.isValido(cpfInformado)) {
            throw new RuntimeException("CPF inválido. Verifique o número informado.");
        }

        return cpfInformado.replaceAll("\\D", "");
    }

    public List<Paciente> listarTodos() {
        return repository.findAll();
    }

    public Paciente buscarPorId(Long id) {

        return repository.findById(id)
                .orElseThrow(() -> new PacienteNotFoundException(id));
    }

    public Paciente atualizar(Long id, PacienteRequestDTO dto) {

        Paciente paciente = buscarPorId(id);

        String cpf = validarCpf(dto.getCpf());

        repository.findByCpf(cpf)
                .filter(outro -> !outro.getId().equals(id))
                .ifPresent(outro -> {
                    throw new RuntimeException("Já existe um paciente cadastrado com este CPF");
                });

        paciente.setNome(dto.getNome());
        paciente.setCpf(cpf);
        paciente.setTelefone(dto.getTelefone());
        paciente.setCidade(dto.getCidade());

        return repository.save(paciente);
    }

    @Transactional
    public void deletar(Long id) {

        Paciente paciente = buscarPorId(id);

        exclusaoHelper.excluir(
                repository,
                paciente,
                "Este paciente já está vinculado a uma viagem e não pode ser excluído."
        );
    }
}