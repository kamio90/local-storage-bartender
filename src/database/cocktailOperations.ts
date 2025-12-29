import { getDatabase } from './init';
import { Cocktail, CocktailWithMatch, Ingredient, AlcoholCategory } from '../types';

export const getAllCocktails = async (): Promise<Cocktail[]> => {
  const db = getDatabase();
  const cocktails = await db.getAllAsync<any>('SELECT * FROM cocktails');

  // Fetch related data for each cocktail
  const fullCocktails: Cocktail[] = [];

  for (const cocktail of cocktails) {
    // Get alcohol types
    const alcoholTypes = await db.getAllAsync<{ alcoholType: AlcoholCategory }>(
      'SELECT alcoholType FROM cocktail_alcohol WHERE cocktailId = ?',
      cocktail.id
    );

    // Get ingredients
    const ingredients = await db.getAllAsync<any>(
      'SELECT name, amount, isAlcohol, alcoholType FROM cocktail_ingredients WHERE cocktailId = ?',
      cocktail.id
    );

    fullCocktails.push({
      ...cocktail,
      alcoholTypes: alcoholTypes.map(a => a.alcoholType),
      ingredients: ingredients.map(i => ({
        name: i.name,
        amount: i.amount,
        isAlcohol: Boolean(i.isAlcohol),
        alcoholType: i.alcoholType || undefined,
      })),
    });
  }

  return fullCocktails;
};

export const getCocktailsWithAvailability = async (availableAlcoholTypes: AlcoholCategory[]): Promise<CocktailWithMatch[]> => {
  const allCocktails = await getAllCocktails();

  const cocktailsWithMatch: CocktailWithMatch[] = allCocktails.map(cocktail => {
    const missingAlcohol = cocktail.alcoholTypes.filter(
      type => !availableAlcoholTypes.includes(type)
    );

    const missingIngredients = cocktail.ingredients
      .filter(ing => ing.isAlcohol && ing.alcoholType && !availableAlcoholTypes.includes(ing.alcoholType))
      .map(ing => ing.name);

    return {
      ...cocktail,
      canMake: missingAlcohol.length === 0,
      missingAlcohol,
      missingIngredients,
    };
  });

  // Sort: can make first, then by difficulty
  return cocktailsWithMatch.sort((a, b) => {
    if (a.canMake && !b.canMake) return -1;
    if (!a.canMake && b.canMake) return 1;
    return a.missingAlcohol.length - b.missingAlcohol.length;
  });
};

export const searchCocktails = async (query: string): Promise<Cocktail[]> => {
  const db = getDatabase();
  const searchTerm = `%${query}%`;

  const cocktails = await db.getAllAsync<any>(
    'SELECT * FROM cocktails WHERE name LIKE ? OR category LIKE ?',
    searchTerm,
    searchTerm
  );

  // Fetch related data for each cocktail
  const fullCocktails: Cocktail[] = [];

  for (const cocktail of cocktails) {
    const alcoholTypes = await db.getAllAsync<{ alcoholType: AlcoholCategory }>(
      'SELECT alcoholType FROM cocktail_alcohol WHERE cocktailId = ?',
      cocktail.id
    );

    const ingredients = await db.getAllAsync<any>(
      'SELECT name, amount, isAlcohol, alcoholType FROM cocktail_ingredients WHERE cocktailId = ?',
      cocktail.id
    );

    fullCocktails.push({
      ...cocktail,
      alcoholTypes: alcoholTypes.map(a => a.alcoholType),
      ingredients: ingredients.map(i => ({
        name: i.name,
        amount: i.amount,
        isAlcohol: Boolean(i.isAlcohol),
        alcoholType: i.alcoholType || undefined,
      })),
    });
  }

  return fullCocktails;
};
