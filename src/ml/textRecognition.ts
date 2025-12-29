import { AlcoholCategory } from '../types';

// Simple keyword-based classification for alcohol types
const alcoholKeywords: Record<AlcoholCategory, string[]> = {
  vodka: ['vodka', 'водка'],
  whiskey: ['whiskey', 'whisky', 'bourbon', 'scotch', 'rye', 'tennessee'],
  rum: ['rum', 'ron', 'rhum'],
  gin: ['gin', 'genever', 'london dry'],
  tequila: ['tequila', 'mezcal'],
  brandy: ['brandy', 'cognac', 'armagnac', 'pisco'],
  liqueur: ['liqueur', 'amaro', 'aperol', 'campari', 'triple sec', 'cointreau', 'kahlua', 'baileys', 'amaretto', 'sambuca', 'schnapps'],
  wine: ['wine', 'vino', 'vin', 'champagne', 'prosecco', 'cava', 'vermouth'],
  beer: ['beer', 'ale', 'lager', 'ipa', 'stout', 'pilsner'],
  other: ['sake', 'soju', 'cachaça', 'cachaca', 'absinthe', 'aquavit'],
};

export const classifyAlcoholFromText = (text: string): AlcoholCategory => {
  const lowerText = text.toLowerCase();

  // Check each category
  for (const [category, keywords] of Object.entries(alcoholKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return category as AlcoholCategory;
      }
    }
  }

  return 'other';
};

export const extractBottleName = (text: string): string => {
  // Clean up the text
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    return 'Unknown Bottle';
  }

  // Try to find the brand name (usually one of the first few lines with substantial text)
  for (const line of lines.slice(0, 3)) {
    // Skip lines that are just numbers or very short
    if (line.length > 3 && !/^\d+$/.test(line)) {
      // Remove common suffixes like ABV, vol, ml, etc.
      const cleaned = line
        .replace(/\b\d+%\b/g, '')
        .replace(/\b\d+\s*(ml|l|oz|cl)\b/gi, '')
        .replace(/\b(abv|vol|alcohol)\b/gi, '')
        .trim();

      if (cleaned.length > 0) {
        return cleaned;
      }
    }
  }

  return lines[0];
};

// Mock OCR function that would use expo-ml-kit or similar
// In a real implementation, this would use the actual OCR library
export const recognizeTextFromImage = async (imageUri: string): Promise<string> => {
  // This is a placeholder. In production, you would use:
  // import TextRecognition from '@react-native-ml-kit/text-recognition';
  // const result = await TextRecognition.recognize(imageUri);
  // return result.text;

  console.log('OCR would process image:', imageUri);

  // For now, return empty string - user will use manual entry
  return '';
};
