import { getDatabase } from './init';
import { Bottle, AlcoholCategory } from '../types';

export const addBottle = async (
  name: string,
  category: AlcoholCategory,
  photoUri: string,
  notes?: string
): Promise<number> => {
  const db = getDatabase();
  const dateAdded = new Date().toISOString();

  const result = await db.runAsync(
    'INSERT INTO bottles (name, category, photoUri, quantity, status, dateAdded, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    name,
    category,
    photoUri,
    1,
    'full',
    dateAdded,
    notes || null
  );

  return result.lastInsertRowId;
};

export const getAllBottles = async (): Promise<Bottle[]> => {
  const db = getDatabase();
  const bottles = await db.getAllAsync<Bottle>('SELECT * FROM bottles ORDER BY dateAdded DESC');
  return bottles;
};

export const getBottlesByCategory = async (category: AlcoholCategory): Promise<Bottle[]> => {
  const db = getDatabase();
  const bottles = await db.getAllAsync<Bottle>('SELECT * FROM bottles WHERE category = ? ORDER BY dateAdded DESC', category);
  return bottles;
};

export const updateBottleStatus = async (id: number, status: 'full' | 'low' | 'empty'): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('UPDATE bottles SET status = ? WHERE id = ?', status, id);
};

export const deleteBottle = async (id: number): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM bottles WHERE id = ?', id);
};

export const getAvailableAlcoholTypes = async (): Promise<AlcoholCategory[]> => {
  const db = getDatabase();
  const result = await db.getAllAsync<{ category: AlcoholCategory }>(
    "SELECT DISTINCT category FROM bottles WHERE status != 'empty'"
  );
  return result.map(r => r.category);
};
