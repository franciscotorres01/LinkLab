package com.linklab.escenario;

public enum Escenario {
    FIBRA_LOCAL("Fibra local", "Enlace estable de baja latencia", 0.01, 1400, 5),
    SUCURSAL_CORPORATIVA("Sucursal corporativa", "Red empresarial con pérdida moderada", 0.05, 1400, 20),
    WIFI_CONGESTIONADO("WiFi congestionado", "Red inalámbrica saturada", 0.10, 1400, 45),
    RED_MOVIL("Red móvil 4G", "Cobertura variable en movimiento", 0.08, 1200, 70),
    VPN_INTERCONTINENTAL("VPN intercontinental", "Alta latencia y pérdida media", 0.12, 1300, 180),
    ENLACE_SATELITAL("Enlace satelital", "Latencia muy alta", 0.15, 1400, 600);

    private final String nombre;
    private final String descripcion;
    private final double probabilidadPerdida;
    private final int tamanoPaqueteBytes;
    private final double rttMs;

    Escenario(String nombre, String descripcion, double p, int paquete, double rtt) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.probabilidadPerdida = p;
        this.tamanoPaqueteBytes = paquete;
        this.rttMs = rtt;
    }

    public String getNombre() { return nombre; }
    public String getDescripcion() { return descripcion; }
    public double getProbabilidadPerdida() { return probabilidadPerdida; }
    public int getTamanoPaqueteBytes() { return tamanoPaqueteBytes; }
    public double getRttMs() { return rttMs; }
}