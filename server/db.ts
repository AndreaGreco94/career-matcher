import mysql from 'mysql';

// Configurazione per MySQL
export const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'career_matcher',
  port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306,
};

// Funzione per inizializzare il database e creare le tabelle necessarie
export async function initializeDatabase() {
  return new Promise<void>((resolve, reject) => {
    const connection = mysql.createConnection(dbConfig);
    
    // Crea tabella users se non esiste
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `;
    
    connection.connect((err) => {
      if (err) {
        console.error('Errore di connessione al database:', err);
        reject(err);
        return;
      }
      
      connection.query(createUsersTable, (err) => {
        if (err) {
          console.error('Errore nella creazione della tabella users:', err);
          reject(err);
          return;
        }
        
        console.log('Database inizializzato con successo');
        connection.end();
        resolve();
      });
    });
  });
}
