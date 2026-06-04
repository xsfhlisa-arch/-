/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Character, UserProgress } from "./types";
import { CHARACTERS, PRECOMPILED_LOOKUP_DICT } from "./data/characters";
import { pinyin } from "pinyin-pro";
import Dashboard from "./components/Dashboard";
import QuizGame from "./components/QuizGame";
import StoryGenerator from "./components/StoryGenerator";
import WritingCanvas from "./components/WritingCanvas";
import StudyChecklist from "./components/StudyChecklist";
import TrophySafe from "./components/TrophySafe";
import WeChatExporter from "./components/WeChatExporter";
import { Compass, PenTool, CheckCircle2, Trophy, HelpCircle, ArrowLeft, Trash2, Milestone, Star, Flame, Sparkles, BookOpen, Key } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const PROGRESS_STORAGE_KEY = "child_literacy_paradise_progress_v4";

// Exact Default Values to match user screens perfectly on first launch
const INITIAL_DEMO_PROGRESS: UserProgress = {
  stars: 0,
  streak: 0,
  lastActiveDate: "2026-06-04",
  unlockedCharIds: [], 
  unlockedDates: {},
  toBeLearnedCharIds: [],
  collectedStickers: [],
  dailyRandomStickers: [],
  savedDrawings: []
};

// Common child vocabulary words table to resolve lookups dynamically
const CUSTOM_DICT: Record<string, Partial<Character>> = {
  "天": {
    id: "tian_sky",
    word: "天",
    pinyin: "tiān",
    meaning: "天空 / 白天",
    category: "nature",
    pictograph: "像一个高高站立的巨人张开双脚，头部上方的无限苍穹就是无限无尽的‘天’。",
    emoji: "☀️",
    phrases: [
      { word: "天空", pinyin: "tiān kōng", meaning: "鸟儿展开羽翼飞上白云间的深蓝色大舞台" },
      { word: "天天", pinyin: "tiān tiān", meaning: "意指每一天，如天天读书，天天长高高哟！" }
    ]
  },
  "门": {
    id: "men_gate",
    word: "門",
    pinyin: "mén",
    meaning: "大门 / 门框",
    category: "nature",
    pictograph: "线和画画出了古代木板大门双扉的架框：开启大门迎白云，闭合大门风呼啸。",
    emoji: "🚪",
    phrases: [
      { word: "开门", pinyin: "kāi mén", meaning: "用手轻轻一拉，让大门外明亮的阳光洒进来" },
      { word: "门口", pinyin: "mén kǒu", meaning: "小猫小狗经常守候等待爸爸下班回家的温暖通道" }
    ]
  },
  "开": {
    id: "kai_open",
    word: "开",
    pinyin: "kāi",
    meaning: "打开 / 开启",
    category: "actions",
    pictograph: "画出双手用力将重重的木大门栓向两侧拉开、迎入春风的姿态。",
    emoji: "🔓",
    phrases: [
      { word: "开心", pinyin: "kāi xīn", meaning: "心里开出乐呵呵的金色向日葵，把不爽统统吹跑" },
      { word: "开花", pinyin: "kāi huā", meaning: "绿草里的小花骨朵悄悄绽放出五颜六色的衣服" }
    ]
  },
  "关": {
    id: "guan_close",
    word: "关",
    pinyin: "guān",
    meaning: "关闭 / 关怀",
    category: "actions",
    pictograph: "在两扇大门之间加上重重铁闩交叉，表示保护、闭合。也是对宝宝的关怀之声哦。",
    emoji: "🔒",
    phrases: [
      { word: "关门", pinyin: "guān mén", meaning: "小宝贝要把大门关紧，风呼呼就吹不进来啦" },
      { word: "关心", pinyin: "guān xīn", meaning: "妈妈搂紧着你，亲吻你红彤彤脸颊的最贴心举动" }
    ]
  },
  "风": {
    id: "feng_wind",
    word: "风",
    pinyin: "fēng",
    meaning: "流动的空气",
    category: "nature",
    pictograph: "看不见却能让满山花朵飞舞、漫天风筝高飞的空气流动大法！",
    emoji: "🍃",
    phrases: [
      { word: "大风", pinyin: "dà fēng", meaning: "呼呼卷过来时，像金色手套一样把红叶全掀起来了" },
      { word: "风车", pinyin: "fēng chē", meaning: "小手拿着红色小轮，风一吹就转啊转不停" }
    ]
  },
  "云": {
    id: "yun_cloud",
    word: "云",
    pinyin: "yún",
    meaning: "白云 / 云朵",
    category: "nature",
    pictograph: "空中一团团升腾的水蒸气，在碧蓝大背景下像一只只柔软的白绵羊。",
    emoji: "☁️",
    phrases: [
      { word: "白云", pinyin: "bái yún", meaning: "好比大棉花糖一样在头顶飘来飘去的小松软" },
      { word: "云彩", pinyin: "yún cǎi", meaning: "黄昏把白云烧成了粉色、紫色的仙境衣裳" }
    ]
  }
};

