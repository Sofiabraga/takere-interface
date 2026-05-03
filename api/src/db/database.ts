import Database from 'better-sqlite3';
import path from 'path';
import 'dotenv/config';

const dbPath = process.env.DB_PATH ?? './takere.db';
const resolvedPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);

const db = new Database(resolvedPath);
db.pragma('journal_mode = WAL');

export default db;
