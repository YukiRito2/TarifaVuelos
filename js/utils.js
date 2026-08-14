window.Celina = window.Celina || {};

Celina.utils = (function(){
  const MESES = Celina.config.MESES;

  function formatMoney(n){
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2
    }).format(Number(n || 0));
  }

  function formatDate(iso){
    if(!iso) return "—";
    const parts = iso.split("-").map(Number);
    if(parts.length !== 3) return iso;
    const [y, m, d] = parts;
    return `${d} ${MESES[m - 1]} ${y}`;
  }

  /**
   * Formatea un timestamp ISO completo (ej. quote.createdAt) como
   * fecha + hora local, a diferencia de formatDate() que solo maneja
   * fechas simples "YYYY-MM-DD" de los campos <input type="date">.
   */
  function formatDateTime(iso){
    if(!iso) return "—";
    const date = new Date(iso);
    if(isNaN(date.getTime())) return "—";
    const d = date.getDate();
    const m = MESES[date.getMonth()];
    const y = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${d} ${m} ${y}, ${hh}:${mm}`;
  }

  /**
   * Convierte { adultos, ninos, bebes } en un texto legible, ej.
   * "2 Adultos, 1 Niño". Omite categorías en cero. Cotizaciones
   * guardadas antes de que existiera este campo no tienen
   * `pasajeros`, así que se asume 1 adulto por defecto.
   */
  function formatPassengers(pasajeros){
    const p = pasajeros || { adultos: 1, ninos: 0, bebes: 0 };
    const parts = [];
    if(p.adultos > 0) parts.push(`${p.adultos} ${p.adultos === 1 ? "Adulto" : "Adultos"}`);
    if(p.ninos > 0) parts.push(`${p.ninos} ${p.ninos === 1 ? "Niño" : "Niños"}`);
    if(p.bebes > 0) parts.push(`${p.bebes} ${p.bebes === 1 ? "Bebé" : "Bebés"}`);
    return parts.length ? parts.join(", ") : "—";
  }

  /**
   * Escapa caracteres HTML especiales. Se usa antes de insertar texto
   * de cotizaciones (nombre del cliente, origen, destino) dentro de
   * innerHTML en el historial — sin esto, alguien podría escribir
   * "<img src=x onerror=...>" como nombre de cliente y ejecutar script
   * en la pantalla de cualquier otro agente que vea el historial.
   */
  function escapeHtml(value){
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showToast(message){
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");
  }

  return { formatMoney, formatDate, formatDateTime, formatPassengers, escapeHtml, showToast };
})();
