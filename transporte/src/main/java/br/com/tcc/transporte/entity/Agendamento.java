package br.com.tcc.transporte.entity;

import java.time.LocalDateTime;
import java.util.List;

import br.com.tcc.transporte.enums.StatusAgendamento;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(nullable = false)
    private Cidade cidadeOrigem;


    @ManyToOne
    @JoinColumn(nullable = false)
    private Cidade cidadeDestino;


    @ManyToOne
    private Veiculo veiculo;

    // Distância calculada automaticamente pela API de rota
    private Double distanciaKm;

    // Duração calculada automaticamente pela API de rota
    private Double duracaoMinutos;


    private LocalDateTime dataHora;

    // Status da viagem
    @Enumerated(EnumType.STRING)
    private StatusAgendamento status;

    // Passageiros da viagem com hospital, consulta/exame e horário de atendimento
    @OneToMany(mappedBy = "agendamento", cascade = CascadeType.ALL)
    private List<PassageiroViagem> passageiros;

    @ManyToOne
    @JoinColumn(name = "motorista_id")
    private Usuario motorista;
}