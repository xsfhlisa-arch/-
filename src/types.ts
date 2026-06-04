/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Phrase {
  word: string;
  pinyin: string;
  meaning: string;
}

export interface Character {
  id: string; // e.g. "日"
  word: string; // The character itself
  pinyin: string; // e.g. "rì"
  meaning: string; // e.g. "Sun / Day"
  category: string; // "nature" | "animals" | "numbers" | "actions" | "body"
  pictograph: string; // Origin story/pictograph hint
  level: number; // For progression
  emoji: string; // An emoji reflecting the word (e.g. "☀️")
  phrases: Phrase[]; // Example phrases/words
  strokesUrl?: string; // Optional SVG stroke order or custom guidance
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string; // lucide icon name
  description: string;
}

export interface UserProgress {
  stars: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  unlockedCharIds: string[];
  unlockedDates?: Record<string, string>; // Maps charId -> learned date, e.g. {"ri": "2026-06-01"}
  toBeLearnedCharIds?: string[]; // Want-to-learn plan list, e.g. ["shui", "huo"]
  collectedStickers: string[]; // Star quantity-based stickers (e.g., 50 stars, 100 stars, etc.)
  dailyRandomStickers?: string[]; // Daily random stickers from daily character learning
  savedDrawings: { id: string; charId: string; dataUrl: string; date: string }[];
  customCharacters?: Character[]; // Holds dynamically created parent custom characters
  deletedCharIds?: string[]; // Tracks deleted character IDs (both preset and custom) to clean up pools
}

export interface QuizQuestion {
  id: string;
  type: "char_to_pinyin" | "pinyin_to_char" | "char_to_meaning" | "char_to_emoji";
  question: string;
  questionChar?: string;
  options: string[];
  answer: string;
  explanation: string;
}