// Generate highly custom child descriptor cards for any unseen words
const generateCustomCharacterObj = (word: string): Character => {
  const uniqueSuffix = Math.random().toString(36).substring(2, 9);
  
  // Try to lookup from our rich databases
  const matchedPrecompiled = (PRECOMPILED_LOOKUP_DICT || []).find((c) => c.word === word);
  if (matchedPrecompiled) {
    return {
      ...matchedPrecompiled,
      id: `custom_${Date.now()}_${uniqueSuffix}` // keep ID unique and custom managed so it's fully deletable!
    };
  }

  const matchedDict = CUSTOM_DICT[word];
  if (matchedDict) {
    return {
      ...generateCustomCharacterObjFallback(word, uniqueSuffix),
      ...matchedDict,
      id: `custom_${Date.now()}_${uniqueSuffix}`
    } as Character;
  }

  return generateCustomCharacterObjFallback(word, uniqueSuffix);
};

const generateCustomCharacterObjFallback = (word: string, suffix?: string): Character => {
  const uniqueSuffix = suffix || Math.random().toString(36).substring(2, 9);
  
  // Calculate correct phonetic pinyin dynamically via pinyin-pro synchronously!
  const computedPinyin = pinyin(word, { toneType: "symbol" }) || "zì";
  const firstPhraseWord = `${word}儿`;
  const firstPhrasePinyin = pinyin(firstPhraseWord, { toneType: "symbol" }) || `${computedPinyin} ér`;
  const secondPhraseWord = `学习${word}`;
  const secondPhrasePinyin = pinyin(secondPhraseWord, { toneType: "symbol" }) || `xué xí ${computedPinyin}`;

  return {
    id: `custom_${Date.now()}_${uniqueSuffix}`,
    word: word,
    pinyin: computedPinyin, 
    meaning: "生字精灵",
    category: "nature",
    pictograph: `大自然和古画中的神奇小汉字【${word}】。让我们一笔一画写在红田字格里，把它收入宝宝的识字宝箱吧！`,
    level: 1,
    emoji: "✍️",
    phrases: [
      { word: firstPhraseWord, pinyin: firstPhrasePinyin, meaning: `关于汉字“${word}”的日常好听词组` },
      { word: secondPhraseWord, pinyin: secondPhrasePinyin, meaning: `和爸爸妈妈一笔一画描红“${word}”字，非常快乐` }
    ]
  };
};

