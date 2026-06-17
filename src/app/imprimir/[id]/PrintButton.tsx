"use client";

export function PrintButton() {
  const imprimir = () => {
    const contenido = document.getElementById('ticket-content');
    if (!contenido) return;

    const ventana = window.open('', '_blank', 'width=794,height=528');
    if (!ventana) return;

    ventana.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <title></title>
  <meta charset="UTF-8"/>
  <style>
    @page {
      size: 8.5in 5.5in;
      margin: 5mm 7mm;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 8.5in;
      height: 5.5in;
      overflow: hidden;
      font-family: Arial, sans-serif;
      font-size: 7.5pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    #wrapper {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    img {
      max-width: 100%;
    }
    img.logo {
      width: 65px !important;
      height: 65px !important;
      object-fit: contain !important;
    }
    * {
      box-sizing: border-box;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div id="wrapper">
    ${contenido.innerHTML}
  </div>
</body>
</html>`);

    ventana.document.close();
    ventana.onload = () => {
      setTimeout(() => {
        ventana.focus();
        ventana.print();
        ventana.close();
      }, 500);
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
