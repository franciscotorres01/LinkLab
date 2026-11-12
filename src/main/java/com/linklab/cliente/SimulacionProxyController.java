package com.linklab.cliente;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;

import java.util.Map;

@RestController
@RequestMapping("/api/simulacion")
public class SimulacionProxyController {

    private final SimuladorClient simulador;

    public SimulacionProxyController(SimuladorClient simulador) {
        this.simulador = simulador;
    }

    @PostMapping
    @PreAuthorize("hasRole('analista')")
    public ResponseEntity<?> simular(@RequestBody Map<String, Object> params) {
        try {
            return ResponseEntity.ok(simulador.simular(params));
        } catch (ResourceAccessException e) {
            return ResponseEntity.status(503)
                    .body(Map.of("error", "El simulador no está disponible"));
        } catch (HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("error", "El simulador respondió con error",
                            "detalle", e.getResponseBodyAsString()));
        }
    }
}