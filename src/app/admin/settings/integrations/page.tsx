"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Key,
  Link2,
  ScrollText,
  Copy,
  Check,
  Loader2,
  Trash2,
  RefreshCw,
  Zap,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Shield,
  Globe,
  X,
} from "lucide-react";

/* ─── shared classes ─── */
const inputCls =
  "flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-[#555] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40";

/* ─── types ─── */
interface ApiKey {
  id: string;
  prefix: string;
  app_name: string;
  scopes: string[];
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
  status: "active" | "revoked";
}

interface Connection {
  id: string;
  remote_app: string;
  remote_url: string;
  status: "active" | "error" | "pending";
  error_message?: string;
  entities: string[];
  created_at: string;
}

interface LogEntry {
  id: string;
  direction: "inbound" | "outbound";
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  status_code: number;
  duration_ms: number;
  remote_app: string;
  timestamp: string;
}

/* ─── helpers ─── */
function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "Nunca";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Agora";
  if (mins < 60) return `${mins}min atr\u00e1s`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atr\u00e1s`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d atr\u00e1s`;
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

function formatTimestamp(dateStr: string): string {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/* ─── tab definitions ─── */
type Tab = "keys" | "connections" | "logs";

const TABS: { id: Tab; label: string; icon: typeof Key }[] = [
  { id: "keys", label: "API Keys", icon: Key },
  { id: "connections", label: "Conex\u00f5es", icon: Link2 },
  { id: "logs", label: "Logs", icon: ScrollText },
];

/* ─── method badge colors ─── */
const METHOD_COLORS: Record<string, string> = {
  GET: "bg-[#4b9560]/10 text-[#4b9560] ring-[#4b9560]/20",
  POST: "bg-accent/10 text-accent ring-accent/20",
  PUT: "bg-[#FBBF24]/10 text-[#FBBF24] ring-[#FBBF24]/20",
  DELETE: "bg-[#F87171]/10 text-[#F87171] ring-[#F87171]/20",
};

/* ─── scope badge colors ─── */
const SCOPE_COLORS: Record<string, string> = {
  read: "bg-[#4b9560]/10 text-[#4b9560] ring-[#4b9560]/20",
  write: "bg-[#FBBF24]/10 text-[#FBBF24] ring-[#FBBF24]/20",
  admin: "bg-[#F87171]/10 text-[#F87171] ring-[#F87171]/20",
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("keys");

  return (
    <div className="relative">
      {/* Ambient mesh */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent/[0.03] rounded-full blur-[120px] animate-pulse-slow" />
        <div
          className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-[#2a6ab0]/[0.02] rounded-full blur-[100px] animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Header */}
      <section className="relative -mx-8 -mt-8 overflow-hidden mb-10">
        <div className="absolute inset-0">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/[0.06] blur-3xl" />
          <div className="absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-[#2a6ab0]/[0.04] blur-2xl" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        <div className="relative z-10 px-8 pt-16 pb-10 flex items-center gap-5">
          <Link
            href="/admin"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-[#888] hover:bg-white/[0.1] hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              Configura\u00e7\u00f5es
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white font-serif">
              Integra\u00e7\u00f5es
            </h1>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent/15 text-white ring-1 ring-accent/20"
                  : "text-[#777] hover:bg-white/[0.06] hover:text-[#ccc]"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in-up">
        {activeTab === "keys" && <ApiKeysTab />}
        {activeTab === "connections" && <ConnectionsTab />}
        {activeTab === "logs" && <LogsTab />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 1: API KEYS
   ═══════════════════════════════════════════ */
function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newKeyFull, setNewKeyFull] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  /* form state */
  const [appName, setAppName] = useState("");
  const [scopes, setScopes] = useState<Record<string, boolean>>({
    read: true,
    write: false,
    admin: false,
  });

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const selectedScopes = Object.entries(scopes)
        .filter(([, v]) => v)
        .map(([k]) => k);
      const res = await fetch("/api/integrations/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_name: appName, scopes: selectedScopes }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar chave");
      }
      const data = await res.json();
      setNewKeyFull(data.key);
      setShowForm(false);
      setAppName("");
      setScopes({ read: true, write: false, admin: false });
      fetchKeys();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleRevoke(id: string) {
    setRevoking(id);
    try {
      await fetch(`/api/integrations/keys/${id}`, { method: "DELETE" });
      fetchKeys();
    } finally {
      setRevoking(null);
    }
  }

  function copyKey() {
    if (!newKeyFull) return;
    navigator.clipboard.writeText(newKeyFull);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* New key banner */}
      {newKeyFull && (
        <div className="rounded-2xl bg-accent/10 ring-1 ring-accent/30 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-accent">
                Chave criada com sucesso
              </p>
              <p className="text-[11px] text-accent/70 mt-1">
                Esta \u00e9 a \u00fanica vez que a chave completa ser\u00e1
                exibida. Copie e armazene em local seguro.
              </p>
            </div>
            <button
              onClick={() => setNewKeyFull(null)}
              className="text-accent/60 hover:text-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3 bg-[#0a0a0a]/60 rounded-xl px-4 py-3">
            <code className="flex-1 text-sm font-mono text-accent break-all select-all">
              {newKeyFull}
            </code>
            <button
              onClick={copyKey}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/20 text-accent text-xs font-semibold hover:bg-accent/30 transition-all"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
          Chaves de API (Inbound)
        </p>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setNewKeyFull(null);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(196,168,130,0.2)] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Nova API Key
        </button>
      </div>

      {/* Inline create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-6 space-y-5"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#999]">
              Nome do App *
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              required
              placeholder="Ex: eximIA Academy, CRM externo..."
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[#999]">
              Escopos
            </label>
            <div className="flex items-center gap-4">
              {(["read", "write", "admin"] as const).map((scope) => (
                <label
                  key={scope}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                      scopes[scope]
                        ? "border-accent bg-accent/20"
                        : "border-white/[0.15] bg-white/[0.03] group-hover:border-white/[0.25]"
                    }`}
                  >
                    {scopes[scope] && (
                      <Check className="w-3 h-3 text-accent" />
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={scopes[scope]}
                    onChange={(e) =>
                      setScopes((prev) => ({
                        ...prev,
                        [scope]: e.target.checked,
                      }))
                    }
                    className="sr-only"
                  />
                  <span className="text-sm text-[#ccc] capitalize">
                    {scope}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {formError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border border-white/[0.1] text-sm text-[#999] hover:text-white hover:border-white/[0.2] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar Chave
            </button>
          </div>
        </form>
      )}

      {/* Keys table */}
      <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : keys.length === 0 ? (
          <div className="p-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] mx-auto mb-4">
              <Key className="w-8 h-8 text-[#333]" />
            </div>
            <p className="text-sm text-[#666] mb-1">
              Nenhuma API key criada
            </p>
            <p className="text-[11px] text-[#444]">
              Crie uma chave para permitir que apps externos se conectem.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {/* Table header */}
            <div className="grid grid-cols-[140px_1fr_160px_120px_80px] gap-4 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#555]">
              <span>Prefixo</span>
              <span>App</span>
              <span>Escopos</span>
              <span>\u00daltimo uso</span>
              <span>Status</span>
            </div>

            {keys.map((key) => (
              <div key={key.id}>
                {/* Row */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === key.id ? null : key.id)
                  }
                  className="w-full grid grid-cols-[140px_1fr_160px_120px_80px] gap-4 items-center px-5 py-3.5 text-left transition-all hover:bg-white/[0.02] group"
                >
                  <div className="flex items-center gap-2">
                    {expandedId === key.id ? (
                      <ChevronDown className="w-3.5 h-3.5 text-[#555]" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-[#555]" />
                    )}
                    <code className="text-[13px] font-mono text-[#ccc]">
                      {key.prefix}...
                    </code>
                  </div>
                  <span className="text-[13px] text-white group-hover:text-accent transition-colors">
                    {key.app_name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {key.scopes.map((s) => (
                      <span
                        key={s}
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ring-1 capitalize ${
                          SCOPE_COLORS[s] || "bg-white/5 text-[#888] ring-white/10"
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <span className="text-[12px] text-[#666] tabular-nums">
                    {relativeTime(key.last_used_at)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        key.status === "active"
                          ? "bg-[#4b9560] shadow-[0_0_6px_rgba(75,149,96,0.4)]"
                          : "bg-[#F87171] shadow-[0_0_6px_rgba(248,113,113,0.4)]"
                      }`}
                    />
                    <span
                      className={`text-[11px] font-medium ${
                        key.status === "active"
                          ? "text-[#4b9560]"
                          : "text-[#F87171]"
                      }`}
                    >
                      {key.status === "active" ? "Ativo" : "Revogado"}
                    </span>
                  </div>
                </button>

                {/* Expanded details */}
                {expandedId === key.id && (
                  <div className="px-5 pb-4 pl-12 space-y-3 animate-fade-in-up">
                    <div className="grid grid-cols-3 gap-6 text-[12px]">
                      <div>
                        <span className="text-[#555]">Criado em</span>
                        <p className="text-[#ccc] mt-0.5">
                          {new Date(key.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <span className="text-[#555]">Expira em</span>
                        <p className="text-[#ccc] mt-0.5">
                          {key.expires_at
                            ? new Date(key.expires_at).toLocaleString("pt-BR")
                            : "Sem expira\u00e7\u00e3o"}
                        </p>
                      </div>
                      <div>
                        {key.status === "active" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  "Revogar esta chave? Apps que a utilizam perder\u00e3o acesso imediatamente."
                                )
                              ) {
                                handleRevoke(key.id);
                              }
                            }}
                            disabled={revoking === key.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#F87171]/20 text-[#F87171] text-[12px] font-medium hover:bg-[#F87171]/10 transition-all disabled:opacity-50"
                          >
                            {revoking === key.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                            Revogar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 2: CONNECTIONS
   ═══════════════════════════════════════════ */
function ConnectionsTab() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [testing, setTesting] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [rediscovering, setRediscovering] = useState<string | null>(null);

  /* form state */
  const [remoteUrl, setRemoteUrl] = useState("");
  const [remoteApiKey, setRemoteApiKey] = useState("");

  /* discovery state */
  const [discoveredEntities, setDiscoveredEntities] = useState<string[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<
    Record<string, boolean>
  >({});
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/connections");
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  async function handleDiscover(e: React.FormEvent) {
    e.preventDefault();
    setDiscoveryLoading(true);
    setFormError("");
    try {
      const res = await fetch("/api/integrations/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remote_url: remoteUrl,
          api_key: remoteApiKey,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao descobrir entidades");
      }
      const data = await res.json();
      setDiscoveredEntities(data.entities || []);
      const sel: Record<string, boolean> = {};
      (data.entities || []).forEach((e: string) => (sel[e] = true));
      setSelectedEntities(sel);
      setShowDiscovery(true);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setDiscoveryLoading(false);
    }
  }

  async function handleConfirmConnection() {
    setFormLoading(true);
    setFormError("");
    try {
      const entities = Object.entries(selectedEntities)
        .filter(([, v]) => v)
        .map(([k]) => k);
      const res = await fetch("/api/integrations/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remote_url: remoteUrl,
          api_key: remoteApiKey,
          entities,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar conex\u00e3o");
      }
      resetForm();
      fetchConnections();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setFormLoading(false);
    }
  }

  function resetForm() {
    setShowForm(false);
    setShowDiscovery(false);
    setRemoteUrl("");
    setRemoteApiKey("");
    setDiscoveredEntities([]);
    setSelectedEntities({});
    setFormError("");
  }

  async function handleTest(id: string) {
    setTesting(id);
    try {
      await fetch(`/api/integrations/connections/${id}`, { method: "POST" });
      fetchConnections();
    } finally {
      setTesting(null);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Remover esta conex\u00e3o?")) return;
    setRemoving(id);
    try {
      await fetch(`/api/integrations/connections/${id}`, { method: "DELETE" });
      fetchConnections();
    } finally {
      setRemoving(null);
    }
  }

  async function handleRediscover(id: string) {
    setRediscovering(id);
    try {
      await fetch(`/api/integrations/connections/${id}/rediscover`, {
        method: "POST",
      });
      fetchConnections();
    } finally {
      setRediscovering(null);
    }
  }

  const STATUS_MAP: Record<
    string,
    { color: string; dot: string; label: string }
  > = {
    active: {
      color: "text-[#4b9560]",
      dot: "bg-[#4b9560] shadow-[0_0_6px_rgba(75,149,96,0.4)]",
      label: "Conectado",
    },
    error: {
      color: "text-[#F87171]",
      dot: "bg-[#F87171] shadow-[0_0_6px_rgba(248,113,113,0.4)]",
      label: "Erro",
    },
    pending: {
      color: "text-[#FBBF24]",
      dot: "bg-[#FBBF24] shadow-[0_0_6px_rgba(251,191,36,0.4)]",
      label: "Pendente",
    },
  };

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
          Conex\u00f5es (Outbound)
        </p>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(196,168,130,0.2)] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Nova Conex\u00e3o
        </button>
      </div>

      {/* Create form */}
      {showForm && !showDiscovery && (
        <form
          onSubmit={handleDiscover}
          className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-6 space-y-5"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#999]">
              URL do app remoto *
            </label>
            <input
              type="url"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              required
              placeholder="https://app-externo.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#999]">
              API Key *
            </label>
            <input
              type="password"
              value={remoteApiKey}
              onChange={(e) => setRemoteApiKey(e.target.value)}
              required
              placeholder="Chave de autentica\u00e7\u00e3o do app remoto"
              className={inputCls}
            />
          </div>

          {formError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl border border-white/[0.1] text-sm text-[#999] hover:text-white hover:border-white/[0.2] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={discoveryLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {discoveryLoading && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Descobrir Entidades
            </button>
          </div>
        </form>
      )}

      {/* Discovery results */}
      {showDiscovery && (
        <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Globe size={14} className="text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Entidades Descobertas
              </h3>
              <p className="text-[11px] text-[#666] mt-0.5">
                Selecione quais entidades deseja sincronizar
              </p>
            </div>
          </div>

          {discoveredEntities.length === 0 ? (
            <p className="text-sm text-[#666] py-4">
              Nenhuma entidade encontrada no app remoto.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {discoveredEntities.map((entity) => (
                <label
                  key={entity}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                    selectedEntities[entity]
                      ? "border-accent/30 bg-accent/5"
                      : "border-white/[0.06] bg-white/[0.01] hover:border-white/[0.12]"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                      selectedEntities[entity]
                        ? "border-accent bg-accent/20"
                        : "border-white/[0.15] bg-white/[0.03]"
                    }`}
                  >
                    {selectedEntities[entity] && (
                      <Check className="w-3 h-3 text-accent" />
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedEntities[entity] || false}
                    onChange={(e) =>
                      setSelectedEntities((prev) => ({
                        ...prev,
                        [entity]: e.target.checked,
                      }))
                    }
                    className="sr-only"
                  />
                  <span className="text-sm text-[#ccc]">{entity}</span>
                </label>
              ))}
            </div>
          )}

          {formError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl border border-white/[0.1] text-sm text-[#999] hover:text-white hover:border-white/[0.2] transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmConnection}
              disabled={
                formLoading ||
                Object.values(selectedEntities).every((v) => !v)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar Conex\u00e3o
            </button>
          </div>
        </div>
      )}

      {/* Connections list */}
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      ) : connections.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] mx-auto mb-4">
            <Link2 className="w-8 h-8 text-[#333]" />
          </div>
          <p className="text-sm text-[#666] mb-1">Nenhuma conex\u00e3o</p>
          <p className="text-[11px] text-[#444]">
            Conecte-se a apps remotos para sincronizar dados.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {connections.map((conn) => {
            const st = STATUS_MAP[conn.status] || STATUS_MAP.pending;
            return (
              <div
                key={conn.id}
                className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] overflow-hidden"
              >
                {/* Card header */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === conn.id ? null : conn.id)
                  }
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                      <Globe className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-white group-hover:text-accent transition-colors">
                        {conn.remote_app}
                      </p>
                      <p className="text-[11px] text-[#555] font-mono mt-0.5">
                        {conn.remote_url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-[#666] tabular-nums">
                      {conn.entities.length} entidade
                      {conn.entities.length !== 1 ? "s" : ""}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                      <span className={`text-[11px] font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    {expandedId === conn.id ? (
                      <ChevronDown className="w-4 h-4 text-[#555]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#555]" />
                    )}
                  </div>
                </button>

                {/* Error message */}
                {conn.status === "error" && conn.error_message && (
                  <div className="mx-5 mb-3 flex items-center gap-2 rounded-lg bg-[#F87171]/10 px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F87171] shrink-0" />
                    <span className="text-[11px] text-[#F87171]">
                      {conn.error_message}
                    </span>
                  </div>
                )}

                {/* Expanded */}
                {expandedId === conn.id && (
                  <div className="px-5 pb-5 space-y-4 border-t border-white/[0.04] pt-4 animate-fade-in-up">
                    {/* Entities */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#555] mb-2">
                        Entidades sincronizadas
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {conn.entities.map((e) => (
                          <span
                            key={e}
                            className="rounded-lg px-3 py-1 text-[11px] font-medium bg-white/[0.04] text-[#ccc] ring-1 ring-white/[0.06]"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTest(conn.id)}
                        disabled={testing === conn.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] text-[12px] font-medium text-[#999] hover:text-white hover:border-white/[0.2] transition-all disabled:opacity-50"
                      >
                        {testing === conn.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Zap className="w-3 h-3" />
                        )}
                        Testar
                      </button>
                      <button
                        onClick={() => handleRediscover(conn.id)}
                        disabled={rediscovering === conn.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] text-[12px] font-medium text-[#999] hover:text-white hover:border-white/[0.2] transition-all disabled:opacity-50"
                      >
                        {rediscovering === conn.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Re-descobrir
                      </button>
                      <button
                        onClick={() => handleRemove(conn.id)}
                        disabled={removing === conn.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#F87171]/20 text-[12px] font-medium text-[#F87171] hover:bg-[#F87171]/10 transition-all disabled:opacity-50"
                      >
                        {removing === conn.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        Remover
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 3: LOGS
   ═══════════════════════════════════════════ */
function LogsTab() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "inbound" | "outbound">("all");

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/logs?limit=100");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    return log.direction === filter;
  });

  function statusColor(code: number): string {
    if (code >= 200 && code < 300) return "text-[#4b9560]";
    if (code >= 400 && code < 500) return "text-[#FBBF24]";
    if (code >= 500) return "text-[#F87171]";
    return "text-[#888]";
  }

  return (
    <div className="space-y-6">
      {/* Header + filters */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
          Registro de Atividade
        </p>
        <div className="flex items-center gap-2">
          {(
            [
              { id: "all" as const, label: "Todos" },
              { id: "inbound" as const, label: "\u2193 Inbound" },
              { id: "outbound" as const, label: "\u2191 Outbound" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                filter === f.id
                  ? "bg-accent/15 text-white ring-1 ring-accent/20"
                  : "text-[#666] hover:bg-white/[0.06] hover:text-[#ccc]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs table */}
      <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] mx-auto mb-4">
              <ScrollText className="w-8 h-8 text-[#333]" />
            </div>
            <p className="text-sm text-[#666] mb-1">Nenhum log registrado</p>
            <p className="text-[11px] text-[#444]">
              Logs aparecer\u00e3o conforme as integra\u00e7\u00f5es forem
              utilizadas.
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[50px_60px_1fr_60px_70px_1fr_140px] gap-4 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#555] border-b border-white/[0.04]">
              <span>Dir.</span>
              <span>M\u00e9todo</span>
              <span>Endpoint</span>
              <span>Status</span>
              <span>Dura\u00e7\u00e3o</span>
              <span>App Remoto</span>
              <span>Timestamp</span>
            </div>

            <div className="divide-y divide-white/[0.04] max-h-[600px] overflow-auto">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-[50px_60px_1fr_60px_70px_1fr_140px] gap-4 items-center px-5 py-3 text-[12px] hover:bg-white/[0.02] transition-all"
                >
                  {/* Direction */}
                  <span
                    className={`text-base font-bold ${
                      log.direction === "inbound"
                        ? "text-[#4a8ad0]"
                        : "text-accent"
                    }`}
                  >
                    {log.direction === "inbound" ? "\u2193" : "\u2191"}
                  </span>

                  {/* Method */}
                  <span
                    className={`inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-[10px] font-bold ring-1 ${
                      METHOD_COLORS[log.method] || "bg-white/5 text-[#888] ring-white/10"
                    }`}
                  >
                    {log.method}
                  </span>

                  {/* Endpoint */}
                  <code className="text-[12px] font-mono text-[#ccc] truncate">
                    {log.endpoint}
                  </code>

                  {/* Status */}
                  <span
                    className={`font-mono font-semibold tabular-nums ${statusColor(log.status_code)}`}
                  >
                    {log.status_code}
                  </span>

                  {/* Duration */}
                  <span className="text-[#666] tabular-nums">
                    {formatDuration(log.duration_ms)}
                  </span>

                  {/* Remote app */}
                  <span className="text-[#888] truncate">
                    {log.remote_app}
                  </span>

                  {/* Timestamp */}
                  <span className="text-[#555] tabular-nums">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Auto-refresh note */}
      <p className="text-[10px] text-[#444] text-center">
        Atualiza\u00e7\u00e3o autom\u00e1tica a cada 30 segundos
      </p>
    </div>
  );
}
