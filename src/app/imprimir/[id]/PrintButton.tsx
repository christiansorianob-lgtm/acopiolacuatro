"use client";

export function PrintButton() {
  const imprimir = () => {
    const contenido = document.getElementById('ticket-content')?.innerHTML;
    if (!contenido) return;

    const ventana = window.open('', '_blank', 'width=816,height=528');
    if (!ventana) {
      alert("Por favor habilita las ventanas emergentes (pop-ups) para imprimir el tiquete.");
      return;
    }

    ventana.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title></title>
          <style>
            @page {
              size: 8.5in 5.5in;
              margin: 4mm 6mm;
            }
            * {
              box-sizing: border-box;
              page-break-inside: avoid;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 7.5px;
              width: 8.5in;
              max-height: 5.5in;
              overflow: hidden;
            }
            #ticket-content {
              width: 100%;
              max-height: 5.5in;
            }
            /* Reducir todos los paddings internos */
            .seccion { padding: 4px 6px; }
            .header-empresa { padding: 4px 6px; }
            .bloque-pesos { padding: 4px; }
            .firmas { padding-top: 28px; }
          </style>
        </head>
        <body>
          <div id="ticket-content">${contenido}</div>
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.onload = () => {
      ventana.focus();
      ventana.print();
      ventana.close();
    };
  };

  return (
    <button 
      onClick={imprimir} 
      className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center gap-2 mx-auto sm:mx-0"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect width="12" height="8" x="6" y="14"></rect></svg>
      Imprimir Tiquete
    </button>
  );
}
