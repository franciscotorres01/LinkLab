package com.linklab.simulacion.motor;

/**
 * Qué se simula sobre el enlace.
 *
 * @param repeticiones       cuántas transferencias del archivo se repiten (N de Montecarlo)
 * @param tamanoArchivoBytes tamaño del archivo; define cuántos paquetes tiene cada transferencia
 */
public record ParametrosCorrida(long repeticiones, long tamanoArchivoBytes) {

    public ParametrosCorrida {
        if (repeticiones <= 0) {
            throw new IllegalArgumentException(
                    "repeticiones debe ser mayor que 0 (recibido: " + repeticiones + ")");
        }
        if (tamanoArchivoBytes <= 0) {
            throw new IllegalArgumentException(
                    "tamanoArchivoBytes debe ser mayor que 0 (recibido: " + tamanoArchivoBytes + ")");
        }
    }
}