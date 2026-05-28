# Aves App

Web app pessoal pra busca, preview e download de vídeos de aves armazenados no Backblaze B2.

## Stack
- Next.js 15 (App Router, TypeScript)
- SQLite (better-sqlite3) — índice de metadados
- Backblaze B2 via AWS SDK v3 (S3-compatible)
- Auth por senha única + cookie de sessão

## Estrutura de arquivos no B2
Use nome científico, uma pasta por espécie:
```
Ramphastos_toco/Ramphastos_toco_001.mp4
Tangara_seledon/Tangara_seledon_001.mp4
```

## Variáveis de ambiente
Veja `.env.example`. No Railway, configure no painel:
- `B2_ENDPOINT`, `B2_REGION`, `B2_BUCKET`, `B2_KEY_ID`, `B2_APP_KEY`
- `APP_PASSWORD` — senha pra entrar no app
- `SESSION_SECRET` — string aleatória longa
- `DB_PATH=/data/videos.db` — caminho num volume persistente

## Deploy no Railway
1. Conecte o repo
2. Adicione um **Volume** montado em `/data`
3. Configure as variáveis acima
4. Após o primeiro deploy, abra o app, faça login e clique em "Sincronizar B2" pra indexar o bucket

## Fluxo de uso
1. Login com senha
2. Buscar por espécie
3. Clicar num vídeo → player abre com URL assinada (1h)
4. Botão "Baixar" → URL assinada de download (10min)
