import "./globals.css";

export const metadata = {
  title: "Aves — Acervo de vídeos",
  description: "Acervo pessoal de vídeos de aves",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="has-bg-image">{children}</body>
    </html>
  );
}
