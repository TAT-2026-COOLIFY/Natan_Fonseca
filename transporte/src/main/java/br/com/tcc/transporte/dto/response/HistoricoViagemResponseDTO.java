package br.com.tcc.transporte.dto.response;

import br.com.tcc.transporte.entity.HistoricoViagem;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class HistoricoViagemResponseDTO {

    private final Long id;
    private final String acao;
    private final String descricao;
    private final LocalDateTime dataHora;
    private final String usuarioNome;

    public HistoricoViagemResponseDTO(HistoricoViagem historico) {
        this.id = historico.getId();
        this.acao = historico.getAcao();
        this.descricao = historico.getDescricao();
        this.dataHora = historico.getDataHora();

        if (historico.getUsuario() != null) {
            this.usuarioNome = historico.getUsuario().getNome();
        } else {
            this.usuarioNome = "Sistema";
        }
    }
}