"use strict";

// TODO M1: según el servicio, devolver el precio en céntimos (1150, 1925, 3275).
function precioCentimos(servicio) {
  switch (servicio) {
    case "basico":
      return 1150;
    case "estandar":
      return 1925;
    case "premium":
      return 3275;
      return 0;
  }
}

// TODO M2: devolver "" si todo es válido, o un MENSAJE claro si hay error.
// Obligatorio comprobar servicio, turno, vacío, NaN, decimales, [1, limite]
// Y la restricción de la temática personal. Además, el perfil no puede quedarse sin personalizar.
function validarSolicitud(servicio, cantidadTexto, turno, limite, tema) {
  if (PERFIL.identificador.trim() === "" || PERFIL.identificador === "cambia-este-id" ||
      PERFIL.descripcion.trim() === "" || PERFIL.descripcion.startsWith("Describe en una frase")) {
    return "Personaliza primero js/perfil.js: identificador y descripción.";
  }
  if (!["tecnologia", "deporte", "musica", "cine"].includes(tema)) {
    return "La temática del perfil no es válida.";
  }
  if (servicio !== "basico" && servicio !== "estandar" && servicio !== "premium") {
    return "Selecciona un servicio.";
  }
  if (turno !== "manana" && turno !== "tarde") {
    return "Selecciona una franja (mañana o tarde).";
  }
  const texto = String(cantidadTexto).trim();
  if (texto === "") return "Introduce el número de unidades.";
  const n = Number(texto);
  if (!Number.isFinite(n)) return "Las unidades deben ser un número.";
  if (!Number.isInteger(n)) return "Las unidades no pueden tener decimales.";
  if (n < 1) return "Las unidades deben ser al menos 1.";
  if (n > limite) return `Máximo ${limite} unidades.`;

  if (tema === "tecnologia" && servicio === "premium" && n < 2) {
    return "En tecnología, el servicio premium exige al menos 2 plazas.";
  }
  if (tema === "deporte" && servicio === "basico" && turno === "tarde") {
    return "En deporte no se puede contratar el servicio básico por la tarde.";
  }
  if (tema === "musica" && servicio === "estandar" && turno === "tarde" && n > 3) {
    return "En música, el estándar por la tarde admite como máximo 3 plazas.";
  }
  if (tema === "cine" && servicio === "premium" && n % 2 !== 0) {
    return "En cine, el servicio premium exige una cantidad par de plazas.";
  }
  return "Pendiente de implementar validación.";
}

// TODO M3: aplicar EXACTAMENTE la política que corresponda a variante (0-3).
// Trabajar siempre en céntimos y aplicar Math.round cuando haya porcentaje.
function calcularDescuento(subtotal, cantidad, servicio, turno, variante) {
  let porcentaje = 0;
  switch (variante) {
    case 0:
      if (cantidad >= 7) porcentaje = 13;
      else if (cantidad >= 4) porcentaje = 8;
      break;
    case 1:
      if (turno === "tarde") porcentaje += 9;
      if (cantidad >= 5) porcentaje += 4;
      break;
    case 2:
      if (servicio === "premium") porcentaje = 12;
      else if (cantidad >= 6) porcentaje = 6;
      break;
    case 3: {
      const descuento = Math.floor(cantidad / 2) * 175;
      const tope = Math.floor(subtotal * 20 / 100);
      return Math.min(descuento, tope);
    }
  }
  return Math.round(subtotal * porcentaje / 100);

}

// TODO M4: calcular el recargo porcentual sobre el SUBTOTAL, con redondeo.
function calcularRecargo(subtotal, porcentaje) {
  return Math.round(subtotal * porcentaje / 100);;
}

// TODO M5: DWEC-IDENTIFICADOR-0001 (secuencia de cuatro cifras como mínimo).
function construirReferencia(identificador, contador) {
  return `DWEC-${identificador.toUpperCase()}-${String(contador).
  padStart(4, "0")}`;
}

// TODO M6: formatear 12345 céntimos como "123,45 €".
function euros(centimos) {
  const signo = centimos < 0 ? "-" : "";
  const abs = Math.abs(centimos);
  const parteEntera = Math.floor(abs / 100);
  const parteCentimos = String(abs % 100).padStart(2, "0");
  return `${signo}${parteEntera},${parteCentimos} €`;
}
