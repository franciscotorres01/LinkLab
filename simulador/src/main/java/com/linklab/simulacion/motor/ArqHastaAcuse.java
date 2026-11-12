package com.linklab.simulacion.motor;

import com.linklab.simulacion.motor.EstrategiaSimulacion;
import com.linklab.simulacion.motor.ModeloEnlace;
import com.linklab.simulacion.motor.ParametrosEnlace;
import com.linklab.simulacion.motor.ResultadoSimulacion;

import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * ARQ (RF-04): envía un paquete y reintenta hasta recibir el acuse de recibo.
 *
 * <p>Es un algoritmo Las Vegas real: el paquete que entrega siempre es el correcto, nunca se
 * entrega "fallido", y lo único aleatorio es cuánto tarda. Con pérdida 0 son exactamente
 * 1 intento. Las repeticiones de {@link ParametrosCorrida} no se usan: esta estrategia observa
 * una transferencia concreta de un solo paquete.
 */
public final class ArqHastaAcuse implements EstrategiaSimulacion {

    public static final String NOMBRE = "arq";

    @Override
    public String nombre() {
        return NOMBRE;
    }

    @Override
    public ResultadoSimulacion ejecutar(ParametrosEnlace enlace, ParametrosCorrida corrida, Random random) {
        ModeloEnlace.exigirEnlaceEntregable(enlace);

        long intentos = ModeloEnlace.intentosHastaAcuse(enlace.probabilidadPerdida(), random);

        return ModeloEnlace.construir(NOMBRE, enlace, 1, intentos, intentos,
                Map.of(intentos, 1L), List.of());
    }
}