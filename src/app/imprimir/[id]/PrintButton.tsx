"use client";

export function PrintButton({ tiquete }: { tiquete: any }) {
  const imprimir = () => {
    window.open(`/imprimir/${tiquete.id}?print=1`, '_blank', 'width=816,height=528');
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
