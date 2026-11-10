package com.linklab.simulacion.motor;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/**
 * Restricción del proyecto convertida en prueba: nada de Math.random() ni de new Random()
 * sin argumento dentro del código de simulación. El generador siempre entra desde afuera.
 */
class SinAleatoriedadSinSemillaTest {

    private static final Path CODIGO_DEL_MOTOR = Path.of("src/main/java/com/linklab/simulacion/motor");

    private static final List<String> PROHIBIDO = List.of(
            "Math.random", "new Random()", "ThreadLocalRandom", "SecureRandom");

    @Test
    void elMotorNoCreaGeneradoresPropiosNiUsaAleatoriedadGlobal() throws IOException {
        assertTrue(Files.isDirectory(CODIGO_DEL_MOTOR),
                "esta prueba debe correr desde la raíz del módulo; no existe " + CODIGO_DEL_MOTOR.toAbsolutePath());

        try (Stream<Path> archivos = Files.list(CODIGO_DEL_MOTOR)) {
            for (Path archivo : archivos.filter(p -> p.toString().endsWith(".java")).toList()) {
                String fuente = Files.readString(archivo);
                for (String patron : PROHIBIDO) {
                    assertFalse(fuente.contains(patron),
                            archivo.getFileName() + " contiene '" + patron + "': el Random debe inyectarse con semilla");
                }
            }
        }
    }

    @Test
    void elMotorNoDependeDeSpring() throws IOException {
        try (Stream<Path> archivos = Files.list(CODIGO_DEL_MOTOR)) {
            for (Path archivo : archivos.filter(p -> p.toString().endsWith(".java")).toList()) {
                assertFalse(Files.readString(archivo).contains("org.springframework"),
                        archivo.getFileName() + " importa Spring: el motor debe ser Java plano");
            }
        }
    }
}