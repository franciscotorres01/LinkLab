package com.linklab.simulador;

import com.linklab.simulacion.motor.ArqHastaAcuse;
import com.linklab.simulacion.motor.EstrategiaSimulacion;
import com.linklab.simulacion.motor.MontecarloTransferencia;
import com.linklab.simulacion.motor.ParametrosCorrida;
import com.linklab.simulacion.motor.ParametrosEnlace;
import com.linklab.simulacion.motor.ResultadoSimulacion;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Random;

@RestController
public class SimulacionController {

    static final long MAX_PAQUETES = 5_000_000L;

    private final Map<String, EstrategiaSimulacion> estrategias = Map.of(
            ArqHastaAcuse.NOMBRE, new ArqHastaAcuse(),
            MontecarloTransferencia.NOMBRE, new MontecarloTransferencia());

    public record SolicitudSimulacion(
            String algoritmo,
            double probabilidadPerdida,
            int tamanoPaqueteBytes,
            double rttMs,
            long repeticiones,
            long tamanoArchivoBytes,
            Long semilla) {}

    public record RespuestaSimulacion(long semilla, ResultadoSimulacion resultado) {}

    @GetMapping("/salud")
    public Map<String, String> salud() {
        return Map.of("estado", "ok");
    }

    @PostMapping("/simular")
    public RespuestaSimulacion simular(@RequestBody SolicitudSimulacion s) {
        if (s.algoritmo() == null) {
            throw new IllegalArgumentException("algoritmo es obligatorio (válidos: " + estrategias.keySet() + ")");
        }
        EstrategiaSimulacion estrategia = estrategias.get(s.algoritmo());
        if (estrategia == null) {
            throw new IllegalArgumentException(
                    "algoritmo desconocido: " + s.algoritmo() + " (válidos: " + estrategias.keySet() + ")");
        }

        ParametrosEnlace enlace = new ParametrosEnlace(
                s.probabilidadPerdida(), s.tamanoPaqueteBytes(), s.rttMs());
        ParametrosCorrida corrida = new ParametrosCorrida(
                s.repeticiones(), s.tamanoArchivoBytes());

        if (MontecarloTransferencia.NOMBRE.equals(s.algoritmo())) {
            long porTransferencia = (corrida.tamanoArchivoBytes() - 1) / enlace.tamanoPaqueteBytes() + 1;
            long total = Math.multiplyExact(corrida.repeticiones(), porTransferencia);
            if (total > MAX_PAQUETES) {
                throw new IllegalArgumentException(
                        "la simulación pide " + total + " paquetes; el máximo permitido es " + MAX_PAQUETES);
            }
        }

        long semilla = s.semilla() != null ? s.semilla() : new Random().nextLong();
        ResultadoSimulacion resultado = estrategia.ejecutar(enlace, corrida, new Random(semilla));
        return new RespuestaSimulacion(semilla, resultado);
    }
}
