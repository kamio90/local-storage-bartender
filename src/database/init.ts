import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync('bartender.db');

  // Create bottles table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS bottles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      photoUri TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      status TEXT DEFAULT 'full',
      dateAdded TEXT NOT NULL,
      notes TEXT
    );
  `);

  // Create cocktails table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cocktails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      instructions TEXT NOT NULL,
      garnish TEXT,
      glassType TEXT
    );
  `);

  // Create cocktail_alcohol table (many-to-many relationship)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cocktail_alcohol (
      cocktailId INTEGER,
      alcoholType TEXT NOT NULL,
      FOREIGN KEY (cocktailId) REFERENCES cocktails(id)
    );
  `);

  // Create cocktail_ingredients table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cocktail_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cocktailId INTEGER,
      name TEXT NOT NULL,
      amount TEXT NOT NULL,
      isAlcohol INTEGER DEFAULT 0,
      alcoholType TEXT,
      FOREIGN KEY (cocktailId) REFERENCES cocktails(id)
    );
  `);

  console.log('Database initialized successfully');
  return db;
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};
