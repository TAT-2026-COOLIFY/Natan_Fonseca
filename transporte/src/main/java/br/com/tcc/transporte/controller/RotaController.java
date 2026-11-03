package br.com.tcc.transporte.controller;

import br.com.tcc.transporte.dto.request.RotaPreviewRequestDTO;
import br.com.tcc.transporte.dto.response.RotaPreviewResponseDTO;
import br.com.tcc.transporte.service.RouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rotas")
public class RotaController {

    private final RouteService routeService;

    public RotaController(RouteService routeService) {
        this.routeService = routeService;
    }

    @PostMapping("/preview")
    public ResponseEntity<RotaPreviewResponseDTO> preview(
            @RequestBody RotaPreviewRequestDTO dto
    ) {

        double[] rota = routeService.calcularRotaPorCoordenadas(
                dto.getOrigemLatitude(),
                dto.getOrigemLongitude(),
                dto.getDestinoLatitude(),
                dto.getDestinoLongitude()
        );

        RotaPreviewResponseDTO response = new RotaPreviewResponseDTO(
                rota[0],
                rota[1],
                routeService.formatarDuracao(rota[1])
        );

        return ResponseEntity.ok(response);
    }
}