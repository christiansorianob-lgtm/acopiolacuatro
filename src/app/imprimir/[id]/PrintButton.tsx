"use client";

export function PrintButton() {
  return (
    <div className="mt-12 text-center print:hidden">
      <button 
        onClick={() => window.print()} 
        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
      >
        Imprimir Tiquete
      </button>
    </div>
  );
}
