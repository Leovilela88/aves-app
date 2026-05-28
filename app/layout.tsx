export const metadata = {
  title: "Aves — Acervo de vídeos",
  description: "Acervo pessoal de vídeos de aves",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          background: "#0f1419",
          color: "#e6e6e6",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
