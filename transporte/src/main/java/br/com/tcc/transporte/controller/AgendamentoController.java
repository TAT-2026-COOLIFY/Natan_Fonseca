package br.com.tcc.transporte.controller;

import br.com.tcc.transporte.dto.request.AgendamentoRequestDTO;
import br.com.tcc.transporte.dto.request.ConfirmarAgendamentoDTO;
import br.com.tcc.transporte.dto.request.PassageiroRequestDTO;
import br.com.tcc.transporte.dto.response.AgendamentoResponseDTO;
import br.com.tcc.transporte.dto.response.HistoricoPacienteResponseDTO;
import br.com.tcc.transporte.dto.response.HistoricoViagemResponseDTO;
import br.com.tcc.transporte.dto.response.LinkWhatsAppDTO;
import br.com.tcc.transporte.entity.Agendamento;
import br.com.tcc.transporte.entity.PassageiroViagem;
import br.com.tcc.transporte.service.AgendamentoService;
import br.com.tcc.transporte.service.PdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/agendamentos")
@RequiredArgsConstructor
public class AgendamentoController {

    private final AgendamentoService service;
    private final PdfService pdfService;

    @PostMapping
    public Agendamento criar(@RequestBody AgendamentoRequestDTO dto) {
        return service.criarAgendamento(
                dto.getCidadeOrigemId(),
                dto.getCidadeDestinoId(),
                dto.getDataHora(),
                dto.getDistanciaKm(),
                dto.getDuracaoMinutos()
        );
    }

    @GetMapping
    public List<Agendamento> listar() {
        return service.listarTodos();
    }

    @GetMapping("/motorista/{motoristaId}")
    public List<AgendamentoResponseDTO> listarPorMotorista(@PathVariable Long motoristaId) {
        return service.listarPorMotorista(motoristaId)
                .stream()
                .map(AgendamentoResponseDTO::new)
                .toList();
    }

    @GetMapping("/paciente/{pacienteId}/historico")
    public List<HistoricoPacienteResponseDTO> historicoPaciente(@PathVariable Long pacienteId) {
        return service.historicoPaciente(pacienteId)
                .stream()
                .map(HistoricoPacienteResponseDTO::new)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgendamentoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(
                new AgendamentoResponseDTO(service.buscarPorId(id))
        );
    }

    @GetMapping("/{id}/historico")
    public List<HistoricoViagemResponseDTO> listarHistorico(@PathVariable Long id) {
        return service.listarHistorico(id)
                .stream()
                .map(HistoricoViagemResponseDTO::new)
                .toList();
    }

    @PostMapping("/{id}/confirmar")
    public Agendamento confirmar(
            @PathVariable Long id,
            @RequestBody ConfirmarAgendamentoDTO dto
    ) {
        return service.confirmarAgendamento(
                id,
                dto.getVeiculoId(),
                dto.getMotoristaId()
        );
    }

    @PostMapping("/{id}/iniciar")
    public Agendamento iniciar(@PathVariable Long id) {
        return service.iniciarViagem(id);
    }

    @PostMapping("/{id}/finalizar")
    public Agendamento finalizar(@PathVariable Long id) {
        return service.finalizarViagem(id);
    }

    @PostMapping("/{id}/cancelar")
    public Agendamento cancelar(@PathVariable Long id) {
        return service.cancelarViagem(id);
    }

    @GetMapping("/{id}/vagas")
    public int vagasRestantes(@PathVariable Long id) {
        return service.calcularVagasRestantes(id);
    }

    @PostMapping("/{id}/passageiros")
    public Agendamento adicionarPassageiro(
            @PathVariable Long id,
            @RequestBody PassageiroRequestDTO dto
    ) {
        return service.adicionarPassageiro(
                id,
                dto.getPacienteId(),
                dto.getHospital(),
                dto.getConsultaId(),
                dto.getExameId(),
                dto.getHorarioAtendimento(),
                dto.getObservacao()
        );
    }

    @GetMapping("/{id}/passageiros")
    public List<PassageiroViagem> listarPassageiros(@PathVariable Long id) {
        return service.listarPassageiros(id);
    }

    @DeleteMapping("/{agendamentoId}/passageiros/{pacienteId}")
    public Agendamento removerPassageiro(
            @PathVariable Long agendamentoId,
            @PathVariable Long pacienteId
    ) {
        return service.removerPassageiro(agendamentoId, pacienteId);
    }

    @GetMapping("/{id}/relatorio")
    public ResponseEntity<byte[]> gerarRelatorio(@PathVariable Long id) {
        Agendamento agendamento = service.buscarPorId(id);

        byte[] pdf = pdfService.gerarRelatorioViagem(agendamento);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=relatorio_viagem_" + id + ".pdf")
                .header("Content-Type", "application/pdf")
                .body(pdf);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgendamentoResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody AgendamentoRequestDTO dto
    ) {
        Agendamento agendamento = service.atualizar(id, dto);

        return ResponseEntity.ok(new AgendamentoResponseDTO(agendamento));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/notificar-motorista")
    public ResponseEntity<LinkWhatsAppDTO> notificarMotorista(@PathVariable Long id) {
        String link = service.gerarLinkNotificacaoMotorista(id);

        return ResponseEntity.ok(new LinkWhatsAppDTO(link));
    }

}