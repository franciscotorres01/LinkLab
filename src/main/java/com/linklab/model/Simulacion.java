package com.linklab.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class Simulacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String usuario;
    public String escenarioId;
    public String escenarioNombre;

    public double probabilidadPerdida;
    public int tamanoPaqueteBytes;
    public double rttMs;
    public long repeticiones;
    public long tamanoArchivoBytes;
    public Long semilla;

    public String algoritmo;
    public long totalPaquetes;
    public long totalIntentos;
    public double promedioIntentos;
    public long maxIntentos;
    public double tiempoTotalMs;
    public double tasaBps;
    public double valorTeorico;
    public double diferenciaRelativa;

    @Lob
    @Column(length = 100000)
    public String histogramaJson;

    @Lob
    @Column(length = 100000)
    public String convergenciaJson;

    public Instant creadaEn = Instant.now();
}