"use client";
import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get("from") || "/";
    } else {
      setError("Senha incorreta");
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 360, margin: "120px auto", padding: 24 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Aves — Acesso</h1>
      <form onSubmit={onSubmit}>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "#1a2129",
            border: "1px solid #2a3340",
            color: "#fff",
            borderRadius: 6,
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "10px 12px",
            background: "#2f7d4f",
            color: "#fff",
            border: 0,
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {error && <p style={{ color: "#ff7676", marginTop: 12 }}>{error}</p>}
      </form>
    </main>
  );
}
