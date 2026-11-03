package br.com.tcc.transporte.service;

import br.com.tcc.transporte.dto.request.CidadeRequestDTO;
import br.com.tcc.transporte.entity.Cidade;
import br.com.tcc.transporte.repository.CidadeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CidadeService {

    private final CidadeRepository repository;
    private final GeocodingService geocodingService;
    private final ExclusaoComVinculoHelper exclusaoHelper;

    public CidadeService(CidadeRepository repository,
                         GeocodingService geocodingService,
                         ExclusaoComVinculoHelper exclusaoHelper) {
        this.repository = repository;
        this.geocodingService = geocodingService;
        this.exclusaoHelper = exclusaoHelper;
    }

    public Cidade salvar(CidadeRequestDTO dto) {

        String nome = dto.getNome().trim();
        String estado = dto.getEstado().trim().toUpperCase();

        repository.findByNome(nome)
                .ifPresent(c -> {
                    throw new RuntimeException("Cidade já cadastrada");
                });

        double[] coordenadas = geocodingService.buscarCoordenadas(nome);

        Cidade cidade = new Cidade();
        cidade.setNome(nome);
        cidade.setEstado(estado);
        cidade.setLatitude(coordenadas[0]);
        cidade.setLongitude(coordenadas[1]);

        return repository.save(cidade);
    }

    public Cidade salvarOuBuscarGoogle(CidadeRequestDTO dto) {

        String nome = dto.getNome().trim();
        String estado = dto.getEstado().trim().toUpperCase();

        if (dto.getLatitude() == null || dto.getLongitude() == null) {
            throw new RuntimeException("Latitude e longitude são obrigatórias");
        }

        return repository
                .findByNomeIgnoreCaseAndEstadoIgnoreCase(nome, estado)
                .map(cidadeExistente -> {
                    cidadeExistente.setLatitude(dto.getLatitude());
                    cidadeExistente.setLongitude(dto.getLongitude());

                    return repository.save(cidadeExistente);
                })
                .orElseGet(() -> {
                    Cidade cidade = new Cidade();
                    cidade.setNome(nome);
                    cidade.setEstado(estado);
                    cidade.setLatitude(dto.getLatitude());
                    cidade.setLongitude(dto.getLongitude());

                    return repository.save(cidade);
                });
    }

    public List<Cidade> listarTodos() {
        return repository.findAll();
    }

    public Cidade buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cidade não encontrada"));
    }

    public Cidade atualizar(Long id, CidadeRequestDTO dto) {

        Cidade cidade = buscarPorId(id);

        String nome = dto.getNome().trim();
        String estado = dto.getEstado().trim().toUpperCase();

        repository.findByNome(nome)
                .filter(outra -> !outra.getId().equals(id))
                .ifPresent(outra -> {
                    throw new RuntimeException("Cidade já cadastrada");
                });

        if (!nome.equalsIgnoreCase(cidade.getNome())) {
            double[] coordenadas = geocodingService.buscarCoordenadas(nome);
            cidade.setLatitude(coordenadas[0]);
            cidade.setLongitude(coordenadas[1]);
        }

        cidade.setNome(nome);
        cidade.setEstado(estado);

        return repository.save(cidade);
    }

    @Transactional
    public void excluir(Long id) {
        Cidade cidade = buscarPorId(id);

        exclusaoHelper.excluir(
                repository,
                cidade,
                "Esta cidade já está vinculada a uma viagem e não pode ser excluída."
        );
    }
}