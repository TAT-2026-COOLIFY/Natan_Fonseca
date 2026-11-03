package br.com.tcc.transporte.service;

import br.com.tcc.transporte.entity.Cidade;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class RouteService {

    private final RestTemplate restTemplate;

    public RouteService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public double[] calcularRota(Cidade origem, Cidade destino) {
        return calcularRotaPorCoordenadas(
                origem.getLatitude(), origem.getLongitude(),
                destino.getLatitude(), destino.getLongitude()
        );
    }

    public String formatarDuracao(double minutos) {

        int horas = (int) minutos / 60;
        int mins = (int) minutos % 60;

        return horas + "h " + mins + "min";
    }

    public double[] calcularRotaPorCoordenadas(
            Double origemLatitude,
            Double origemLongitude,
            Double destinoLatitude,
            Double destinoLongitude
    ) {

        String url = "http://router.project-osrm.org/route/v1/driving/"
                + origemLongitude + "," + origemLatitude
                + ";"
                + destinoLongitude + "," + destinoLatitude
                + "?overview=false";

        Map response = restTemplate.getForObject(url, Map.class);

        List<Map> routes = (List<Map>) response.get("routes");

        if (routes == null || routes.isEmpty()) {
            throw new RuntimeException("Rota não encontrada");
        }

        Map route = routes.get(0);

        double distanciaMetros = ((Number) route.get("distance")).doubleValue();
        double duracaoSegundos = ((Number) route.get("duration")).doubleValue();

        double distanciaKm = distanciaMetros / 1000.0;
        double duracaoMinutos = duracaoSegundos / 60.0;

        return new double[]{distanciaKm, duracaoMinutos};
    }
}

