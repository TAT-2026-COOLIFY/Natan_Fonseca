package br.com.tcc.transporte.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Veiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String modelo;

    private String placa;

    private String ano;

    private Integer capacidade;

    private Boolean isolado = false;
}