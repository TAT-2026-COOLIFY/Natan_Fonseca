package br.com.tcc.transporte.repository;

import br.com.tcc.transporte.entity.Exame;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExameRepository extends JpaRepository<Exame, Long> {

    Optional<Exame> findByNome(String nome);
}