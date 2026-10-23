// Formatos de presentación compartidos por toda la app.
// Centralizarlos acá evita que cada pantalla muestre precios o fechas de forma distinta.
import type { Monto } from "@/types";

const LOCALE = "es-AR";

const formateadorPrecio = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function aNumero(valor: Monto): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

/** 16000 → "$ 16.000". Si no hay precio cargado devuelve "A consultar". */
export function formatPrecio(valor: Monto): string {
  const n = aNumero(valor);
  return n === null || n <= 0 ? "A consultar" : formateadorPrecio.format(n);
}

/** Para totales calculados, donde 0 es un valor válido: 0 → "$ 0". */
export function formatMonto(valor: number): string {
  return formateadorPrecio.format(valor);
}

/** 4.333 → "4,3". Sin reseñas devuelve null para que la UI muestre "Nuevo". */
export function formatCalificacion(valor: Monto): string | null {
  const n = aNumero(valor);
  return n === null || n <= 0 ? null : n.toLocaleString(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatDiaLargo(fecha: Date): string {
  const texto = fecha.toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatHora(fecha: Date): string {
  return fecha.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}

const NOMBRES_NIVEL: Record<string, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export function formatNivel(nivel: string | null | undefined): string {
  if (!nivel) return "Todos los niveles";
  return NOMBRES_NIVEL[nivel.toLowerCase()] ?? `Nivel ${nivel}`;
}

export function nombreCompleto(usuario?: { nombre: string; apellido: string }): string {
  return usuario ? `${usuario.nombre} ${usuario.apellido}` : "";
}

export function iniciales(usuario?: { nombre: string; apellido: string }): string {
  return usuario ? `${usuario.nombre[0] ?? ""}${usuario.apellido[0] ?? ""}`.toUpperCase() : "?";
}

/** Edad en años a partir de una fecha "AAAA-MM-DD". Devuelve null si no hay fecha. */
export function edadDesde(fechaNacimiento: string | null | undefined, hoy: Date = new Date()): number | null {
  if (!fechaNacimiento) return null;
  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return null;
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

/** "jueves 24/10 · 18:30" para mostrar una fecha corta con hora. */
export function formatFechaCorta(fecha: Date): string {
  const dia = fecha.toLocaleDateString(LOCALE, { weekday: "short", day: "numeric", month: "numeric" }).replace(".", "");
  return `${dia} · ${formatHora(fecha)}`;
}

/** plural(1, "clase", "clases") → "1 clase"; plural(3, ...) → "3 clases". */
export function plural(cantidad: number, singular: string, enPlural: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : enPlural}`;
}

/** Normaliza texto para búsquedas: minúsculas y sin acentos ("Gómez" encuentra "gomez"). */
export function normalizarTexto(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
