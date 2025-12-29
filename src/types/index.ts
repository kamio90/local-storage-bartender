export interface Bottle {
  id: number;
  name: string;
  category: AlcoholCategory;
  photoUri: string;
  quantity: number;
  status: 'full' | 'low' | 'empty';
  dateAdded: string;
  notes?: string;
}

export type AlcoholCategory =
  | 'vodka'
  | 'whiskey'
  | 'rum'
  | 'gin'
  | 'tequila'
  | 'brandy'
  | 'liqueur'
  | 'wine'
  | 'beer'
  | 'other';

export interface Cocktail {
  id: number;
  name: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  alcoholTypes: AlcoholCategory[];
  ingredients: Ingredient[];
  instructions: string;
  garnish?: string;
  glassType?: string;
}

export interface Ingredient {
  name: string;
  amount: string;
  isAlcohol: boolean;
  alcoholType?: AlcoholCategory;
}

export interface CocktailWithMatch extends Cocktail {
  canMake: boolean;
  missingAlcohol: AlcoholCategory[];
  missingIngredients: string[];
}
