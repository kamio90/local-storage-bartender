import { AlcoholCategory } from '../types';

// Enhanced keyword-based classification with brand recognition
const alcoholKeywords: Record<AlcoholCategory, string[]> = {
  vodka: [
    'vodka', 'водка', 'wódka',
    // Brands
    'absolut', 'grey goose', 'belvedere', 'smirnoff', 'titos', 'ketel one',
    'stolichnaya', 'ciroc', 'skyy', 'finlandia', 'reyka', 'chopin'
  ],
  whiskey: [
    'whiskey', 'whisky', 'bourbon', 'scotch', 'rye', 'tennessee', 'single malt', 'blended',
    // Brands
    'jack daniels', "jack daniel's", 'jim beam', 'makers mark', "maker's mark",
    'wild turkey', 'bulleit', 'woodford', 'four roses', 'knob creek',
    'johnnie walker', 'chivas', 'glenfiddich', 'glenlivet', 'macallan',
    'jameson', 'bushmills', 'tullamore', 'crown royal', 'canadian club'
  ],
  rum: [
    'rum', 'ron', 'rhum', 'cachaça', 'cachaca',
    // Brands
    'bacardi', 'captain morgan', 'havana club', 'mount gay', 'appleton',
    'diplomatico', 'el dorado', 'zacapa', 'flor de cana', 'plantation',
    'kraken', 'sailor jerry', 'malibu', 'myers', "pitu"
  ],
  gin: [
    'gin', 'genever', 'london dry', 'plymouth',
    // Brands
    'tanqueray', 'bombay', 'hendricks', "hendrick's", 'beefeater', 'gordon',
    'aviation', 'botanist', 'monkey 47', 'sipsmith', 'roku', 'malfy'
  ],
  tequila: [
    'tequila', 'mezcal', 'reposado', 'añejo', 'anejo', 'blanco', 'plata',
    // Brands
    'patron', 'don julio', 'herradura', 'casamigos', 'clase azul',
    'espolon', 'olmeca', 'jose cuervo', 'el jimador', 'codigo', '1800'
  ],
  brandy: [
    'brandy', 'cognac', 'armagnac', 'pisco', 'calvados',
    // Brands
    'hennessy', 'remy martin', 'courvoisier', 'martell', 'hine',
    'pierre ferrand', 'torres', 'metaxa', 'fundador'
  ],
  liqueur: [
    'liqueur', 'amaro', 'aperol', 'campari', 'triple sec', 'cointreau',
    'kahlua', 'baileys', 'amaretto', 'sambuca', 'schnapps', 'creme',
    'limoncello', 'frangelico', 'disaronno', 'jagermeister', 'fernet',
    'chartreuse', 'benedictine', 'drambuie', 'st germain', 'pimms'
  ],
  wine: [
    'wine', 'vino', 'vin', 'champagne', 'prosecco', 'cava', 'vermouth',
    'sparkling', 'brut', 'spumante', 'martini', 'cinzano', 'dolin',
    'moet', 'veuve', 'dom perignon'
  ],
  beer: [
    'beer', 'ale', 'lager', 'ipa', 'stout', 'pilsner', 'porter',
    'biere', 'cerveza', 'piwo', 'pivo',
    'budweiser', 'corona', 'heineken', 'guinness', 'stella'
  ],
  other: [
    'sake', 'soju', 'absinthe', 'aquavit', 'ouzo', 'raki', 'arak',
    'grappa', 'slivovitz', 'palinka', 'baijiu'
  ],
};

// Classification result with confidence score
export interface ClassificationResult {
  category: AlcoholCategory;
  confidence: number;
  matchedKeyword?: string;
}

export const classifyAlcoholFromText = (text: string): AlcoholCategory => {
  const result = classifyAlcoholWithConfidence(text);
  return result.category;
};

export const classifyAlcoholWithConfidence = (text: string): ClassificationResult => {
  const lowerText = text.toLowerCase();

  // Score each category based on keyword matches
  const scores: { category: AlcoholCategory; score: number; keyword?: string }[] = [];

  for (const [category, keywords] of Object.entries(alcoholKeywords)) {
    let bestScore = 0;
    let bestKeyword = '';

    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        // Longer keywords get higher scores (more specific)
        const keywordScore = keyword.length;

        // Exact word match gets bonus
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        const isExactWord = wordBoundaryRegex.test(text);
        const bonus = isExactWord ? 10 : 0;

        // Brand names (longer keywords) are more reliable
        const brandBonus = keyword.length > 8 ? 5 : 0;

        const totalScore = keywordScore + bonus + brandBonus;

        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestKeyword = keyword;
        }
      }
    }

    if (bestScore > 0) {
      scores.push({
        category: category as AlcoholCategory,
        score: bestScore,
        keyword: bestKeyword,
      });
    }
  }

  // Sort by score (highest first)
  scores.sort((a, b) => b.score - a.score);

  if (scores.length > 0) {
    const best = scores[0];
    const maxPossibleScore = 30; // Approximate max
    const confidence = Math.min(best.score / maxPossibleScore, 1.0);

    return {
      category: best.category,
      confidence,
      matchedKeyword: best.keyword,
    };
  }

  return {
    category: 'other',
    confidence: 0,
  };
};

