package br.com.tcc.transporte.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
@Getter
@Setter
@Entity
public class PassageiroViagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonIgnore
    private Agendamento agendamento;

    @ManyToOne
    private Paciente paciente;

    private String hospital;

    @ManyToOne
    private Consulta consulta;

    @ManyToOne
    private Exame exame;

    private LocalDateTime horarioAtendimento;

    @Column(length = 1000)
    private String observacao;

}