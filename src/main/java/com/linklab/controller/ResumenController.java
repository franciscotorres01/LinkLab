package com.linklab.controller;

import com.linklab.dto.ResumenDto;
import com.linklab.escenario.Escenario;
import com.linklab.model.Simulacion;
import com.linklab.repository.SimulacionRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/resumen")
public class ResumenController {

    private final SimulacionRepository repo;

    public ResumenController(SimulacionRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResumenDto resumen(@AuthenticationPrincipal Jwt jwt) {
        String u = jwt.getClaimAsString("preferred_username");

        Double avg = repo.perdidaPromedio(u);
        double perdida = avg == null ? 0.0 : Math.round(avg * 1000.0) / 10.0;

        List<ResumenDto.Actividad> actividad = repo.findTop5ByUsuarioOrderByCreadaEnDesc(u).stream()
                .map(s -> new ResumenDto.Actividad(s.id, s.escenarioNombre, s.creadaEn, s.totalIntentos))
                .toList();

        return new ResumenDto(
                repo.countByUsuario(u),
                repo.contarEscenariosDistintos(u),
                Escenario.values().length,
                perdida,
                actividad);
    }

    // TEMPORAL: borrar cuando exista "Nueva simulación"
    @PostMapping("/demo")
    public void demo(@AuthenticationPrincipal Jwt jwt) {
        String u = jwt.getClaimAsString("preferred_username");
        Escenario[] datos = {Escenario.WIFI_CONGESTIONADO, Escenario.FIBRA_LOCAL, Escenario.SUCURSAL_CORPORATIVA};
        long[] intentos = {1142, 1048, 1081};
        for (int i = 0; i < datos.length; i++) {
            Escenario e = datos[i];
            Simulacion s = new Simulacion();
            s.usuario = u;
            s.escenarioId = e.name();
            s.escenarioNombre = e.getNombre();
            s.probabilidadPerdida = e.getProbabilidadPerdida();
            s.tamanoPaqueteBytes = e.getTamanoPaqueteBytes();
            s.rttMs = e.getRttMs();
            s.repeticiones = 1000;
            s.tamanoArchivoBytes = 1_000_000;
            s.algoritmo = "ARQ hasta acuse";
            s.totalPaquetes = 1000;
            s.totalIntentos = intentos[i];
            s.promedioIntentos = intentos[i] / 1000.0;
            s.creadaEn = Instant.now().minus(i, ChronoUnit.DAYS);
            repo.save(s);
        }
    }
}