"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Erro no servidor" }));
        throw new Error(data.error || "Login falhou");
      }
      const data = await res.json();
      localStorage.setItem("gate_token", data.token);
      localStorage.setItem("gate_user", JSON.stringify(data.user));
      document.cookie = `gate_token=${data.token}; path=/; max-age=604800`;
      window.location.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciais inválidas.");
      setLoading(false);
    }
  }

  const inputCls = "flex h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 pl-11 text-sm text-white placeholder:text-[#555] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40";

  return (
    <div className="min-h-screen flex">
      {/* Left — Hero with background image */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center scale-110 blur-[3px]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a]/90 via-[#0a0a0a]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <Image src="/logo-horizontal.svg" alt="eximIA" width={160} height={34} priority
              className="invert-[80%] sepia-[15%] saturate-[800%] hue-rotate-[355deg] brightness-[85%] contrast-[80%]" />
            <div className="h-6 w-px bg-white/20" />
            <span className="text-[11px] font-black tracking-[0.25em] uppercase text-accent">Clients</span>
          </div>

          <div className="max-w-lg">
            <h1 className="text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Seu projeto.{" "}
              <span className="text-gradient-gold">Sua visão.</span>
            </h1>
            <p className="mt-5 text-lg text-[#a0a0a0] leading-relaxed">
              Acompanhe cada etapa do seu projeto em tempo real. Timeline, entregáveis, documentos — tudo em um só lugar.
            </p>
            <div className="flex gap-6 mt-10">
              {[
                { label: "Transparência", desc: "Total" },
                { label: "Atualizações", desc: "Em tempo real" },
                { label: "Documentos", desc: "Centralizados" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col">
                  <span className="text-xl font-bold text-white">{item.desc}</span>
                  <span className="text-[11px] uppercase tracking-[0.15em] text-[#666] mt-1">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#444]">© 2026 eximIA Ventures</p>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a] p-8 relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-accent/[0.04] rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: "url(/noise.svg)", backgroundRepeat: "repeat" }} />

        <div className="relative z-10 w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-10">
            <Image src="/logo-horizontal.svg" alt="eximIA" width={180} height={38} priority
              className="invert-[80%] sepia-[15%] saturate-[800%] hue-rotate-[355deg] brightness-[85%] contrast-[80%]" />
          </div>

          <h2 className="text-2xl font-bold text-white">Bem-vindo de volta</h2>
          <p className="text-sm text-[#888] mt-2">Entre com suas credenciais para continuar</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#555]" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="Email" className={inputCls} />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#555]" />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                placeholder="Senha" className={`${inputCls}`} style={{ paddingRight: "2.75rem" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors">
                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[#2a6ab0] text-white text-sm font-semibold transition-all duration-200 hover:bg-[#3a7ac0] hover:shadow-[0_0_30px_rgba(42,106,176,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Entrando...</> : <>Entrar<ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
