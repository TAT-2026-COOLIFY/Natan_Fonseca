package br.com.tcc.transporte.entity;

import br.com.tcc.transporte.enums.PerfilUsuario;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    private String senha;

    @Enumerated(EnumType.STRING)
    private PerfilUsuario perfil;

    private String telefone;

    private Boolean ativo = true;
}