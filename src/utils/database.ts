// src/utils/database.ts
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('hazfinance.db');
  }
  return db;
}

export async function initDB(): Promise<void> {
  const database = await getDB();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS transactions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      type        TEXT NOT NULL CHECK(type IN ('income','expense')),
      amount      REAL NOT NULL,
      description TEXT NOT NULL,
      category    TEXT NOT NULL,
      date        TEXT NOT NULL,
      note        TEXT DEFAULT '',
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      category    TEXT NOT NULL,
      price       REAL NOT NULL,
      cost        REAL NOT NULL DEFAULT 0,
      stock       INTEGER NOT NULL DEFAULT 0,
      description TEXT DEFAULT '',
      icon        TEXT DEFAULT '📦',
      created_at  TEXT DEFAULT (datetime('now'))
    );
  `);
}

// ─── Transactions ────────────────────────────────────────────────────────────

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  note: string;
  created_at: string;
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const database = await getDB();
  return await database.getAllAsync<Transaction>(
    'SELECT * FROM transactions ORDER BY date DESC, id DESC'
  );
}

export async function getTransactionsByMonth(year: number, month: number): Promise<Transaction[]> {
  const database = await getDB();
  const monthStr = String(month).padStart(2, '0');
  return await database.getAllAsync<Transaction>(
    `SELECT * FROM transactions WHERE strftime('%Y-%m', date) = ? ORDER BY date DESC`,
    [`${year}-${monthStr}`]
  );
}

export async function insertTransaction(tx: Omit<Transaction, 'id' | 'created_at'>): Promise<number> {
  const database = await getDB();
  const result = await database.runAsync(
    `INSERT INTO transactions (type, amount, description, category, date, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tx.type, tx.amount, tx.description, tx.category, tx.date, tx.note]
  );
  return result.lastInsertRowId;
}

export async function updateTransaction(id: number, tx: Omit<Transaction, 'id' | 'created_at'>): Promise<void> {
  const database = await getDB();
  await database.runAsync(
    `UPDATE transactions SET type=?, amount=?, description=?, category=?, date=?, note=? WHERE id=?`,
    [tx.type, tx.amount, tx.description, tx.category, tx.date, tx.note, id]
  );
}

export async function deleteTransaction(id: number): Promise<void> {
  const database = await getDB();
  await database.runAsync('DELETE FROM transactions WHERE id=?', [id]);
}

// ─── Items ───────────────────────────────────────────────────────────────────

export interface Item {
  id: number;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  description: string;
  icon: string;
  created_at: string;
}

export async function getAllItems(): Promise<Item[]> {
  const database = await getDB();
  return await database.getAllAsync<Item>(
    'SELECT * FROM items ORDER BY created_at DESC'
  );
}

export async function insertItem(item: Omit<Item, 'id' | 'created_at'>): Promise<number> {
  const database = await getDB();
  const result = await database.runAsync(
    `INSERT INTO items (name, category, price, cost, stock, description, icon)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [item.name, item.category, item.price, item.cost, item.stock, item.description, item.icon]
  );
  return result.lastInsertRowId;
}

export async function updateItem(id: number, item: Omit<Item, 'id' | 'created_at'>): Promise<void> {
  const database = await getDB();
  await database.runAsync(
    `UPDATE items SET name=?, category=?, price=?, cost=?, stock=?, description=?, icon=? WHERE id=?`,
    [item.name, item.category, item.price, item.cost, item.stock, item.description, item.icon, id]
  );
}

export async function deleteItem(id: number): Promise<void> {
  const database = await getDB();
  await database.runAsync('DELETE FROM items WHERE id=?', [id]);
}
