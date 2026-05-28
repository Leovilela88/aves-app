import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = process.env.DB_PATH || path.join(process.cwd(), "videos.db");
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS videos (
    key TEXT PRIMARY KEY,
    species TEXT NOT NULL,
    filename TEXT NOT NULL,
    size INTEGER NOT NULL,
    indexed_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_species ON videos(species);
`);

export type VideoRow = {
  key: string;
  species: string;
  filename: string;
  size: number;
  indexed_at: number;
};

export function speciesFromKey(key: string): string {
  const parts = key.split("/");
  if (parts.length > 1) return parts[0].replace(/_/g, " ");
  const base = parts[0].replace(/\.[^.]+$/, "");
  return base.replace(/_\d+$/, "").replace(/_/g, " ");
}

export function upsertVideo(key: string, size: number) {
  const filename = key.split("/").pop() || key;
  const species = speciesFromKey(key);
  db.prepare(
    `INSERT INTO videos (key, species, filename, size, indexed_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET size=excluded.size, species=excluded.species, filename=excluded.filename`
  ).run(key, species, filename, size, Date.now());
}

export function searchVideos(q: string, limit = 100): VideoRow[] {
  if (!q.trim()) {
    return db.prepare(`SELECT * FROM videos ORDER BY species, filename LIMIT ?`).all(limit) as VideoRow[];
  }
  const like = `%${q.trim()}%`;
  return db
    .prepare(
      `SELECT * FROM videos WHERE species LIKE ? OR filename LIKE ? ORDER BY species, filename LIMIT ?`
    )
    .all(like, like, limit) as VideoRow[];
}

export function getVideoByKey(key: string): VideoRow | undefined {
  return db.prepare(`SELECT * FROM videos WHERE key = ?`).get(key) as VideoRow | undefined;
}
