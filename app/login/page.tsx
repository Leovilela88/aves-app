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
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "rgba(15, 22, 19, 0.85)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(74, 157, 108, 0.2)",
          borderRadius: 14,
          padding: 36,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 38, marginBottom: 6 }}>🪶</div>
          <h1
            style={{
              fontSize: 26,
              margin: 0,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Aves
          </h1>
          <p style={{ color: "#8a9a90", fontSize: 13, margin: "6px 0 0" }}>
            Acervo pessoal de vídeos
          </p>
        </div>
        <form onSubmit={onSubmit}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              color: "#8a9a90",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Senha
          </label>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "#0d1612",
              border: "1px solid #2a3a32",
              color: "#fff",
              borderRadius: 8,
              fontSize: 15,
            }}
          />
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              marginTop: 18,
              width: "100%",
              padding: "12px 16px",
              background: "linear-gradient(180deg, #4a9d6c, #2f7d4f)",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
          {error && (
            <p
              style={{
                color: "#ff9090",
                marginTop: 14,
                fontSize: 13,
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
