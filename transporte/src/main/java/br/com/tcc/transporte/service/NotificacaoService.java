package br.com.tcc.transporte.service;

import br.com.tcc.transporte.entity.Agendamento;
import br.com.tcc.transporte.entity.PassageiroViagem;
import br.com.tcc.transporte.entity.Usuario;
import br.com.tcc.transporte.repository.PassageiroViagemRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class NotificacaoService {

    private final PassageiroViagemRepository passageiroRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public NotificacaoService(PassageiroViagemRepository passageiroRepository) {
        this.passageiroRepository = passageiroRepository;
    }

    public String gerarLinkWhatsAppMotorista(Agendamento agendamento) {
        Usuario motorista = agendamento.getMotorista();

        if (motorista == null) {
            throw new RuntimeException("Viagem não possui motorista atribuído.");
        }

        if (motorista.getTelefone() == null || motorista.getTelefone().isBlank()) {
            throw new RuntimeException("Motorista não possui telefone cadastrado.");
        }

        String telefone = normalizarTelefone(motorista.getTelefone());
        String mensagem = montarMensagem(agendamento);
        String mensagemCodificada = URLEncoder.encode(mensagem, StandardCharsets.UTF_8);

        return "https://wa.me/" + telefone + "?text=" + mensagemCodificada;
    }

    private String montarMensagem(Agendamento agendamento) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

        List<PassageiroViagem> passageiros =
                passageiroRepository.findByAgendamento_Id(agendamento.getId());

        StringBuilder texto = new StringBuilder();

        texto.append("Olá, ")
                .append(agendamento.getMotorista().getNome())
                .append(".\n\n");

        texto.append("Uma nova viagem sanitária foi atribuída para você.\n\n");

        texto.append("Data: ")
                .append(agendamento.getDataHora().format(formatter))
                .append("\n");

        texto.append("Origem: ")
                .append(agendamento.getCidadeOrigem().getNome())
                .append(" / ")
                .append(agendamento.getCidadeOrigem().getEstado())
                .append("\n");

        texto.append("Destino: ")
                .append(agendamento.getCidadeDestino().getNome())
                .append(" / ")
                .append(agendamento.getCidadeDestino().getEstado())
                .append("\n");

        if (agendamento.getVeiculo() != null) {
            texto.append("Veículo: ")
                    .append(agendamento.getVeiculo().getModelo())
                    .append(" - ")
                    .append(agendamento.getVeiculo().getPlaca())
                    .append("\n");
        }

        texto.append("\nPassageiros:\n");

        if (passageiros.isEmpty()) {
            texto.append("- Nenhum passageiro adicionado ainda\n");
        } else {
            for (PassageiroViagem passageiro : passageiros) {
                texto.append("- ")
                        .append(passageiro.getPaciente().getNome())
                        .append("\n");
            }
        }

        texto.append("\nAcesse a viagem:\n")
                .append(frontendUrl)
                .append("/viagens/")
                .append(agendamento.getId());

        return texto.toString();
    }

    private String normalizarTelefone(String telefone) {
        String numero = telefone.replaceAll("\\D", "");

        if (numero.length() == 11) {
            return "55" + numero;
        }

        return numero;
    }
}