export default function App() {
  const [currentView, setCurrentView] = useState<"lobby" | "quiz" | "story_maker">("lobby");
  const [currentTab, setCurrentTab] = useState<"lobby" | "writing" | "checklist" | "trophy">("lobby");

  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [activeSubView, setActiveSubView] = useState<"detail" | "canvas">("detail");
  const [progress, setProgress] = useState<UserProgress>(INITIAL_DEMO_PROGRESS);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState("2026-06-04");
  const [alertMessage, setAlertMessage] = useState<{ text: string; date?: string; word?: string } | null>(null);
  const [showWeChatModal, setShowWeChatModal] = useState(false);
  const [customInputWriteWord, setCustomInputWriteWord] = useState("");

  // Background enrichment using server Gemini model or local fallbacks to retrieve nice pictographs
  const enrichCustomCharacterWithAI = async (word: string, id: string) => {
    try {
      const response = await fetch("/api/gemini/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word })
      });
      if (response.ok) {
        const data = await response.json();
        
        // Update state progress list
        setProgress(prev => {
          const custom = prev.customCharacters || [];
          const nextCustom = custom.map(c => {
            if (c.id === id || c.word === word) {
              return {
                ...c,
                pinyin: data.pinyin || c.pinyin,
                meaning: data.meaning || c.meaning,
                pictograph: data.pictograph || c.pictograph,
                emoji: data.emoji || c.emoji,
                phrases: data.phrases || c.phrases
              };
            }
            return c;
          });
          
          const updated = {
            ...prev,
            customCharacters: nextCustom
          };
          localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });

        // Also update selectedChar details if it matches the current practice
        setSelectedChar(prev => {
          if (prev && (prev.id === id || prev.word === word)) {
            return {
              ...prev,
              pinyin: data.pinyin || prev.pinyin,
              meaning: data.meaning || prev.meaning,
              pictograph: data.pictograph || prev.pictograph,
              emoji: data.emoji || prev.emoji,
              phrases: data.phrases || prev.phrases
            };
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Enrich character profile failed:", err);
    }
  };

  // Load progress on mount
  useEffect(() => {
    const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (saved) {
      try {
        const loaded: UserProgress = JSON.parse(saved);
        setProgress({
          ...INITIAL_DEMO_PROGRESS,
          ...loaded,
          unlockedDates: {
            ...INITIAL_DEMO_PROGRESS.unlockedDates,
            ...(loaded.unlockedDates || {})
          },
          customCharacters: loaded.customCharacters || [],
          deletedCharIds: loaded.deletedCharIds || []
        });
      } catch (e) {
        console.error("Error loading child progress v4", e);
        setProgress(INITIAL_DEMO_PROGRESS);
      }
    } else {
      setProgress(INITIAL_DEMO_PROGRESS);
    }
  }, []);

  // Save progress changes helper
  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(newProgress));
  };

  const playPronunciation = (word: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "zh-CN";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Add character to waitlist or redirect to writing canvas instantly
  const handleAddAndLearnWord = (word: string) => {
    const masteredList = progress.unlockedCharIds || [];

    // Check if matching in preloaded list or custom characters
    const foundPreloaded = CHARACTERS.find((c) => c.word === word) || 
                          Object.values(CUSTOM_DICT).find((c) => c.word === word) ||
                          (progress.customCharacters || []).find((c) => c.word === word);
    
    const matchedId = foundPreloaded ? foundPreloaded.id : null;

    // Check if already learned
    const isLearned = masteredList.some((id) => {
      if (id === matchedId) return true;
      const charObj = CHARACTERS.find((c) => c.id === id) || 
                      Object.values(CUSTOM_DICT).find((c) => c.id === id) ||
                      (progress.customCharacters || []).find((c) => c.id === id);
      return charObj?.word === word || id === word;
    });

    if (isLearned) {
      // Find exact learned date
      const unlockedDates = progress.unlockedDates || {};
      let learnedDate = "2026-06-04"; // default mock
      
      if (matchedId && unlockedDates[matchedId]) {
        learnedDate = unlockedDates[matchedId];
      } else {
        for (let key in unlockedDates) {
          if (key === word || key === matchedId) {
            learnedDate = unlockedDates[key];
            break;
          }
        }
      }

      setAlertMessage({
        text: `已经学过啦！`,
        date: learnedDate,
        word: word
      });

      playPronunciation(word);
      return;
    }

    // New item - Join and Learn!
    let charToTrace: Character;
    let nextCustomChars = [...(progress.customCharacters || [])];

    if (foundPreloaded) {
      charToTrace = { ...foundPreloaded } as Character;
    } else {
      charToTrace = generateCustomCharacterObj(word);
      if (!nextCustomChars.some((c) => c.word === word)) {
        nextCustomChars.push(charToTrace);
      }
      // Trigger AI background profiling to fetch custom pictographs & phrases
      enrichCustomCharacterWithAI(word, charToTrace.id);
    }

    // Add to lists of toBeLearned
    const waitList = progress.toBeLearnedCharIds || [];
    let nextWaitList = [...waitList];
    if (!waitList.includes(charToTrace.id)) {
      nextWaitList = [...waitList, charToTrace.id];
    }

    // Recover if was in deletedCharIds
    const deletedList = progress.deletedCharIds || [];
    const nextDeleted = deletedList.filter((id) => id !== charToTrace.id && id !== charToTrace.word);

    const updated = {
      ...progress,
      toBeLearnedCharIds: nextWaitList,
      customCharacters: nextCustomChars,
      deletedCharIds: nextDeleted
    };

    saveProgress(updated);

    // Auto navigate to writing board tab with this target
    setSelectedChar(charToTrace);
    setActiveSubView("canvas");
    setCurrentTab("writing");

    // Approve Voice
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(`已加入清单！快手拉大白板写个“${word}”字吧！`);
      speech.lang = "zh-CN";
      speech.rate = 0.85;
      window.speechSynthesis.speak(speech);
    }
  };

  // Parent bulk upload of characters to the preparation list (toBeLearned list)
  const handleUploadToBeLearnedList = (addedIds: string[], customWords: string[] = []) => {
    const custom = [...(progress.customCharacters || [])];
    const existingToBeLearned = [...(progress.toBeLearnedCharIds || [])];

    // Selected preloaded characters
    addedIds.forEach(id => {
      if (!existingToBeLearned.includes(id)) {
        existingToBeLearned.push(id);
      }
    });

    // Custom typed words
    customWords.forEach(word => {
      const found = allCharactersList.find(c => c.word === word) || CHARACTERS.find(c => c.word === word);
      let targetId = found ? found.id : null;
      if (!found) {
        const newChar = generateCustomCharacterObj(word);
        custom.push(newChar);
        targetId = newChar.id;
        // Background AI profiling
        enrichCustomCharacterWithAI(word, newChar.id);
      }
      if (targetId && !existingToBeLearned.includes(targetId)) {
        existingToBeLearned.push(targetId);
      }
    });

    const totalCount = addedIds.length + customWords.length;
    const extraStars = totalCount * 10;
    const updatedStars = progress.stars + extraStars;

    const updated = {
      ...progress,
      toBeLearnedCharIds: existingToBeLearned,
      customCharacters: custom,
      stars: updatedStars
    };

    saveProgress(updated);
  };

const REWARD_DAILY_STICKERS = [
  "strawberry_duck",
  "lion_fire",
  "dino_rex",
  "penguin_jump",
  "ice_cream",
  "space_rocket"
];

  // Bulk mark chosen waitlist IDs as learned
  const handleLearnCharactersBulk = (unlockedIds: string[]) => {
    const today = selectedCalendarDate || new Date().toISOString().split("T")[0];
    
    const existingUnlocked = progress.unlockedCharIds || [];
    const updatedUnlocked = [...existingUnlocked];
    const updatedDates = { ...(progress.unlockedDates || {}) };

    unlockedIds.forEach((id) => {
      if (!updatedUnlocked.includes(id)) {
        updatedUnlocked.push(id);
      }
      updatedDates[id] = today; // Register perfectly on chosen selected date
    });

    const waitList = progress.toBeLearnedCharIds || [];
    const updatedWait = waitList.filter((id) => !unlockedIds.includes(id));

    const extraStars = unlockedIds.length * 10;
    const updatedStars = progress.stars + extraStars;

    // Roll random daily badge
    const currentDaily = progress.dailyRandomStickers || [];
    const updatedDaily = [...currentDaily];
    if (unlockedIds.length > 0) {
      const randomBadge = REWARD_DAILY_STICKERS[Math.floor(Math.random() * REWARD_DAILY_STICKERS.length)];
      if (!updatedDaily.includes(randomBadge)) {
        updatedDaily.push(randomBadge);
      }
    }

    const updated = {
      ...progress,
      unlockedCharIds: updatedUnlocked,
      unlockedDates: updatedDates,
      toBeLearnedCharIds: updatedWait,
      stars: updatedStars,
      dailyRandomStickers: updatedDaily
    };

    saveProgress(updated);
  };

  // Permanently delete a character from anywhere in the app (by ID or word)
  const handleDeleteCustomCharacter = (charIdOrWord: string) => {
    const matched = allCharactersList.find(c => c.id === charIdOrWord || c.word === charIdOrWord) ||
                    CHARACTERS.find(c => c.id === charIdOrWord || c.word === charIdOrWord) ||
                    Object.values(CUSTOM_DICT).find(c => c.id === charIdOrWord || c.word === charIdOrWord) ||
                    (progress.customCharacters || []).find(c => c.id === charIdOrWord || c.word === charIdOrWord);

    const idToDelete = matched ? matched.id : charIdOrWord;
    const wordToDelete = matched ? matched.word : charIdOrWord;

    const custom = progress.customCharacters || [];
    const nextCustom = custom.filter((c) => c.id !== idToDelete && c.word !== wordToDelete);

    const waitList = progress.toBeLearnedCharIds || [];
    const nextWait = waitList.filter((id) => id !== idToDelete && id !== wordToDelete);

    const unlockedList = progress.unlockedCharIds || [];
    const nextUnlocked = unlockedList.filter((id) => id !== idToDelete && id !== wordToDelete);

    // Completely remove from CUSTOM_DICT
    if (CUSTOM_DICT[idToDelete]) {
      delete CUSTOM_DICT[idToDelete];
    }
    if (CUSTOM_DICT[wordToDelete]) {
      delete CUSTOM_DICT[wordToDelete];
    }

    // Save in deleted pool so we can filter it out of calculations
    const deletedList = progress.deletedCharIds || [];
    const nextDeleted = [...deletedList];
    if (idToDelete && !nextDeleted.includes(idToDelete)) {
      nextDeleted.push(idToDelete);
    }

    const updated = {
      ...progress,
      customCharacters: nextCustom,
      toBeLearnedCharIds: nextWait,
      unlockedCharIds: nextUnlocked,
      deletedCharIds: nextDeleted
    };
    saveProgress(updated);

    if (selectedChar && (selectedChar.id === idToDelete || selectedChar.word === wordToDelete)) {
      setSelectedChar(null);
    }
  };

  // Permanently clear ALL custom characters from the entire app
  const handleClearAllCustomCharacters = () => {
    const waitList = progress.toBeLearnedCharIds || [];
    const nextWait = waitList.filter((id) => !id.startsWith("custom_"));

    const unlockedList = progress.unlockedCharIds || [];
    const nextUnlocked = unlockedList.filter((id) => !id.startsWith("custom_"));

    const updated = {
      ...progress,
      customCharacters: [],
      toBeLearnedCharIds: nextWait,
      unlockedCharIds: nextUnlocked
    };
    saveProgress(updated);

    if (selectedChar && selectedChar.id.startsWith("custom_")) {
      setSelectedChar(null);
    }
  };

  // Unlearn a mastered/learned character
  const handleUnlearnMasteredCharacter = (charIdOrWord: string) => {
    const matched = allCharactersList.find(c => c.id === charIdOrWord || c.word === charIdOrWord) ||
                    CHARACTERS.find(c => c.id === charIdOrWord || c.word === charIdOrWord) ||
                    Object.values(CUSTOM_DICT).find(c => c.id === charIdOrWord || c.word === charIdOrWord) ||
                    (progress.customCharacters || []).find(c => c.id === charIdOrWord || c.word === charIdOrWord);

    const idToDelete = matched ? matched.id : charIdOrWord;
    const wordToDelete = matched ? matched.word : charIdOrWord;

    const unlockedList = progress.unlockedCharIds || [];
    const nextUnlocked = unlockedList.filter((id) => id !== idToDelete && id !== wordToDelete);

    // Add back to toBeLearned list
    const waitList = progress.toBeLearnedCharIds || [];
    const nextWaitList = [...waitList];
    if (idToDelete && !nextWaitList.includes(idToDelete)) {
      nextWaitList.push(idToDelete);
    }

    // Clean up unlocked date mapping
    const nextDates = { ...progress.unlockedDates };
    if (idToDelete) delete nextDates[idToDelete];
    if (wordToDelete) delete nextDates[wordToDelete];

    const updated = {
      ...progress,
      unlockedCharIds: nextUnlocked,
      toBeLearnedCharIds: nextWaitList,
      unlockedDates: nextDates
    };
    saveProgress(updated);
  };

  const handleClearMasteredLibrary = () => {
    const updated = {
      ...progress,
      unlockedCharIds: [],
      unlockedDates: {}
    };
    saveProgress(updated);
  };

  const handleRestoreDeletedCharacters = () => {
    const updated = {
      ...progress,
      deletedCharIds: []
    };
    saveProgress(updated);
  };

  // Save drawing image
  const handleSaveDrawing = (dataUrl: string) => {
    if (!currentWritingCharacter) return;
    
    // Earn 5 stars
    const today = selectedCalendarDate || "2026-06-04";
    const newDrawing = {
      id: `draw-${Date.now()}`,
      charId: currentWritingCharacter.id,
      dataUrl,
      date: today
    };

    const updatedDrawings = [newDrawing, ...(progress.savedDrawings || [])];
    const updatedStars = progress.stars + 5;

    // Unlocked lists (no duplicates)
    const existingUnlocked = progress.unlockedCharIds || [];
    const updatedUnlocked = [...existingUnlocked];
    const updatedDates = { ...(progress.unlockedDates || {}) };
    const charId = currentWritingCharacter.id;

    if (!updatedUnlocked.includes(charId)) {
      updatedUnlocked.push(charId);
    }
    updatedDates[charId] = today;

    // Remove from waitlist
    const waitList = progress.toBeLearnedCharIds || [];
    const updatedWait = waitList.filter((id) => id !== charId);

    // Roll random daily badge if it is a new master
    const currentDaily = progress.dailyRandomStickers || [];
    const updatedDaily = [...currentDaily];
    const isNewUnlock = !existingUnlocked.includes(charId);
    if (isNewUnlock) {
      const randomBadge = REWARD_DAILY_STICKERS[Math.floor(Math.random() * REWARD_DAILY_STICKERS.length)];
      if (!updatedDaily.includes(randomBadge)) {
        updatedDaily.push(randomBadge);
      }
    }

    const updated = {
      ...progress,
      savedDrawings: updatedDrawings,
      stars: updatedStars,
      unlockedCharIds: updatedUnlocked,
      unlockedDates: updatedDates,
      toBeLearnedCharIds: updatedWait,
      dailyRandomStickers: updatedDaily
    };

    saveProgress(updated);
  };

  // Quiz completed trigger
  const handleQuizComplete = (starsEarned: number, stickerId?: string) => {
    const stickers = [...(progress.collectedStickers || [])];
    if (stickerId && !stickers.includes(stickerId)) {
      stickers.push(stickerId);
    }

    const updated = {
      ...progress,
      stars: progress.stars + starsEarned,
      collectedStickers: stickers
    };

    saveProgress(updated);
  };

  // Compile a comprehensive list of all accessible characters (purely those that are custom-added/uploaded by the user!)
  const getAllAccessibleCharacters = (): Character[] => {
    const master: Character[] = [];
    
    // Add custom ones from progress
    if (progress.customCharacters) {
      progress.customCharacters.forEach((char) => {
        if (!master.some((m) => m.id === char.id || m.word === char.word)) {
          master.push(char);
        }
      });
    }
    const deletedIds = progress.deletedCharIds || [];
    return master.filter((c) => !deletedIds.includes(c.id));
  };

  const allCharactersList = getAllAccessibleCharacters();

  // Find fallback character for Writing Tracing tab
  const getTracerTarget = (): Character => {
    if (selectedChar) return selectedChar;
    
    // Fallback 1: Take first item in study checklist
    const waitList = progress.toBeLearnedCharIds || [];
    if (waitList.length > 0) {
      const match = allCharactersList.find((c) => c.id === waitList[0] || c.word === waitList[0]);
      if (match) return match;
    }

    // Fallback 2: Take first user custom-added character
    if (allCharactersList && allCharactersList.length > 0) {
      return allCharactersList[0];
    }

    // Fallback 3: First predefined dictionary or absolute backup character to prevent crash
    if (PRECOMPILED_LOOKUP_DICT && PRECOMPILED_LOOKUP_DICT.length > 0) {
      return PRECOMPILED_LOOKUP_DICT[0];
    }

    return {
      id: "fallback_empty",
      word: "字",
      pinyin: "zì",
      meaning: "汉字宝贝",
      category: "nature",
      pictograph: "这是一个神奇的汉字，快输入你想练习的汉字来描红吧！",
      level: 1,
      emoji: "✍️",
      phrases: [
        { word: "写字", pinyin: "xiě zì", meaning: "用笔一笔一划写出好看的字来" }
      ]
    };
  };

  const currentWritingCharacter = getTracerTarget();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-rose-100 select-none pb-2" id="applet-viewport">
      
      {/* Top Banner Parent WeChat Export Shortcut */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 flex items-center justify-between text-xs font-black shadow-sm shrink-0">
        <span className="flex items-center gap-1">
          <Sparkles size={14} className="text-yellow-300 animate-spin" />
          <span>新升级！识字App代码直接一键导出微信小程序开发包 💻</span>
        </span>
        <button
          onClick={() => setShowWeChatModal(true)}
          className="bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm text-[10px] active:scale-[0.98] cursor-pointer transition"
        >
          <Key size={11} />
          家长高级导出➔
        </button>
      </div>

      {/* View Router */}
      <div className="flex-1 overflow-y-auto">
        {currentView === "lobby" && (
          <div className="max-w-md mx-auto w-full bg-white min-h-full shadow-xl flex flex-col justify-between border-x border-slate-200 relative pb-20">
            
            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto">
              
              {/* Header metrics bar row */}
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-3 pb-4 flex items-center justify-between shadow-sm rounded-b-[2rem] shrink-0">
                <div className="flex items-center gap-1">
                  <Flame size={15} className="text-yellow-300 animate-pulse" />
                  <span className="text-xs font-black">第 <strong className="text-yellow-300 text-sm font-black">{progress.streak}</strong> 天打卡</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm shadow-inner text-yellow-300 font-extrabold text-xs">
                    <span>⭐</span>
                    <span className="text-white font-mono">{progress.stars} 星星</span>
                  </div>
                </div>
              </div>

              {/* Lobby Views Switches */}
              {currentTab === "lobby" && (
                <Dashboard
                  userProgress={progress}
                  allCharacters={allCharactersList}
                  onAddAndLearnWord={handleAddAndLearnWord}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                  selectedCalendarDate={selectedCalendarDate}
                  onSelectCalendarDate={(date) => setSelectedCalendarDate(date)}
                  alertMessage={alertMessage}
                  onCloseAlert={() => setAlertMessage(null)}
                />
              )}

              {currentTab === "writing" && (
                <div className="p-4" id="writing-tab-enclosure">
                  {activeSubView === "detail" ? (
                    <div className="bg-rose-50/50 border border-rose-100 rounded-[2.5rem] p-5 shadow-inner flex flex-col gap-4 animate-fade-in">
                      {/* Character Summary Details Header */}
                      <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] border border-rose-100 shadow-sm relative overflow-hidden">
                        <div className="absolute -right-3 -top-3 text-7xl select-none opacity-10 animate-pulse">
                          {currentWritingCharacter.emoji}
                        </div>
                        <div>
                          <div className="text-2xl font-black text-rose-950 font-serif flex items-center gap-2">
                            <span>{currentWritingCharacter.word}</span>
                            <span className="text-xs bg-amber-100 px-2.5 py-0.5 rounded-full font-bold font-mono text-amber-800">
                              {currentWritingCharacter.pinyin}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-500 font-bold mt-1.5">
                            意指：{currentWritingCharacter.meaning}
                          </p>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl shadow-sm">
                          {currentWritingCharacter.emoji}
                        </div>
                      </div>

                      {/* Custom Character Handwriting Selector Tool per feedback #7 */}
                      <div className="bg-white rounded-[2rem] p-4 border border-rose-100 shadow-sm flex flex-col gap-2.5">
                        <h4 className="text-xs font-black text-rose-800 flex items-center gap-1.5">
                          ✍️ 换一个字写？在下方输入你想练习的任何字：
                        </h4>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="例如：安、爱、喜、乐"
                            value={customInputWriteWord}
                            onChange={(e) => setCustomInputWriteWord(e.target.value)}
                            maxLength={8}
                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-400 font-sans"
                          />
                          <button
                            onClick={() => {
                              const trimmed = customInputWriteWord.trim();
                              if (!trimmed) {
                                alert("请输入要书写或练习的字哦~");
                                return;
                              }
                              // Pick first character
                              const charToUse = trimmed.charAt(0);
                              
                              // Check if is in list of preloaded characters
                              const matched = allCharactersList.find(c => c.word === charToUse);
                              if (matched) {
                                setSelectedChar(matched);
                                playPronunciation(charToUse);
                              } else {
                                // Create custom character and save in custom list
                                const newCustomChar = generateCustomCharacterObj(charToUse);
                                // Save inside progress.customCharacters
                                const currentCustom = progress.customCharacters || [];
                                const updatedCustom = [...currentCustom];
                                if (!updatedCustom.some((c) => c.word === charToUse)) {
                                  updatedCustom.push(newCustomChar);
                                }
                                const updated = {
                                  ...progress,
                                  customCharacters: updatedCustom
                                };
                                saveProgress(updated);
                                setSelectedChar(newCustomChar);
                                playPronunciation(charToUse);
                              }
                              setCustomInputWriteWord("");
                            }}
                            className="px-4.5 py-2 bg-gradient-to-r from-rose-400 to-pink-500 hover:opacity-90 text-white rounded-xl text-xs font-bold shadow cursor-pointer transition transform active:scale-95"
                          >
                            去写它 ➡️
                          </button>
                        </div>
                      </div>

                      {/* Origin story description */}
                      <div className="bg-white rounded-[2rem] p-5 border border-rose-100 shadow-sm">
                        <h4 className="text-xs font-black text-amber-800 flex items-center gap-1.5 mb-2.5">
                          🎨 字形演变与故事：
                        </h4>
                        <p className="text-[11px] text-slate-650 leading-relaxed font-semibold">
                          {currentWritingCharacter.pictograph}
                        </p>
                      </div>

                      {/* Phrases example */}
                      <div className="bg-white rounded-[2rem] p-5 border border-rose-100 shadow-sm flex flex-col gap-3">
                        <h4 className="text-xs font-black text-violet-800 flex items-center gap-1.5">
                          🗣️ 宝贝常用词组：
                        </h4>
                        <div className="grid grid-cols-2 gap-2.5">
                          {currentWritingCharacter.phrases && currentWritingCharacter.phrases.map((ph, idx) => (
                            <div key={idx} className="bg-slate-50/70 border border-slate-100 p-2.5 rounded-xl flex flex-col gap-1 text-left">
                              <div className="text-xs font-black text-slate-700 flex items-center justify-between">
                                <span>{ph.word}</span>
                                <span className="text-[9px] font-bold text-slate-405 font-mono">{ph.pinyin}</span>
                              </div>
                              <p className="text-[9.5px] text-slate-400 font-medium leading-normal mt-0.5">
                                {ph.meaning}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Go to Canvas button */}
                      <button
                        onClick={() => {
                          setActiveSubView("canvas");
                          playPronunciation(currentWritingCharacter.word);
                        }}
                        className="w-full py-4.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black rounded-[2rem] shadow shadow-orange-100 text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition transform hover:translate-y-[-1px]"
                      >
                        <PenTool size={16} className="animate-pulse" />
                        ✍️ 进入方格黑板 · 笔顺描红练习
                      </button>
                    </div>
                  ) : (
                    <WritingCanvas
                      character={currentWritingCharacter}
                      onSaveDrawing={handleSaveDrawing}
                      onClose={() => setActiveSubView("detail")}
                    />
                  )}
                </div>
              )}

              {currentTab === "checklist" && (
                <div className="p-4">
                  <StudyChecklist
                    userProgress={progress}
                    allCharacters={allCharactersList}
                    onLearnCharacters={handleLearnCharactersBulk}
                    onUploadToBeLearnedList={handleUploadToBeLearnedList}
                    onUpdateToBeLearned={(newIds) => {
                      const updated = {
                        ...progress,
                        toBeLearnedCharIds: newIds
                      };
                      saveProgress(updated);
                    }}
                    onSelectCharacterToWrite={(char) => {
                      setSelectedChar(char);
                      setActiveSubView("canvas");
                      setCurrentTab("writing");
                    }}
                    selectedCalendarDate={selectedCalendarDate}
                    onDeleteCustomCharacter={handleDeleteCustomCharacter}
                    onClearAllCustomCharacters={handleClearAllCustomCharacters}
                    onRestoreDeletedCharacters={handleRestoreDeletedCharacters}
                  />
                </div>
              )}

              {currentTab === "trophy" && (
                <TrophySafe
                  userProgress={progress}
                  allCharacters={allCharactersList}
                  onCharacterSelect={(char) => {
                    setSelectedChar(char);
                    setActiveSubView("detail");
                    setCurrentTab("writing");
                  }}
                  onNavigate={(view) => setCurrentView(view)}
                  onUnlockCharacters={handleLearnCharactersBulk}
                  onUnlearnMasteredCharacter={handleUnlearnMasteredCharacter}
                  onDeleteCustomCharacter={handleDeleteCustomCharacter}
                  onClearMasteredLibrary={handleClearMasteredLibrary}
                  selectedCalendarDate={selectedCalendarDate}
                  onClose={() => setCurrentTab("lobby")}
                />
              )}

            </div>

            {/* Bottom Tab Navigation Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-white/95 border-t border-slate-150 py-2.5 px-4 flex justify-between items-center backdrop-blur shadow-lg z-30 select-none">
              {[
                { tab: "lobby", label: "首页", icon: Compass },
                { tab: "writing", label: "描画大字", icon: PenTool },
                { tab: "checklist", label: "识字本数", icon: CheckCircle2 },
                { tab: "trophy", label: "安全画廊", icon: Trophy }
              ].map((sw) => {
                const isActive = currentTab === sw.tab;
                const Icon = sw.icon;
                return (
                  <button
                    key={sw.tab}
                    onClick={() => {
                      setCurrentTab(sw.tab as any);
                      if (sw.tab === "writing") {
                        setActiveSubView("detail");
                      }
                    }}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition select-none flex-1 px-1 ${
                      isActive ? "text-pink-500 scale-103 font-extrabold" : "text-slate-400 hover:text-slate-550"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-pink-500" : "text-slate-400"} />
                    <span className="text-[10px] select-none font-bold">{sw.label}</span>
                  </button>
                );
              })}
            </div>

          </div>
        )}

        {currentView === "quiz" && (
          <QuizGame
            userProgress={progress}
            characters={allCharactersList}
            onClose={() => setCurrentView("lobby")}
            onQuizComplete={handleQuizComplete}
          />
        )}

        {currentView === "story_maker" && (
          <StoryGenerator
            unlockedCharacters={progress.unlockedCharIds.map(id => allCharactersList.find(c => c.id === id)!).filter(Boolean)}
            allCharacters={allCharactersList}
            onBack={() => setCurrentView("lobby")}
          />
        )}
      </div>

      {/* WeChat Export Code Parents lock modal */}
      <AnimatePresence>
        {showWeChatModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <WeChatExporter onClose={() => setShowWeChatModal(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
