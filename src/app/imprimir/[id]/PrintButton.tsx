"use client";

export function PrintButton() {
  const imprimir = () => {
    const content = document.getElementById('ticket-content')?.outerHTML || '';
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\\n');

    const ventana = window.open('', '_blank', 'width=850,height=550');
    if (!ventana) {
      alert("Por favor habilita las ventanas emergentes (pop-ups) para imprimir el tiquete.");
      return;
    }

    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tiquete Báscula</title>
        ${styles}
        <style>
          @page {
            size: 8.5in 5.5in landscape;
            margin: 5mm 8mm;
          }
          body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
          }
          /* Ensure wrapper takes full page but doesn't overflow */
          #ticket-content {
            max-height: 5.3in;
            overflow: hidden;
            page-break-after: avoid;
            page-break-inside: avoid;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          * {
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        ${content}
        <script>
          // Esperar a que los estilos y fuentes se apliquen
          setTimeout(() => {
            window.focus();
            window.print();
            window.close();
          }, 500);
        </script>
      </body>
      </html>
    `);
    ventana.document.close();
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