export const extractBottleName = (text: string): string => {
  // Clean up the text
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    return '';
  }

  // Remove noise patterns
  const noisePatterns = [
    /\b\d+%\b/g,                      // Percentages
    /\b\d+\s*(ml|l|oz|cl|vol)\b/gi,  // Volume measurements
    /\b(abv|alcohol|proof|premium|quality|distilled)\b/gi, // Common words
    /^[0-9\s\-._]+$/,                 // Lines with only numbers/symbols
    /^(made|product|import|export|distributed|bottled)/gi, // Distribution text
  ];

  // Score each line based on likelihood of being the brand name
  const scoredLines = lines.map((line, index) => {
    let score = 0;

    // First few lines are more likely to be the brand
    if (index < 3) score += 10;
    if (index === 0) score += 5;

    // Longer lines are more likely to be the brand (but not too long)
    const length = line.length;
    if (length >= 5 && length <= 30) score += 5;
    if (length > 30 && length <= 50) score += 2;

    // Lines with capital letters are more likely to be brands
    const hasUpperCase = /[A-Z]/.test(line);
    if (hasUpperCase) score += 3;

    // Lines that match known brands get high score
    const lowerLine = line.toLowerCase();
    for (const keywords of Object.values(alcoholKeywords)) {
      for (const keyword of keywords) {
        if (keyword.length > 5 && lowerLine.includes(keyword)) {
          score += 15;
          break;
        }
      }
    }

    // Clean the line
    let cleaned = line;
    for (const pattern of noisePatterns) {
      cleaned = cleaned.replace(pattern, '');
    }
    cleaned = cleaned.trim();

    // Penalize if too much was removed
    if (cleaned.length < line.length * 0.5) {
      score -= 5;
    }

    // Penalize very short cleaned text
    if (cleaned.length < 3) {
      score -= 10;
    }

    return { line: cleaned || line, score };
  });

  // Sort by score
  scoredLines.sort((a, b) => b.score - a.score);

  // Return the best scoring line
  const best = scoredLines[0];
  return best && best.line.length > 2 ? best.line : '';
};

// OCR with ML Kit integration
export const recognizeTextFromImage = async (imageUri: string): Promise<string> => {
  try {
    // Try to use ML Kit Text Recognition
    // Note: This requires @react-native-ml-kit/text-recognition to be properly configured

    // Dynamically import to handle cases where it's not available
    try {
      const TextRecognition = await import('@react-native-ml-kit/text-recognition');

      console.log('Starting ML Kit OCR for:', imageUri);
      const result = await TextRecognition.default.recognize(imageUri);

      console.log('OCR completed, detected text:', result.text);
      return result.text || '';
    } catch (importError) {
      console.log('ML Kit not available, using fallback mode');
      // ML Kit not available - return empty string for manual entry
      return '';
    }
  } catch (error) {
    console.error('OCR processing error:', error);
    return '';
  }
};

// Full OCR result with confidence
export interface OCRResult {
  text: string;
  extractedName: string;
  classification: ClassificationResult;
  confidence: number;
}

export const processBottleImage = async (imageUri: string): Promise<OCRResult> => {
  try {
    // Step 1: Run OCR
    const recognizedText = await recognizeTextFromImage(imageUri);

    if (!recognizedText || recognizedText.trim().length === 0) {
      return {
        text: '',
        extractedName: '',
        classification: { category: 'other', confidence: 0 },
        confidence: 0,
      };
    }

    // Step 2: Extract bottle name
    const extractedName = extractBottleName(recognizedText);

    // Step 3: Classify alcohol type
    const classification = classifyAlcoholWithConfidence(recognizedText);

    // Step 4: Calculate overall confidence
    const nameConfidence = extractedName.length > 0 ? 0.5 : 0;
    const overallConfidence = (nameConfidence + classification.confidence) / 2;

    return {
      text: recognizedText,
      extractedName,
      classification,
      confidence: overallConfidence,
    };
  } catch (error) {
    console.error('Error processing bottle image:', error);
    return {
      text: '',
      extractedName: '',
      classification: { category: 'other', confidence: 0 },
      confidence: 0,
    };
  }
};
