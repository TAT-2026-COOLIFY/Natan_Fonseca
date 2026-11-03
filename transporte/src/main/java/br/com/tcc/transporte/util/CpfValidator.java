package br.com.tcc.transporte.util;

// valida CPF (formato + digito verificador) antes de salvar o paciente
public final class CpfValidator {

    private CpfValidator() {
    }

    public static boolean isValido(String cpf) {
        if (cpf == null) {
            return false;
        }

        String numeros = cpf.replaceAll("\\D", "");

        if (numeros.length() != 11) {
            return false;
        }

        if (numeros.chars().distinct().count() == 1) {
            return false;
        }

        int primeiroDigito = calcularDigitoVerificador(numeros.substring(0, 9), 10);
        int segundoDigito = calcularDigitoVerificador(numeros.substring(0, 9) + primeiroDigito, 11);

        return numeros.equals(numeros.substring(0, 9) + primeiroDigito + segundoDigito);
    }

    private static int calcularDigitoVerificador(String base, int pesoInicial) {
        int soma = 0;
        int peso = pesoInicial;

        for (char digito : base.toCharArray()) {
            soma += Character.getNumericValue(digito) * peso;
            peso--;
        }

        int resto = soma % 11;

        return resto < 2 ? 0 : 11 - resto;
    }
}
