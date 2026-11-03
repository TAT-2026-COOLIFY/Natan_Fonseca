package br.com.tcc.transporte.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GeocodingService {

    private final RestTemplate restTemplate;

    @Value("${openroute.api.key}")
    private String apiKey;

    public GeocodingService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public double[] buscarCoordenadas(String cidade) {

        String url = "https://api.openrouteservice.org/geocode/search?api_key="
                + apiKey
                + "&text=" + cidade;

        Map response = restTemplate.getForObject(url, Map.class);

        Map features = ((java.util.List<Map>) response.get("features")).get(0);
        Map geometry = (Map) features.get("geometry");
        java.util.List<Double> coordinates = (java.util.List<Double>) geometry.get("coordinates");

        return new double[]{coordinates.get(1), coordinates.get(0)};
    }
}