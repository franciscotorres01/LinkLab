package com.linklab.simulacion.motor;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashSet;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import org.junit.jupiter.api.Test;

/**
 * Evidencia de RQ-01 (Testabilidad). Ninguna prueba levanta Spring: el motor es una clase
 * Java plana, así que toda la suite corre en menos de un segundo.
 */
class MotorReproducibilidadTest {

    private static final ParametrosEnlace ENLACE = new ParametrosEnlace(0.2, 1000, 50);
    private static final ParametrosCorrida DIEZ_MIL = new ParametrosCorrida(10_000, 1000);

    private final MontecarloTransferencia montecarlo = new MontecarloTransferencia();
    private final ArqHastaAcuse arq = new ArqHastaAcuse();

    // ---- RQ-01: la prueba central -------------------------------------------------------

    @Test
    void mismaSemillaProduceResultadoIdenticoCampoPorCampo() {
        ResultadoSimulacion primera = montecarlo.ejecutar(ENLACE, DIEZ_MIL, new Random(42));
        ResultadoSimulacion segunda = montecarlo.ejecutar(ENLACE, DIEZ_MIL, new Random(42));

        assertEquals(primera, segunda);
    }

    /**
     * Valor calculado la primera vez y congelado (semilla 42, pérdida 0,2, 10.000 paquetes).
     * Si alguien mete un Math.random() o un new Random() sin semilla en el motor, esta
     * prueba se cae. Ese es exactamente el comportamiento esperado.
     */
    @Test
    void valorLiteralCongeladoConSemilla42() {
        ResultadoSimulacion r = montecarlo.ejecutar(ENLACE, DIEZ_MIL, new Random(42));

        assertEquals(10_000L, r.totalPaquetes());
        assertEquals(12_433L, r.totalIntentos());
        assertEquals(7L, r.maxIntentos());
        assertEquals(Map.of(1L, 8043L, 2L, 1580L, 3L, 297L, 4L, 65L, 5L, 12L, 6L, 2L, 7L, 1L),
                r.histograma());
    }

    @Test
    void semillaDistintaProduceResultadoDistinto() {
        ResultadoSimulacion a = montecarlo.ejecutar(ENLACE, DIEZ_MIL, new Random(42));
        ResultadoSimulacion b = montecarlo.ejecutar(ENLACE, DIEZ_MIL, new Random(43));

        assertNotEquals(a, b);
    }

    @Test
    void arqTambienEsReproducibleConLaMismaSemilla() {
        assertEquals(
                arq.ejecutar(ENLACE, DIEZ_MIL, new Random(7)),
                arq.ejecutar(ENLACE, DIEZ_MIL, new Random(7)));
    }

    // ---- Validación del modelo (paso 4 del documento) -----------------------------------

    @Test
    void conPerdida02Y100milRepeticionesElPromedioSeAcercaA125() {
        ResultadoSimulacion r = montecarlo.ejecutar(ENLACE, new ParametrosCorrida(100_000, 1000), new Random(42));

        assertEquals(1.25, r.valorTeorico(), 1e-12);
        assertTrue(r.diferenciaRelativa() < 0.01,
                "la diferencia contra 1/(1-p) debe ser menor al 1 %, fue " + r.diferenciaRelativa());
    }

    @Test
    void laCurvaDeConvergenciaTerminaCercaDelValorTeorico() {
        ResultadoSimulacion r = montecarlo.ejecutar(ENLACE, new ParametrosCorrida(100_000, 1000), new Random(42));

        assertEquals(MontecarloTransferencia.PUNTOS_CONVERGENCIA, r.convergencia().size());
        double ultimo = r.convergencia().get(r.convergencia().size() - 1);
        assertEquals(1.25, ultimo, 0.02);
    }

    @Test
    void elTotalDePaquetesEsRepeticionesPorPaquetesDelArchivo() {
        // archivo de 10 KB con paquetes de 1 KB: 10 paquetes por transferencia
        ResultadoSimulacion r = montecarlo.ejecutar(ENLACE, new ParametrosCorrida(1_000, 10_000), new Random(42));

        assertEquals(10_000L, r.totalPaquetes());
    }

    // ---- ARQ como Las Vegas (RF-04) -----------------------------------------------------

    @Test
    void sinPerdidaElArqNecesitaExactamenteUnIntento() {
        ParametrosEnlace sinPerdida = new ParametrosEnlace(0.0, 1000, 50);

        for (long semilla = 0; semilla < 50; semilla++) {
            assertEquals(1L, arq.ejecutar(sinPerdida, DIEZ_MIL, new Random(semilla)).totalIntentos());
        }
    }

    @Test
    void elArqSiempreEntregaElPaqueteYLosIntentosVarianConLaSemilla() {
        ParametrosEnlace duro = new ParametrosEnlace(0.8, 1000, 50);
        Set<Long> intentosObservados = new HashSet<>();

        for (long semilla = 0; semilla < 200; semilla++) {
            ResultadoSimulacion r = arq.ejecutar(duro, DIEZ_MIL, new Random(semilla));
            assertEquals(1L, r.totalPaquetes());
            assertTrue(r.totalIntentos() >= 1);
            intentosObservados.add(r.totalIntentos());
        }

        assertTrue(intentosObservados.size() > 1, "con semillas distintas los intentos deben variar");
    }

    @Test
    void conPerdidaTotalSeRechazaEnVezDeColgarseEnElBucle() {
        ParametrosEnlace imposible = new ParametrosEnlace(1.0, 1000, 50);

        IllegalArgumentException e = assertThrows(IllegalArgumentException.class,
                () -> arq.ejecutar(imposible, DIEZ_MIL, new Random(1)));
        assertTrue(e.getMessage().contains("probabilidadPerdida"));
    }

    // ---- RF-01: el rechazo dice qué campo está mal --------------------------------------

    @Test
    void laValidacionNombraElCampoIncorrecto() {
        assertTrue(assertThrows(IllegalArgumentException.class,
                () -> new ParametrosEnlace(1.5, 1000, 50)).getMessage().contains("probabilidadPerdida"));
        assertTrue(assertThrows(IllegalArgumentException.class,
                () -> new ParametrosEnlace(0.2, -5, 50)).getMessage().contains("tamanoPaqueteBytes"));
        assertTrue(assertThrows(IllegalArgumentException.class,
                () -> new ParametrosEnlace(0.2, 1000, 0)).getMessage().contains("rttMs"));
    }
}