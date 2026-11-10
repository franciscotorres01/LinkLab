package com.Linklab.simulacion.motor;

import java.util.List;
import java.util.Map;

/**
 * Resultado de una corrida. Es un record: dos corridas con los mismos parámetros y la
 * misma semilla producen resultados que son {@code equals} campo por campo (RQ-01).
 *
 * @param algoritmo           nombre de la estrategia que lo produjo
 * @param totalPaquetes       paquetes que llegaron entregados
 * @param totalIntentos       envíos totales, contando los que se perdieron
 * @param promedioIntentos    totalIntentos / totalPaquetes
 * @param maxIntentos         el paquete que más intentos necesitó (la cola)
 * @param histograma          intentos -> cuántos paquetes necesitaron exactamente esos intentos
 * @param tiempoTotalMs       tiempo simulado: cada intento cuesta un RTT (stop-and-wait)
 * @param tasaBps             bits entregados por segundo de tiempo simulado
 * @param valorTeorico        1 / (1 - p)
 * @param diferenciaRelativa  |promedio - teórico| / teórico
 * @param convergencia        promedio acumulado de intentos, muestreado a lo largo de la corrida
 */
public record ResultadoSimulacion(
        String algoritmo,
        long totalPaquetes,
        long totalIntentos,
        double promedioIntentos,
        long maxIntentos,
        Map<Long, Long> histograma,
        double tiempoTotalMs,
        double tasaBps,
        double valorTeorico,
        double diferenciaRelativa,
        List<Double> convergencia) {
}