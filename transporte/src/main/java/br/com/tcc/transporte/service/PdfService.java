package br.com.tcc.transporte.service;

import br.com.tcc.transporte.entity.Agendamento;
import br.com.tcc.transporte.entity.Cidade;
import br.com.tcc.transporte.entity.PassageiroViagem;
import br.com.tcc.transporte.repository.PassageiroViagemRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Service
public class PdfService {

    private final PassageiroViagemRepository passageiroRepository;

    public PdfService(PassageiroViagemRepository passageiroRepository) {
        this.passageiroRepository = passageiroRepository;
    }

    @Transactional(readOnly = true)
    public byte[] gerarRelatorioViagem(Agendamento agendamento) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();

            Document document = new Document(PageSize.A4, 36, 36, 34, 34);
            PdfWriter.getInstance(document, out);

            document.open();

            Font fonteTitulo = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(15, 76, 129));
            Font fonteSubtitulo = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(15, 23, 42));
            Font fonteSecao = new Font(Font.HELVETICA, 11, Font.BOLD, Color.WHITE);
            Font fonteNormal = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(30, 41, 59));
            Font fonteNegrito = new Font(Font.HELVETICA, 9, Font.BOLD, new Color(15, 23, 42));
            Font fontePequena = new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(71, 85, 105));
            Font fonteRodape = new Font(Font.HELVETICA, 8, Font.ITALIC, new Color(100, 116, 139));

            adicionarCabecalho(document, fonteTitulo, fonteNormal);
            adicionarLinha(document);

            document.add(new Paragraph("RELATÓRIO DE VIAGEM SANITÁRIA", fonteSubtitulo));
            document.add(new Paragraph("Código da viagem: #" + agendamento.getId(), fonteNormal));
            document.add(new Paragraph("Relatório gerado em: " + formatarDataHora(LocalDateTime.now()), fonteNormal));
            document.add(espaco(10));

            adicionarDadosDaViagem(document, agendamento, fonteSecao, fonteNormal, fonteNegrito);
            adicionarMotoristaVeiculo(document, agendamento, fonteSecao, fonteNormal, fonteNegrito);
            adicionarPassageiros(document, agendamento, fonteSecao, fonteNormal, fontePequena);
            adicionarAssinaturas(document, fonteNormal);
            adicionarRodape(document, fonteRodape);

            document.close();

            return out.toByteArray();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao gerar PDF");
        }
    }

    private void adicionarCabecalho(Document document, Font fonteTitulo, Font fonteNormal) throws Exception {
        Paragraph sigts = new Paragraph("SIGTS", fonteTitulo);
        sigts.setSpacingAfter(4);

        Paragraph descricao = new Paragraph(
                "Sistema Inteligente de Gestão de Transporte Sanitário",
                fonteNormal
        );

        Paragraph subtitulo = new Paragraph(
                "Relatório operacional de transporte sanitário municipal",
                fonteNormal
        );

        document.add(sigts);
        document.add(descricao);
        document.add(subtitulo);
        document.add(espaco(8));
    }

    private void adicionarLinha(Document document) throws Exception {
        LineSeparator linha = new LineSeparator();
        linha.setLineColor(new Color(37, 99, 235));
        linha.setLineWidth(1.2f);

        document.add(linha);
        document.add(espaco(12));
    }

    private void adicionarDadosDaViagem(
            Document document,
            Agendamento agendamento,
            Font fonteSecao,
            Font fonteNormal,
            Font fonteNegrito
    ) throws Exception {
        adicionarTituloSecao(document, "1. DADOS DA VIAGEM", fonteSecao);

        PdfPTable tabela = new PdfPTable(4);
        tabela.setWidthPercentage(100);
        tabela.setWidths(new float[]{1.3f, 2.2f, 1.3f, 2.2f});

        adicionarLinhaInfo(tabela, "Status", textoSeguro(statusViagem(agendamento)), "Data e hora", formatarDataHora(agendamento.getDataHora()), fonteNegrito, fonteNormal);
        adicionarLinhaInfo(tabela, "Origem", cidadeCompleta(agendamento.getCidadeOrigem()), "Destino", cidadeCompleta(agendamento.getCidadeDestino()), fonteNegrito, fonteNormal);
        adicionarLinhaInfo(tabela, "Distância", formatarDistancia(agendamento.getDistanciaKm()), "Duração estimada", formatarDuracao(agendamento.getDuracaoMinutos()), fonteNegrito, fonteNormal);

        document.add(tabela);
        document.add(espaco(12));
    }

    private void adicionarMotoristaVeiculo(
            Document document,
            Agendamento agendamento,
            Font fonteSecao,
            Font fonteNormal,
            Font fonteNegrito
    ) throws Exception {
        adicionarTituloSecao(document, "2. MOTORISTA E VEÍCULO", fonteSecao);

        String motorista = "Não definido";
        String telefoneMotorista = "Não informado";

        if (agendamento.getMotorista() != null) {
            motorista = textoSeguro(agendamento.getMotorista().getNome());

            if (agendamento.getMotorista().getTelefone() != null && !agendamento.getMotorista().getTelefone().isBlank()) {
                telefoneMotorista = agendamento.getMotorista().getTelefone();
            }
        }

        String veiculo = "Não definido";
        String placa = "Não definida";
        String capacidade = "Não informada";
        String isolamento = "Não";

        if (agendamento.getVeiculo() != null) {
            veiculo = textoSeguro(agendamento.getVeiculo().getModelo());
            placa = textoSeguro(agendamento.getVeiculo().getPlaca());

            if (agendamento.getVeiculo().getCapacidade() != null) {
                capacidade = String.valueOf(agendamento.getVeiculo().getCapacidade());
            }

            if (Boolean.TRUE.equals(agendamento.getVeiculo().getIsolado())) {
                isolamento = "Sim";
            }
        }

        PdfPTable tabela = new PdfPTable(4);
        tabela.setWidthPercentage(100);
        tabela.setWidths(new float[]{1.3f, 2.2f, 1.3f, 2.2f});

        adicionarLinhaInfo(tabela, "Motorista", motorista, "Telefone", telefoneMotorista, fonteNegrito, fonteNormal);
        adicionarLinhaInfo(tabela, "Veículo", veiculo, "Placa", placa, fonteNegrito, fonteNormal);
        adicionarLinhaInfo(tabela, "Capacidade", capacidade, "Veículo de isolamento", isolamento, fonteNegrito, fonteNormal);

        document.add(tabela);
        document.add(espaco(12));
    }

    private void adicionarPassageiros(
            Document document,
            Agendamento agendamento,
            Font fonteSecao,
            Font fonteNormal,
            Font fontePequena
    ) throws Exception {
        adicionarTituloSecao(document, "3. PASSAGEIROS", fonteSecao);

        List<PassageiroViagem> passageiros =
                passageiroRepository.buscarPassageirosComPaciente(agendamento.getId());

        passageiros.sort(
                Comparator.comparing(
                        PassageiroViagem::getHorarioAtendimento,
                        Comparator.nullsLast(Comparator.naturalOrder())
                )
        );

        if (passageiros.isEmpty()) {
            Paragraph vazio = new Paragraph("Nenhum passageiro cadastrado nesta viagem.", fonteNormal);
            vazio.setSpacingAfter(10);
            document.add(vazio);
            return;
        }

        PdfPTable tabela = new PdfPTable(7);
        tabela.setWidthPercentage(100);
        tabela.setWidths(new float[]{0.5f, 2.1f, 2.5f, 1.7f, 1.7f, 1.1f, 2.4f});

        adicionarCabecalhoTabela(tabela, "Nº");
        adicionarCabecalhoTabela(tabela, "Paciente");
        adicionarCabecalhoTabela(tabela, "Hospital / Clínica");
        adicionarCabecalhoTabela(tabela, "Consulta");
        adicionarCabecalhoTabela(tabela, "Exame");
        adicionarCabecalhoTabela(tabela, "Horário");
        adicionarCabecalhoTabela(tabela, "Observação");
        tabela.setHeaderRows(1);

        int contador = 1;

        for (PassageiroViagem passageiro : passageiros) {
            adicionarCelulaTabela(tabela, String.valueOf(contador), fontePequena, Element.ALIGN_CENTER);
            adicionarCelulaTabela(tabela, nomePaciente(passageiro), fontePequena, Element.ALIGN_LEFT);
            adicionarCelulaTabela(tabela, textoSeguro(passageiro.getHospital()), fontePequena, Element.ALIGN_LEFT);
            adicionarCelulaTabela(tabela, nomeConsulta(passageiro), fontePequena, Element.ALIGN_LEFT);
            adicionarCelulaTabela(tabela, nomeExame(passageiro), fontePequena, Element.ALIGN_LEFT);
            adicionarCelulaTabela(tabela, formatarHorarioAtendimento(passageiro), fontePequena, Element.ALIGN_CENTER);
            adicionarCelulaTabela(tabela, textoSeguro(passageiro.getObservacao()), fontePequena, Element.ALIGN_LEFT);

            contador++;
        }

        document.add(tabela);
        document.add(espaco(6));

        Paragraph total = new Paragraph("Total de passageiros: " + passageiros.size(), fonteNormal);
        total.setAlignment(Element.ALIGN_RIGHT);
        document.add(total);

        document.add(espaco(8));
    }

    private void adicionarAssinaturas(Document document, Font fonteNormal) throws Exception {
        document.add(espaco(4));

        PdfPTable tabela = new PdfPTable(2);
        tabela.setWidthPercentage(100);
        tabela.setWidths(new float[]{1f, 1f});
        tabela.setKeepTogether(true);

        PdfPCell assinaturaMotorista = new PdfPCell();
        assinaturaMotorista.setBorder(Rectangle.NO_BORDER);
        assinaturaMotorista.setPaddingTop(8);
        assinaturaMotorista.addElement(new Paragraph("__________________________________", fonteNormal));
        assinaturaMotorista.addElement(new Paragraph("Assinatura do motorista", fonteNormal));

        PdfPCell assinaturaResponsavel = new PdfPCell();
        assinaturaResponsavel.setBorder(Rectangle.NO_BORDER);
        assinaturaResponsavel.setPaddingTop(8);
        assinaturaResponsavel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        assinaturaResponsavel.addElement(new Paragraph("__________________________________", fonteNormal));
        assinaturaResponsavel.addElement(new Paragraph("Responsável pelo setor", fonteNormal));

        tabela.addCell(assinaturaMotorista);
        tabela.addCell(assinaturaResponsavel);

        document.add(tabela);
        document.add(espaco(4));
    }

    private void adicionarRodape(Document document, Font fonteRodape) throws Exception {
        Paragraph rodape = new Paragraph(
                "Documento gerado automaticamente pelo SIGTS - Sistema Inteligente de Gestão de Transporte Sanitário.",
                fonteRodape
        );
        rodape.setAlignment(Element.ALIGN_CENTER);
        document.add(rodape);
    }

    private void adicionarTituloSecao(Document document, String texto, Font fonteSecao) throws Exception {
        PdfPTable tabela = new PdfPTable(1);
        tabela.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell(new Phrase(texto, fonteSecao));
        cell.setBackgroundColor(new Color(15, 76, 129));
        cell.setPadding(7);
        cell.setBorder(Rectangle.NO_BORDER);

        tabela.addCell(cell);

        document.add(tabela);
        document.add(espaco(6));
    }

    private void adicionarLinhaInfo(
            PdfPTable tabela,
            String label1,
            String valor1,
            String label2,
            String valor2,
            Font fonteLabel,
            Font fonteValor
    ) {
        adicionarCelulaInfo(tabela, label1, fonteLabel, new Color(241, 245, 249));
        adicionarCelulaInfo(tabela, valor1, fonteValor, Color.WHITE);
        adicionarCelulaInfo(tabela, label2, fonteLabel, new Color(241, 245, 249));
        adicionarCelulaInfo(tabela, valor2, fonteValor, Color.WHITE);
    }

    private void adicionarCelulaInfo(PdfPTable tabela, String texto, Font fonte, Color fundo) {
        PdfPCell cell = new PdfPCell(new Phrase(textoSeguro(texto), fonte));
        cell.setBackgroundColor(fundo);
        cell.setPadding(6);
        cell.setBorderColor(new Color(203, 213, 225));
        tabela.addCell(cell);
    }

    private void adicionarCabecalhoTabela(PdfPTable tabela, String texto) {
        Font fonte = new Font(Font.HELVETICA, 8, Font.BOLD, Color.WHITE);

        PdfPCell cell = new PdfPCell(new Phrase(texto, fonte));
        cell.setBackgroundColor(new Color(15, 76, 129));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6);
        cell.setBorderColor(new Color(15, 76, 129));

        tabela.addCell(cell);
    }

    private void adicionarCelulaTabela(
            PdfPTable tabela,
            String texto,
            Font fonte,
            int alinhamento
    ) {
        PdfPCell cell = new PdfPCell(new Phrase(textoSeguro(texto), fonte));
        cell.setHorizontalAlignment(alinhamento);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);
        cell.setBorderColor(new Color(203, 213, 225));

        tabela.addCell(cell);
    }

    private Paragraph espaco(int altura) {
        Paragraph p = new Paragraph(" ");
        p.setSpacingAfter(altura);
        return p;
    }

    private String textoSeguro(String texto) {
        if (texto == null || texto.isBlank()) {
            return "-";
        }

        return texto;
    }

    private String cidadeCompleta(Cidade cidade) {
        if (cidade == null) {
            return "-";
        }

        if (cidade.getNome() != null && cidade.getEstado() != null) {
            return cidade.getNome() + " / " + cidade.getEstado();
        }

        if (cidade.getNome() != null) {
            return cidade.getNome();
        }

        return "-";
    }

    private String statusViagem(Agendamento agendamento) {
        if (agendamento.getStatus() == null) {
            return "-";
        }

        return agendamento.getStatus().name();
    }

    private String formatarDataHora(LocalDateTime dataHora) {
        if (dataHora == null) {
            return "-";
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        return dataHora.format(formatter);
    }

    private String formatarHorarioAtendimento(PassageiroViagem passageiro) {
        if (passageiro.getHorarioAtendimento() == null) {
            return "-";
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        return passageiro.getHorarioAtendimento().format(formatter);
    }

    private String formatarDistancia(Double distanciaKm) {
        if (distanciaKm == null) {
            return "-";
        }

        return String.format("%.2f km", distanciaKm);
    }

    private String formatarDuracao(Double duracaoMinutos) {
        if (duracaoMinutos == null) {
            return "-";
        }

        int minutos = duracaoMinutos.intValue();
        int horas = minutos / 60;
        int resto = minutos % 60;

        if (horas == 0) {
            return resto + " min";
        }

        return horas + "h " + resto + "min";
    }

    private String nomePaciente(PassageiroViagem passageiro) {
        if (passageiro.getPaciente() == null) {
            return "-";
        }

        return textoSeguro(passageiro.getPaciente().getNome());
    }

    private String nomeConsulta(PassageiroViagem passageiro) {
        if (passageiro.getConsulta() == null) {
            return "-";
        }

        return textoSeguro(passageiro.getConsulta().getNome());
    }

    private String nomeExame(PassageiroViagem passageiro) {
        if (passageiro.getExame() == null) {
            return "-";
        }

        return textoSeguro(passageiro.getExame().getNome());
    }
}