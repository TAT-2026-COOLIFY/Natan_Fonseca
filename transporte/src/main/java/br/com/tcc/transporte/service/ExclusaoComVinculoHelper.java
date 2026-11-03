package br.com.tcc.transporte.service;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;


@Component
public class ExclusaoComVinculoHelper {

    public <T> void excluir(JpaRepository<T, Long> repository, T entidade, String mensagemErro) {
        try {
            repository.delete(entidade);
            repository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException(mensagemErro);
        }
    }
}
