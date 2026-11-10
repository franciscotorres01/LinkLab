package com.linklab.simulacion.motor;

/**
 * Parámetros del enlace punto a punto (RF-01).
 *
 * @param probabilidadPerdida probabilidad de que un intento se pierda, en [0, 1]
 * @param tamanoPaqueteBytes  tamaño de cada paquete, mayor que 0
 * @param rttMs               retardo de ida y vuelta en milisegundos, mayor que 0
 */
public record ParametrosEnlace(double probabilidadPerdida, int tamanoPaqueteBytes, double rttMs) {

    public ParametrosEnlace {
        // Los mensajes nombran el campo inválido, como exige el criterio de RF-01.
        if (Double.isNaN(probabilidadPerdida) || probabilidadPerdida < 0.0 || probabilidadPerdida > 1.0) {
            throw new IllegalArgumentException(
                    "probabilidadPerdida debe estar entre 0 y 1 (recibido: " + probabilidadPerdida + ")");
        }
        if (tamanoPaqueteBytes <= 0) {
            throw new IllegalArgumentException(
                    "tamanoPaqueteBytes debe ser mayor que 0 (recibido: " + tamanoPaqueteBytes + ")");
        }
        if (Double.isNaN(rttMs) || rttMs <= 0.0) {
            throw new IllegalArgumentException(
                    "rttMs debe ser mayor que 0 (recibido: " + rttMs + ")");
        }
    }
}