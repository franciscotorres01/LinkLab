package com.Linklab.simulacion.motor;

import java.util.Random;

/**
 * Contrato de un algoritmo de simulación.
 *
 * <p>Dos decisiones de diseño sostienen dos escenarios de calidad a la vez:
 * <ul>
 *   <li><b>RQ-01 (Testabilidad):</b> el {@link Random} llega construido desde afuera, con su
 *       semilla. La estrategia nunca crea su propio generador, así que el resultado es una
 *       función determinista de (parámetros, semilla).</li>
 *   <li><b>RQ-03 (Modificabilidad):</b> un algoritmo nuevo es una clase nueva que implementa
 *       esta interfaz; el resto del sistema no cambia.</li>
 * </ul>
 */
public interface EstrategiaSimulacion {

    /** Identificador estable que usará la API para escoger la estrategia. */
    String nombre();

    ResultadoSimulacion ejecutar(ParametrosEnlace enlace, ParametrosCorrida corrida, Random random);
}