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
        setSyncMsg(`OK — ${data.indexed} vídeo(s) indexado(s) de ${data.total} objeto(s) no bucket.`);
      }
      await search(query);
    } catch (e: any) {
      setSyncMsg(`Falha: ${e.message}`);
    }
    setSyncing(false);
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, margin: 0, flex: 1 }}>Acervo de aves</h1>
        <button
          onClick={sync}
          disabled={syncing}
          style={{
            padding: "8px 14px",
            background: "#1a2129",
            border: "1px solid #2a3340",
            color: "#bdd",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {syncing ? "Sincronizando..." : "Sincronizar B2"}
        </button>
      </header>
      {syncMsg && (
        <div
          style={{
            padding: "10px 14px",
            background: syncMsg.startsWith("OK") ? "#163a25" : "#3a1616",
            border: "1px solid #2a3340",
            borderRadius: 6,
            marginBottom: 12,
            fontSize: 13,
            fontFamily: "monospace",
          }}
        >
          {syncMsg}
        </div>
      )}

      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por espécie (nome científico)..."
        style={{
          width: "100%",
          padding: "12px 14px",
          background: "#1a2129",
          border: "1px solid #2a3340",
          color: "#fff",
          borderRadius: 8,
          fontSize: 15,
          marginBottom: 16,
        }}
      />

      {selected && (
        <div
          style={{
            background: "#0a0d11",
            border: "1px solid #2a3340",
            borderRadius: 8,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontStyle: "italic", fontSize: 16 }}>{selected.species}</div>
              <div style={{ fontSize: 12, color: "#7a8a99" }}>{selected.filename}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => download(selected)}
                style={{
                  padding: "8px 14px",
                  background: "#2f7d4f",
                  border: 0,
                  color: "#fff",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Baixar
              </button>
              <button
                onClick={() => {
                  setSelected(null);
                  setStreamUrl(null);
                }}
                style={{
                  padding: "8px 14px",
                  background: "transparent",
                  border: "1px solid #2a3340",
                  color: "#bdd",
                  borderRadius: 6,
                  cursor: "pointer",
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
              style={{ width: "100%", maxHeight: "60vh", background: "#000", borderRadius: 6 }}
            />
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "#7a8a99" }}>Carregando...</div>
          )}
        </div>
      )}

      {loading ? (
        <p style={{ color: "#7a8a99" }}>Carregando...</p>
      ) : videos.length === 0 ? (
        <p style={{ color: "#7a8a99" }}>
          Nenhum vídeo encontrado. Clique em "Sincronizar B2" pra indexar o bucket.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {videos.map((v) => (
            <li
              key={v.key}
              onClick={() => openPlayer(v)}
              style={{
                padding: "12px 14px",
                background: selected?.key === v.key ? "#1f2933" : "#141a21",
                border: "1px solid #2a3340",
                borderRadius: 6,
                marginBottom: 6,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontStyle: "italic" }}>{v.species}</div>
                <div style={{ fontSize: 12, color: "#7a8a99" }}>{v.filename}</div>
              </div>
              <div style={{ fontSize: 12, color: "#7a8a99" }}>{formatSize(v.size)}</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
