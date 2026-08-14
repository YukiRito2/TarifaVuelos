window.Celina = window.Celina || {};

Celina.exportActions = (function(){
  const { formatMoney, formatDate, formatPassengers, showToast } = Celina.utils;

  function buildWhatsAppText(q){
    return (
`✈️ *CELINA AGENCIA DE VIAJES* ✈️
━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${q.cliente}
🏙️ *Ruta:* ${q.origen} ➜ ${q.destino}
📅 *Ida:* ${formatDate(q.fechaIda)}
📅 *Vuelta:* ${q.fechaVuelta ? formatDate(q.fechaVuelta) : "Solo ida"}
🧑‍🤝‍🧑 *Pasajeros:* ${formatPassengers(q.pasajeros)}
🧳 *Equipaje:* ${q.equipaje}

💰 *Detalle tarifa*
  • Tarifa base: ${formatMoney(q.tarifaBase)}
  • Tasas e impuestos: ${formatMoney(q.tasas)}
  • *Total a pagar: ${formatMoney(q.total)}*

📝 *Notas:* ${q.notas}
━━━━━━━━━━━━━━━━━━
✉️ celina.env.r@gmail.com
📞 WhatsApp: +34 621 20 17 17
☎️ Teléfono: +34 621 42 80 21
📍 La Seu d'Urgell
━━━━━━━━━━━━━━━━━━
¡Gracias por elegirnos! 🌎💙`
    );
  }

  function withHiddenActions(callback){
    const card = document.getElementById("flightCard");
    card.classList.add("capturing");
    return Promise.resolve()
      .then(callback)
      .finally(() => card.classList.remove("capturing"));
  }

  async function handleCopyWhatsapp(){
    const currentQuote = Celina.state.currentQuote;
    if(!currentQuote){ showToast("⚠️ Primero guarda o selecciona una cotización"); return; }

    const text = buildWhatsAppText(currentQuote);
    try{
      await navigator.clipboard.writeText(text);
      showToast("✅ Texto copiado, listo para pegar en WhatsApp");
    }catch(err){
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try{
        document.execCommand("copy");
        showToast("✅ Texto copiado, listo para pegar en WhatsApp");
      }catch(e){
        showToast("⚠️ No se pudo copiar automáticamente");
      }
      document.body.removeChild(textarea);
    }
  }

  function handleDownloadPdf(){
    const currentQuote = Celina.state.currentQuote;
    if(!currentQuote){ showToast("⚠️ Primero guarda o selecciona una cotización"); return; }

    const btn = document.getElementById("btnPdf");
    const card = document.getElementById("flightCard");
    btn.disabled = true;
    btn.textContent = "⏳ Generando PDF...";

    const filename = `Celina_${currentQuote.origen}-${currentQuote.destino}_${currentQuote.id}.pdf`;
    const marginIn = 0.4;
    const printWidthIn = 6;

    withHiddenActions(() => {
      // Reutiliza exactamente la misma captura que usa el botón PNG (la
      // que ya se ve bien), y se la pasa a html2pdf.js como una imagen
      // lista con .from(canvas, "canvas") — así html2pdf NO vuelve a
      // renderizar el HTML por su cuenta, solo empaqueta esa imagen en
      // un PDF de una sola página, dimensionada a su propia proporción.
      return html2canvas(card, { scale: 3, useCORS: true, backgroundColor: "#F3E5F5" })
        .then(canvas => {
          const contentHeightIn = printWidthIn * (canvas.height / canvas.width);
          const pageWidthIn = printWidthIn + marginIn * 2;
          const pageHeightIn = contentHeightIn + marginIn * 2;

          return html2pdf().set({
            margin: marginIn,
            filename: filename,
            image: { type: "jpeg", quality: 0.98 },
            jsPDF: {
              unit: "in",
              format: [pageWidthIn, pageHeightIn],
              orientation: pageHeightIn >= pageWidthIn ? "portrait" : "landscape"
            }
          }).from(canvas, "canvas").save();
        });
    })
    .then(() => showToast("✅ PDF descargado con éxito"))
    .catch(err => {
      console.error("Error al generar el PDF:", err);
      showToast(`⚠️ Error al generar el PDF: ${err && err.message ? err.message : err}`);
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = "📥 Descargar PDF";
    });
  }

  function handleSavePng(){
    const currentQuote = Celina.state.currentQuote;
    if(!currentQuote){ showToast("⚠️ Primero guarda o selecciona una cotización"); return; }

    const btn = document.getElementById("btnPng");
    const card = document.getElementById("flightCard");
    btn.disabled = true;
    btn.textContent = "⏳ Generando imagen...";

    withHiddenActions(() => {
      return html2canvas(card, { scale: 3, useCORS: true, backgroundColor: "#E0F7FA" })
        .then(canvas => new Promise((resolve) => {
          canvas.toBlob(async (blob) => {
            if(!blob){ resolve(); return; }

            if(navigator.clipboard && window.ClipboardItem){
              try{
                await navigator.clipboard.write([ new ClipboardItem({ "image/png": blob }) ]);
                showToast("✅ Imagen copiada al portapapeles");
                resolve();
                return;
              }catch(err){
                // continúa al fallback de descarga
              }
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Celina_${currentQuote.origen}-${currentQuote.destino}_${currentQuote.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast("✅ Imagen descargada (PNG)");
            resolve();
          }, "image/png");
        }));
    })
    .catch(err => {
      console.error("Error al generar la imagen:", err);
      showToast(`⚠️ Error al generar la imagen: ${err && err.message ? err.message : err}`);
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = "🖼️ Guardar PNG";
    });
  }

  return { buildWhatsAppText, handleCopyWhatsapp, handleDownloadPdf, handleSavePng };
})();
