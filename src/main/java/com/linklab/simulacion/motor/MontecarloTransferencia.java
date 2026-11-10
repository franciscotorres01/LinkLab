package com.Linklab.simulacion.motor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.TreeMap;

/**
 * Montecarlo (RF-03): corre N transferencias de un archivo y estima cuántas retransmisiones
 * hacen falta y qué tasa de transferencia efectiva queda.
 *
 * <p>Garantiza el tiempo (un número fijo de repeticiones) y sacrifica la exactitud: el promedio
 * es una estimación que se acerca a 1/(1-p) al crecer N.
 */
public final class MontecarloTransferencia implements EstrategiaSimulacion {

    public static final String NOMBRE = "montecarlo";

    /** Máximo de puntos de la curva de convergencia (RF-07). */
    static final int PUNTOS_CONVERGENCIA = 200;

    @Override
    public String nombre() {
        return NOMBRE;
    }

    @Override
    public ResultadoSimulacion ejecutar(ParametrosEnlace enlace, ParametrosCorrida corrida, Random random) {
        ModeloEnlace.exigirEnlaceEntregable(enlace);

        long paquetesPorTransferencia = (corrida.tamanoArchivoBytes() + enlace.tamanoPaqueteBytes() - 1)
                / enlace.tamanoPaqueteBytes();
        long totalPaquetes = Math.multiplyExact(corrida.repeticiones(), paquetesPorTransferencia);

        long paso = Math.max(1, totalPaquetes / PUNTOS_CONVERGENCIA);
        Map<Long, Long> histograma = new TreeMap<>();
        List<Double> convergencia = new ArrayList<>();
        long totalIntentos = 0;
        long maxIntentos = 0;

        for (long i = 1; i <= totalPaquetes; i++) {
            long intentos = ModeloEnlace.intentosHastaAcuse(enlace.probabilidadPerdida(), random);
            totalIntentos += intentos;
            maxIntentos = Math.max(maxIntentos, intentos);
            histograma.merge(intentos, 1L, Long::sum);
            if (i % paso == 0 || i == totalPaquetes) {
                convergencia.add((double) totalIntentos / i);
            }
        }

        return ModeloEnlace.construir(NOMBRE, enlace, totalPaquetes, totalIntentos, maxIntentos,
                histograma, convergencia);
    }
}