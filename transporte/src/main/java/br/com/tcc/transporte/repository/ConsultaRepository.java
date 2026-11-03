package br.com.tcc.transporte.repository;

import br.com.tcc.transporte.entity.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {
}