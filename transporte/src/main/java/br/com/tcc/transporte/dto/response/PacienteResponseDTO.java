package br.com.tcc.transporte.dto.response;

import br.com.tcc.transporte.entity.Paciente;
import lombok.Getter;

@Getter
public class PacienteResponseDTO {

    private final Long id;
    private final String nome;
    private final String cpf;
    private final String telefone;
    private final String cidade;

    public PacienteResponseDTO(Paciente paciente) {
        this.id = paciente.getId();
        this.nome = paciente.getNome();
        this.cpf = paciente.getCpf();
        this.telefone = paciente.getTelefone();
        this.cidade = paciente.getCidade();
    }
}
