import { type User, type InsertUser } from "@shared/schema";
import mysql from "mysql";

// Interfaccia per le operazioni di storage
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

// Implementazione in memoria
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

// Implementazione con MySQL
export class MySQLStorage implements IStorage {
  private pool: mysql.Pool;

  constructor() {
    // Configurazione per MySQL
    this.pool = mysql.createPool({
      host: process.env.DATABASE_HOST || 'localhost',
      user: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'career_matcher',
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306,
    });
  }

  async executeQuery<T>(sql: string, params: any[] = []): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.pool.query(sql, params, (error: mysql.MysqlError | null, results: any) => {
        if (error) {
          return reject(error);
        }
        resolve(results as T);
      });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const results = await this.executeQuery<User[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    return results && results.length > 0 ? results[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await this.executeQuery<User[]>(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return results && results.length > 0 ? results[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.executeQuery<mysql.OkPacket>(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [insertUser.username, insertUser.password]
    );
    
    if (!result || !result.insertId) {
      throw new Error("Impossibile creare l'utente");
    }
    
    const users = await this.executeQuery<User[]>(
      "SELECT * FROM users WHERE id = ?",
      [result.insertId]
    );
    
    if (!users || users.length === 0) {
      throw new Error("Utente creato ma impossibile recuperarlo");
    }
    
    return users[0];
  }
}

// Esportiamo l'implementazione in memoria poiché ci sono problemi di connessione al database MySQL
// Per utilizzare MySQL, sostituisci il codice sottostante con: export const storage = new MySQLStorage();
export const storage = new MemStorage();
