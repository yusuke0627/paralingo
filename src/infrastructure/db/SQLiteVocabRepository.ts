import sqlite3 from "sqlite3";
import { VocabRepository } from "../../application/ports/VocabRepository";
import { VocabMemo } from "../../domain/entities";

export class SQLiteVocabRepository implements VocabRepository {
  private db: sqlite3.Database;

  constructor(dbPath: string) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Failed to open SQLite database:", err.message);
      }
    });
    this.initSchema();
  }

  private initSchema(): void {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS vocab_memos (
          id TEXT PRIMARY KEY,
          term TEXT UNIQUE NOT NULL,
          translation TEXT NOT NULL,
          content TEXT NOT NULL,
          createdAt INTEGER NOT NULL
        )
      `);
    });
  }

  private run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private all<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  private get<T>(sql: string, params: any[] = []): Promise<T | null> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row ? (row as T) : null);
      });
    });
  }

  async save(memo: VocabMemo): Promise<void> {
    const existing = await this.findByTerm(memo.term);
    
    if (existing) {
      // Merge translations and content, removing duplicates
      const mergedTranslation = Array.from(new Set([...existing.translation, ...memo.translation]));
      const mergedContent = Array.from(new Set([...existing.content, ...memo.content]));
      
      await this.run(
        `UPDATE vocab_memos SET translation = ?, content = ? WHERE id = ?`,
        [JSON.stringify(mergedTranslation), JSON.stringify(mergedContent), existing.id]
      );
    } else {
      // Insert new
      const id = memo.id || Math.random().toString(36).substr(2, 9);
      const createdAt = memo.createdAt ? new Date(memo.createdAt).getTime() : Date.now();
      
      await this.run(
        `INSERT INTO vocab_memos (id, term, translation, content, createdAt) VALUES (?, ?, ?, ?, ?)`,
        [id, memo.term, JSON.stringify(memo.translation), JSON.stringify(memo.content), createdAt]
      );
    }
  }

  async list(): Promise<VocabMemo[]> {
    const rows = await this.all<any>(`SELECT * FROM vocab_memos ORDER BY createdAt DESC`);
    return rows.map((row) => ({
      id: row.id,
      term: row.term,
      translation: JSON.parse(row.translation),
      content: JSON.parse(row.content),
      createdAt: new Date(row.createdAt),
    }));
  }

  async findById(id: string): Promise<VocabMemo | null> {
    const row = await this.get<any>(`SELECT * FROM vocab_memos WHERE id = ?`, [id]);
    if (!row) return null;

    return {
      id: row.id,
      term: row.term,
      translation: JSON.parse(row.translation),
      content: JSON.parse(row.content),
      createdAt: new Date(row.createdAt),
    };
  }

  async findByTerm(term: string): Promise<VocabMemo | null> {
    const row = await this.get<any>(`SELECT * FROM vocab_memos WHERE term = ?`, [term]);
    if (!row) return null;

    return {
      id: row.id,
      term: row.term,
      translation: JSON.parse(row.translation),
      content: JSON.parse(row.content),
      createdAt: new Date(row.createdAt),
    };
  }
}
