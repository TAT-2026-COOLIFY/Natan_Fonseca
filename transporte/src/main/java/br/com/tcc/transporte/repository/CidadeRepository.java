package br.com.tcc.transporte.repository;

import br.com.tcc.transporte.entity.Cidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CidadeRepository extends JpaRepository<Cidade, Long> {

    Optional<Cidade> findByNome(String nome);

    Optional<Cidade> findByNomeIgnoreCaseAndEstadoIgnoreCase(String nome, String estado);
}