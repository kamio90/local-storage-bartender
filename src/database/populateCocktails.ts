import { getDatabase } from './init';
import { cocktailRecipes } from './cocktailData';

export const populateCocktailDatabase = async (): Promise<void> => {
  const db = getDatabase();

  // Check if cocktails are already populated
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM cocktails');

  if (result && result.count > 0) {
    console.log('Cocktails already populated');
    return;
  }

  console.log('Populating cocktail database...');

  for (const cocktail of cocktailRecipes) {
    // Insert cocktail
    const insertResult = await db.runAsync(
      'INSERT INTO cocktails (name, category, difficulty, instructions, garnish, glassType) VALUES (?, ?, ?, ?, ?, ?)',
      cocktail.name,
      cocktail.category,
      cocktail.difficulty,
      cocktail.instructions,
      cocktail.garnish || null,
      cocktail.glassType || null
    );

    const cocktailId = insertResult.lastInsertRowId;

    // Insert alcohol types
    for (const alcoholType of cocktail.alcoholTypes) {
      await db.runAsync(
        'INSERT INTO cocktail_alcohol (cocktailId, alcoholType) VALUES (?, ?)',
        cocktailId,
        alcoholType
      );
    }

    // Insert ingredients
    for (const ingredient of cocktail.ingredients) {
      await db.runAsync(
        'INSERT INTO cocktail_ingredients (cocktailId, name, amount, isAlcohol, alcoholType) VALUES (?, ?, ?, ?, ?)',
        cocktailId,
        ingredient.name,
        ingredient.amount,
        ingredient.isAlcohol ? 1 : 0,
        ingredient.alcoholType || null
      );
    }
  }

  console.log(`Successfully populated ${cocktailRecipes.length} cocktails`);
};
