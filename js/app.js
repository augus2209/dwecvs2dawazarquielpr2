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

// TODO A6: reiniciar las cuatro cifras de la cotización y desactivar Confirmar.
function vaciarResumenCotizacion() {
  $("#subtotal").text("—");
  $("#descuento").text("—");
  $("#recargo").text("—");
  $("#total").text("—");
  $("#razonDescuento").text("La política de descuento aparecerá al cotizar.");
  $("#temporizador").text("-- s");
  totalPendiente = 0;
  $("#confirmar").prop("disabled", true);
}

// TODO A7: actualizar estado y habilitar Confirmar SOLO en estado COTIZADA.
function cambiarEstado(nuevo) {
  estado = nuevo;
  $("#estado").text(ETIQUETAS_ESTADO[nuevo] || nuevo);
  $("#confirmar").prop("disabled", estado !== "COTIZADA");
}

// TODO A8: invalidar una cotización activa si cambian campos del formulario.
function invalidarCotizacion(motivo) {
  if (estado !== "COTIZADA") return;
  detenerReloj();
  vaciarResumenCotizacion();
  cambiarEstado("INVALIDADA");
  mostrarMensaje(motivo, "error");
}

// TODO A9: mostrar segundos restantes, controlar caducidad e impedir confirmar.
function actualizarCuentaAtras() {
  if (estado !== "COTIZADA") return;
  const restante = Math.ceil((finCotizacion - Date.now()) / 1000);
  if (restante <= 0) {
    detenerReloj();
    vaciarResumenCotizacion();
    cambiarEstado("CADUCADA");
    $("#temporizador").text("0 s");
    mostrarMensaje("La cotización ha caducado. Vuelve a cotizar.", "error");
    return;
  }
  $("#temporizador").text(`${restante} s`);
}

// TODO A10: validar, calcular subtotal/descuento/recargo/total en céntimos,
// mostrar desglose, iniciar cuenta atrás y pasar a COTIZADA.
function cotizar() {
  const servicio = $("#servicio").val();
  const cantidadTexto = $("#cantidad").val();
  const turno = $("#turno").val();

  const error = validarSolicitud(servicio, cantidadTexto, turno, MAX_UNIDADES, PERFIL.tema);
  if (error !== "") {
    detenerReloj();
    vaciarResumenCotizacion();
    cambiarEstado("SIN_COTIZACION");
    mostrarMensaje(error, "error");
    return;
  }

  const cantidad = Number(String(cantidadTexto).trim());
  const subtotal = precioCentimos(servicio) * cantidad;
  const descuento = calcularDescuento(subtotal, cantidad, servicio, turno, VARIANTE);
  const recargo = calcularRecargo(subtotal, RECARGO_PORCENTAJE);
  const total = subtotal - descuento + recargo;

  totalPendiente = total;
  $("#subtotal").text(euros(subtotal));
  $("#descuento").text(`−${euros(descuento)}`);
  $("#recargo").text(`+${euros(recargo)}`);
  $("#total").text(euros(total));
  $("#razonDescuento").text(`Política ${DESCRIPCION_POLITICA[VARIANTE]}`);

  detenerReloj();
  cambiarEstado("COTIZADA");
  finCotizacion = Date.now() + SEGUNDOS_VALIDEZ * 1000;
  idIntervalo = setInterval(actualizarCuentaAtras, 250);
  actualizarCuentaAtras();
  mostrarMensaje(`Cotización correcta. Tienes ${SEGUNDOS_VALIDEZ} segundos para confirmar.`, "exito");
}

// TODO A11: solo confirmar una cotización vigente. Actualizar histórico,
// referencia secuencial y persistencia SIN contabilizar duplicados.
function confirmar() {
  if (estado !== "COTIZADA") return;
  if (Date.now() >= finCotizacion) {
    actualizarCuentaAtras();
    return;
  }
  cambiarEstado("CONFIRMADA");
  detenerReloj();
  $("#temporizador").text("-- s");

  operaciones += 1;
  acumulado += totalPendiente;
  ultimaReferencia = construirReferencia(PERFIL.identificador, operaciones);
  guardarHistorico();
  actualizarResumen();
  mostrarMensaje(`Presupuesto confirmado: ${euros(totalPendiente)}. Referencia ${ultimaReferencia}.`, "exito");
}

// TODO A12: cancelar cotización sin alterar histórico confirmado.
function cancelar() {
  if (estado !== "COTIZADA") {
    mostrarMensaje("No hay ninguna cotización activa para cancelar.", "");
    return;
  }
  detenerReloj();
  vaciarResumenCotizacion();
  cambiarEstado("CANCELADA");
  mostrarMensaje("Cotización cancelada. El histórico no ha cambiado.", "");
}

// TODO A13: tema oscuro/claro con persistencia localStorage.
function alternarTema() {
  const actual = document.documentElement.getAttribute("data-theme");
  const nuevo = actual === "oscuro" ? "claro" : "oscuro";
  document.documentElement.setAttribute("data-theme", nuevo);
  try {
    localStorage.setItem(PREFIJO_STORAGE + "modo", nuevo);
  } catch (error) {
    mostrarMensaje("No se ha podido recordar el tema.", "error");
  }
}

function restaurarTema() {
  try {
    const guardado = localStorage.getItem(PREFIJO_STORAGE + "modo");
    if (guardado === "claro" || guardado === "oscuro") {
      document.documentElement.setAttribute("data-theme", guardado);
    }
  } catch (error) {
  }
}

function reiniciarHistorico() {
  if (!window.confirm("¿Seguro que quieres reiniciar el histórico? Se pondrá todo a cero.")) return;
  operaciones = 0;
  acumulado = 0;
  ultimaReferencia = "—";
  guardarHistorico();
  actualizarResumen();
  mostrarMensaje("Histórico reiniciado.", "");
}

$(document).ready(function () {
  mostrarPerfil();
  restaurarTema();
  recuperarHistorico();
  vaciarResumenCotizacion();
  cambiarEstado("SIN_COTIZACION");

  $("#formPresupuesto").on("submit", function (evento) {
    evento.preventDefault();
    cotizar();
  });
  $("#confirmar").on("click", confirmar);
  $("#cancelar").on("click", cancelar);
  $("#cambiarTema").on("click", alternarTema);
  $("#reiniciar").on("click", reiniciarHistorico);
  $("#servicio, #cantidad, #turno").on("input change", function () {
    invalidarCotizacion("Has cambiado un dato: la cotización anterior ya no es válida. Vuelve a cotizar.");
  });
});

function restaurarTurno() {
  try {
    const guardado = sessionStorage.getItem(PREFIJO_STORAGE + "turno");
    if (guardado === "manana" || guardado === "tarde") {
      $("#turno").val(guardado);
    }
  } catch (error) {
  }
}

