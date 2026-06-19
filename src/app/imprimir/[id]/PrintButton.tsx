"use client";

import { useState } from 'react';

export function PrintButton({ tiquete }: { tiquete: any }) {
  const [imprimiendo, setImprimiendo] = useState(false);

  const imprimir = async () => {
    try {
      setImprimiendo(true);
      const res = await fetch(`/api/imprimir/${tiquete.publicToken}`);
      
      if (!res.ok) {
        throw new Error('Error al generar el tiquete');
      }
      
      const html = await res.text();
      const ventana = window.open('', '_blank');
      
      if (ventana) {
        ventana.document.open();
        ventana.document.write(html);
        ventana.document.close();
        
        setTimeout(() => {
          ventana.print();
        }, 300);
      } else {
        alert('Por favor, permite las ventanas emergentes (pop-ups) para imprimir.');
      }
    } catch (error) {
      console.error('Error al imprimir:', error);
      alert('Hubo un error de conexión al generar el tiquete.');
    } finally {
      setImprimiendo(false);
    }
  };

  return (
    <button 
      onClick={imprimir} 
      disabled={imprimiendo}
      className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center gap-2 mx-auto sm:mx-0 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect width="12" height="8" x="6" y="14"></rect></svg>
      {imprimiendo ? 'Generando...' : 'Imprimir Tiquete'}
    </button>
  );
}
