import { prisma } from '@/lib/prisma';
import { generarFirmaTiquete } from '@/lib/crypto';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function VerificarPage({ searchParams }: { searchParams: Promise<{ token: string }> }) {
  try {
    const { token } = await searchParams;
    
    if (!token || token.length < 10) {
      return <InvalidState message="Enlace de verificacion invalido o incompleto." />;
    }

    const tiquete = await prisma.tiquetes.findUnique({
      where: { publicToken: token }
    });

    if (!tiquete) {
      return <InvalidState message="Tiquete no encontrado en la base de datos." />;
    }

    // Valid
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-emerald-500 p-6 flex flex-col items-center justify-center text-white">
            <ShieldCheck className="w-16 h-16 mb-2" />
            <h1 className="text-2xl font-black">!Tiquete Valido!</h1>
            <p className="text-emerald-100 font-medium">Este documento es autentico</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Tiquete N°</p>
              <p className="text-xl font-black text-slate-900">#{tiquete.numero.toString().padStart(4, '0')}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Vehiculo / Placa</p>
              <p className="text-lg font-bold text-slate-900">{tiquete.placa}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Proveedor</p>
              <p className="text-base font-medium text-slate-700">{tiquete.proveedorNombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Peso Neto Registrado</p>
              <p className="text-2xl font-mono font-black text-slate-900">{tiquete.pesoNeto || '---'} Kg</p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (e) {
    return <InvalidState message="Error al procesar la verificacion." />;
  }
}

function InvalidState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-red-500 p-6 flex flex-col items-center justify-center text-white">
          <ShieldAlert className="w-16 h-16 mb-2" />
          <h1 className="text-2xl font-black text-center">Tiquete No Valido<br/>o Alterado</h1>
        </div>
        <div className="p-6">
          <p className="text-slate-700 text-center font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}
