package br.com.tcc.transporte.exception;

public class PacienteNotFoundException extends RuntimeException {

    public PacienteNotFoundException(Long id) {
        super("Paciente com ID " + id + " não encontrado");
    }
}