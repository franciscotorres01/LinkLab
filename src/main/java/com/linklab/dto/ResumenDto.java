package com.linklab.dto;

import java.time.Instant;
import java.util.List;

public record ResumenDto(
        long simulacionesTotales,
        long escenariosProbados,
        long escenariosDisponibles,
        double perdidaPromedio,
        List<Actividad> actividad) {

    public record Actividad(Long id, String escenario, Instant fecha, long intentos) {}
}