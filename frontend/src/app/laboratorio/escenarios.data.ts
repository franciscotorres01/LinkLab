export interface Escenario {
  id: string;
  nombre: string;
  descripcion: string;
  perdida: number; // porcentaje
  paqueteBytes: number;
  rttMs: number;
  ejecuciones: number;
  color: 'purple' | 'orange' | 'teal' | 'green' | 'red' | 'blue';
}

export const ESCENARIOS: Escenario[] = [
  { id: 'fibra',    nombre: 'Fibra local',          descripcion: 'Baja latencia y enlace estable',      perdida: 4,  paqueteBytes: 1500, rttMs: 12,  ejecuciones: 2, color: 'purple' },
  { id: 'satelite', nombre: 'Enlace satelital',     descripcion: 'Alta latencia y pérdida moderada',    perdida: 20, paqueteBytes: 1200, rttMs: 580, ejecuciones: 1, color: 'orange' },
  { id: 'wifi',     nombre: 'WiFi congestionado',   descripcion: 'Canal compartido con interferencias', perdida: 12, paqueteBytes: 1400, rttMs: 78,  ejecuciones: 2, color: 'teal' },
  { id: 'sucursal', nombre: 'Sucursal corporativa', descripcion: 'VPN sobre enlace empresarial',        perdida: 7,  paqueteBytes: 1350, rttMs: 45,  ejecuciones: 1, color: 'green' },
  { id: '5g',       nombre: '5G urbano',            descripcion: 'Movilidad y cobertura variable',      perdida: 9,  paqueteBytes: 1280, rttMs: 32,  ejecuciones: 0, color: 'red' },
  { id: 'iot',      nombre: 'IoT rural',            descripcion: 'Paquetes pequeños en red limitada',   perdida: 26, paqueteBytes: 512,  rttMs: 240, ejecuciones: 0, color: 'blue' },
];
