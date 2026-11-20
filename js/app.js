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

// TODO A2: actualizar los tres indicadores de operaciones confirmadas.
function actualizarResumen() {
  $("#operaciones").text(operaciones);
  $("#acumulado").text(euros(acumulado));
  $("#ultima").text(ultimaReferencia);
  if (ultimaReferencia === "—") {
    $("#referencia").text("Todavía no hay operación confirmada.");
  } else {
    $("#referencia").text(`Última referencia: ${ultimaReferencia}`);
  }
}

// TODO A3: leer los tres valores de localStorage de este perfil, sanearlos,
// y llamar a actualizarResumen(). Si no existen, usar 0, 0, "—".
function recuperarHistorico() {
  let ops = 0;
  let acum = 0;
  let ref = "—";
  try {
    const o = Number(localStorage.getItem(PREFIJO_STORAGE + "operaciones"));
    const a = Number(localStorage.getItem(PREFIJO_STORAGE + "acumulado"));
    const r = localStorage.getItem(PREFIJO_STORAGE + "ultimaReferencia");
    if (Number.isInteger(o) && o >= 0) ops = o;
    if (Number.isInteger(a) && a >= 0) acum = a;
    if (typeof r === "string" && r.startsWith("DWEC-")) ref = r;
  } catch (error) {
    ops = 0;
    acum = 0;
    ref = "—";
  }
  operaciones = ops;
  acumulado = acum;
  ultimaReferencia = ref;
  actualizarResumen();
}

// TODO A4: guardar en localStorage operaciones, acumulado y ultimaReferencia.
function guardarHistorico() {
  try {
    localStorage.setItem(PREFIJO_STORAGE + "operaciones", String(operaciones));
    localStorage.setItem(PREFIJO_STORAGE + "acumulado", String(acumulado));
    localStorage.setItem(PREFIJO_STORAGE + "ultimaReferencia", ultimaReferencia);
  } catch (error) {
    mostrarMensaje("No se ha podido guardar el histórico en este navegador.", "error");
  }
}

// TODO A5: detener el intervalo previo y reiniciar el instante de caducidad.
function detenerReloj() {
  if (idIntervalo !== null) {
    clearInterval(idIntervalo);
  }
  idIntervalo = null;
  finCotizacion = 0;
}

