"use strict";

// Variables de estado proporcionadas para facilitar el arranque.
let estado = "SIN_COTIZACION";
let totalPendiente = 0;
let finCotizacion = 0;
let idIntervalo = null;
let operaciones = 0;
let acumulado = 0;
let ultimaReferencia = "—";

const ETIQUETAS_ESTADO = {
  SIN_COTIZACION: "SIN COTIZACIÓN",
  COTIZADA: "COTIZADA",
  INVALIDADA: "INVALIDADA",
  CADUCADA: "CADUCADA",
  CANCELADA: "CANCELADA",
  CONFIRMADA: "CONFIRMADA"
};

const DESCRIPCION_POLITICA = [
  "A: 1-3 plazas 0 %, 4-6 plazas 8 %, 7 o más 13 %.",
  "B: 9 % por la tarde y 4 % más con 5 o más plazas.",
  "C: premium 12 %; si no, 6 % con 6 o más plazas.",
  "D: 1,75 € por cada pareja de plazas, máximo 20 % del subtotal."
];

function mostrarMensaje(texto, tipo) {
  $("#mensaje").removeClass("error exito").addClass(tipo || "").text(texto);
}
// TODO A1: mostrar los datos derivados del perfil en la cabecera.
function mostrarPerfil() {
  $("#nombrePerfil").text(`${PERFIL.identificador} · ${PERFIL.tema}`);
  $("#descripcionPerfil").text(PERFIL.descripcion);
  $("#etiquetaCodigo").text(`Semilla ${SEMILLA}`);
  $("#etiquetaVariante").text(`Política ${"ABCD"[VARIANTE]} (variante ${VARIANTE})`);
  $("#etiquetaLimite").text(`Máximo ${MAX_UNIDADES} unidades`);
  $("#etiquetaRecargo").text(`Recargo ${RECARGO_PORCENTAJE} %`);
  $("#etiquetaTiempo").text(`${SEGUNDOS_VALIDEZ} s para confirmar`);
}

