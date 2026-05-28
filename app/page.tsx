"use client";
import { useEffect, useState } from "react";

type Video = {
  key: string;
  species: string;
  filename: string;
  size: number;
};

function formatSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [selected, setSelected] = useState<Video | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string>("");

  async function search(q: string) {
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setVideos(data.videos || []);
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(() => search(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  async function openPlayer(v: Video) {
    setSelected(v);
    setStreamUrl(null);
    const res = await fetch(`/api/stream?key=${encodeURIComponent(v.key)}`);
    const data = await res.json();
    setStreamUrl(data.url);
  }

  async function download(v: Video) {
    const res = await fetch(`/api/download?key=${encodeURIComponent(v.key)}`);
    const data = await res.json();
    window.location.href = data.url;
  }

  async function sync() {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setSyncMsg(`Erro ${res.status}: ${data.error || "desconhecido"}${data.detail ? " — " + data.detail : ""}`);
      } else {
        setSyncMsg(`${data.indexed} vídeo(s) indexado(s) de ${data.total} objeto(s) no bucket.`);
      }
      await search(query);
    } catch (e: any) {
      setSyncMsg(`Falha: ${e.message}`);
    }
    setSyncing(false);
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 60px" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
          paddingBottom: 20,
          borderBottom: "1px solid rgba(74, 157, 108, 0.15)",
        }}
      >
        <div style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 26 }}>🪶</span>
          <h1
            style={{
              fontSize: 24,
              margin: 0,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Acervo de Aves
          </h1>
          <span style={{ color: "#5a6a60", fontSize: 13 }}>
            {videos.length > 0 && `${videos.length} vídeo${videos.length > 1 ? "s" : ""}`}
          </span>
        </div>
        <button
          onClick={sync}
          disabled={syncing}
          style={{
            padding: "9px 16px",
            background: "rgba(74, 157, 108, 0.12)",
            border: "1px solid rgba(74, 157, 108, 0.35)",
            color: "#9bd4b0",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {syncing ? "Sincronizando..." : "↻ Sincronizar B2"}
        </button>
      </header>

      {syncMsg && (
        <div
          style={{
            padding: "12px 16px",
            background: syncMsg.startsWith("Erro") || syncMsg.startsWith("Falha")
              ? "rgba(120, 30, 30, 0.3)"
              : "rgba(47, 125, 79, 0.18)",
            border: `1px solid ${
              syncMsg.startsWith("Erro") || syncMsg.startsWith("Falha")
                ? "rgba(220, 80, 80, 0.4)"
                : "rgba(74, 157, 108, 0.4)"
            }`,
            borderRadius: 8,
            marginBottom: 18,
            fontSize: 13,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {syncMsg}
        </div>
      )}

      <div style={{ position: "relative", marginBottom: 24 }}>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por espécie (nome científico)..."
          style={{
            width: "100%",
            padding: "14px 18px 14px 44px",
            background: "rgba(15, 22, 19, 0.7)",
            backdropFilter: "blur(8px)",
            border: "1px solid #2a3a32",
            color: "#fff",
            borderRadius: 10,
            fontSize: 15,
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#5a6a60",
            fontSize: 16,
          }}
        >
          🔍
        </span>
      </div>

      {selected && (
        <div
          style={{
            background: "rgba(8, 12, 10, 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(74, 157, 108, 0.25)",
            borderRadius: 12,
            padding: 18,
            marginBottom: 24,
            boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#e8eef2",
                }}
              >
                {capitalize(selected.species)}
              </div>
              <div style={{ fontSize: 12, color: "#7a8a80", marginTop: 2 }}>
                {selected.filename} · {formatSize(selected.size)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => download(selected)}
                style={{
                  padding: "9px 18px",
                  background: "linear-gradient(180deg, #4a9d6c, #2f7d4f)",
                  border: 0,
                  color: "#fff",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ↓ Baixar
              </button>
              <button
                onClick={() => {
                  setSelected(null);
                  setStreamUrl(null);
                }}
                style={{
                  padding: "9px 14px",
                  background: "transparent",
                  border: "1px solid #2a3a32",
                  color: "#9aa9a0",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Fechar
              </button>
            </div>
          </div>
          {streamUrl ? (
            <video
              key={streamUrl}
              src={streamUrl}
              controls
              autoPlay
              playsInline
              // @ts-ignore — atributo iOS legado, ainda útil pra Safari antigo
              webkit-playsinline="true"
              style={{
                width: "100%",
                maxHeight: "65vh",
                background: "#000",
                borderRadius: 8,
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                padding: 60,
                textAlign: "center",
                color: "#7a8a80",
                background: "#000",
                borderRadius: 8,
              }}
            >
              Carregando vídeo...
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p style={{ color: "#7a8a80", textAlign: "center", padding: 40 }}>Carregando...</p>
      ) : videos.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "#7a8a80",
            background: "rgba(15, 22, 19, 0.5)",
            border: "1px dashed #2a3a32",
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: 38, marginBottom: 10, opacity: 0.5 }}>🐦</div>
          <p style={{ margin: 0 }}>
            Nenhum vídeo encontrado. Clique em <strong>"Sincronizar B2"</strong> pra indexar o bucket.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {videos.map((v) => (
            <div
              key={v.key}
              className="video-card"
              onClick={() => openPlayer(v)}
              style={{
                padding: 16,
                background:
                  selected?.key === v.key
                    ? "rgba(74, 157, 108, 0.15)"
                    : "rgba(15, 22, 19, 0.7)",
                backdropFilter: "blur(8px)",
                border: `1px solid ${
                  selected?.key === v.key ? "rgba(74, 157, 108, 0.5)" : "#2a3a32"
                }`,
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: 19,
                  fontWeight: 600,
                  color: "#e8eef2",
                  marginBottom: 4,
                }}
              >
                {capitalize(v.species)}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#7a8a80",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {v.filename}
                </span>
                <span style={{ flexShrink: 0 }}>{formatSize(v.size)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
