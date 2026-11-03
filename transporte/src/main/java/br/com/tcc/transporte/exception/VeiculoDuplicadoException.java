package br.com.tcc.transporte.exception;

public class VeiculoDuplicadoException extends RuntimeException {

    public VeiculoDuplicadoException(String placa) {
        super("Já existe veículo com a placa " + placa);
    }
}