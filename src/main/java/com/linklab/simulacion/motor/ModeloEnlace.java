package com.Linklab.simulacion.motor;

import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Modelo común a las dos estrategias: qué es un intento, cuánto cuesta y cómo se
 * calculan las métricas derivadas. Vive aquí para que Montecarlo y ARQ no se contradigan.
 *
 * <p>Simplificaciones declaradas (entran a la bitácora):
 * <ul>
 *   <li>Stop-and-wait: cada intento, exitoso o no, cuesta exactamente un RTT.</li>
 *   <li>El acuse de recibo nunca se pierde: solo se pierde el paquete.</li>
 *   <li>Todos los paquetes tienen el tamaño completo, incluido el último de un archivo.</li>
 * </ul>
 */
final class ModeloEnlace {

    private ModeloEnlace() {
    }

    /**
     * Con p = 1 ningún paquete llega jamás y el bucle de reintento no terminaría. Un algoritmo
     * Las Vegas garantiza resultado correcto, no que termine siempre; termina con probabilidad 1
     * solo si p &lt; 1. Se rechaza antes de entrar al bucle.
     */
    static void exigirEnlaceEntregable(ParametrosEnlace enlace) {
        if (enlace.probabilidadPerdida() >= 1.0) {
            throw new IllegalArgumentException(
                    "probabilidadPerdida debe ser menor que 1 para simular: con 1 ningún paquete se entrega nunca");
        }
    }

    /** Reenvía hasta que el paquete llega. Devuelve cuántos envíos hicieron falta (siempre al menos 1). */
    static long intentosHastaAcuse(double probabilidadPerdida, Random random) {
        long intentos = 1;
        while (random.nextDouble() < probabilidadPerdida) {
            intentos++;
        }
        return intentos;
    }

    static ResultadoSimulacion construir(
            String algoritmo,
            ParametrosEnlace enlace,
            long totalPaquetes,
            long totalIntentos,
            long maxIntentos,
            Map<Long, Long> histograma,
            List<Double> convergencia) {

        double promedio = (double) totalIntentos / totalPaquetes;
        double tiempoTotalMs = totalIntentos * enlace.rttMs();
        double bitsEntregados = (double) totalPaquetes * enlace.tamanoPaqueteBytes() * 8.0;
        double tasaBps = bitsEntregados / (tiempoTotalMs / 1000.0);
        double teorico = 1.0 / (1.0 - enlace.probabilidadPerdida());
        double diferenciaRelativa = Math.abs(promedio - teorico) / teorico;

        return new ResultadoSimulacion(
                algoritmo, totalPaquetes, totalIntentos, promedio, maxIntentos,
                histograma, tiempoTotalMs, tasaBps, teorico, diferenciaRelativa, convergencia);
    }
}