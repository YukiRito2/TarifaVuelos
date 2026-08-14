window.Celina = window.Celina || {};

Celina.preview = (function(){
  const { formatMoney, formatDate, formatPassengers } = Celina.utils;

  /**
   * Pinta una cotización en la tarjeta de vista previa y la marca como
   * la cotización "activa" (la que usan los botones de exportación).
   */
  function setCurrentQuote(quote){
    Celina.state.currentQuote = quote;

    document.getElementById("previewEmpty").style.display = "none";
    document.getElementById("previewContent").style.display = "block";

    document.getElementById("pv-cliente").textContent = quote.cliente;
    document.getElementById("pv-origen").textContent = quote.origen;
    document.getElementById("pv-destino").textContent = quote.destino;
    document.getElementById("pv-ida").textContent = formatDate(quote.fechaIda);
    document.getElementById("pv-vuelta").textContent = quote.fechaVuelta ? formatDate(quote.fechaVuelta) : "Solo ida";
    document.getElementById("pv-equipaje").textContent = quote.equipaje;
    document.getElementById("pv-pasajeros").textContent = formatPassengers(quote.pasajeros);
    document.getElementById("pv-telefono").textContent = quote.telefono;
    document.getElementById("pv-tarifa").textContent = formatMoney(quote.tarifaBase);
    document.getElementById("pv-tasas").textContent = formatMoney(quote.tasas);
    document.getElementById("pv-total").textContent = formatMoney(quote.total);
    document.getElementById("pv-notas").textContent = quote.notas;
  }

  function clearPreview(){
    Celina.state.currentQuote = null;
    document.getElementById("previewContent").style.display = "none";
    document.getElementById("previewEmpty").style.display = "block";
  }

  return { setCurrentQuote, clearPreview };
})();
