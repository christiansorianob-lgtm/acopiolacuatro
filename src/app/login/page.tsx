"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Delete, KeyRound } from "lucide-react";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNumber = (num: number) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError("");
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError("");
  };

  const handleLogin = async () => {
    if (pin.length !== 4) {
      setError("El PIN debe tener 4 dígitos");
      return;
    }
    
    setLoading(true);
    
    const result = await signIn("credentials", {
      pin,
      redirect: false,
    });

    if (result?.error) {
      setError("PIN incorrecto");
      setPin("");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-brand-background)] p-4">
      <div className="w-full max-w-md bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-brand-text)] mb-2">Acceso al Sistema</h1>
          <p className="text-[var(--color-brand-text-muted)]">Centro de Acopio Fruta de Palma</p>
        </div>

        {/* PIN Display */}
        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-14 h-16 rounded-xl flex items-center justify-center text-3xl font-bold border-2 transition-colors ${
                pin.length > i 
                  ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-text)]' 
                  : 'border-[var(--color-brand-border)] bg-[var(--color-brand-background)] text-transparent'
              }`}
            >
              {pin.length > i ? '•' : ''}
            </div>
          ))}
        </div>

        {error && (
          <div className="text-[var(--color-brand-error)] mb-4 font-medium text-center bg-[var(--color-brand-error)]/10 px-4 py-2 rounded-lg w-full">
            {error}
          </div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num)}
              disabled={loading}
              className="h-16 rounded-xl bg-[var(--color-brand-background)] border border-[var(--color-brand-border)] text-2xl font-bold text-[var(--color-brand-text)] hover:bg-[var(--color-brand-border)] transition-colors active:scale-95 disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleDelete}
            disabled={loading || pin.length === 0}
            className="h-16 rounded-xl bg-[var(--color-brand-background)] border border-[var(--color-brand-border)] text-2xl flex items-center justify-center text-[var(--color-brand-text)] hover:bg-[var(--color-brand-border)] transition-colors active:scale-95 disabled:opacity-50"
          >
            <Delete size={28} />
          </button>
          <button
            onClick={() => handleNumber(0)}
            disabled={loading}
            className="h-16 rounded-xl bg-[var(--color-brand-background)] border border-[var(--color-brand-border)] text-2xl font-bold text-[var(--color-brand-text)] hover:bg-[var(--color-brand-border)] transition-colors active:scale-95 disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={handleLogin}
            disabled={loading || pin.length !== 4}
            className="h-16 rounded-xl bg-[var(--color-brand-primary)] text-white text-xl font-bold hover:bg-[var(--color-brand-primary)]/90 transition-colors active:scale-95 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? '...' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}
