/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Character, UserProgress } from "../types";
import { STICKERS } from "../data/characters";
import { Trophy, Award, Gamepad2, Sparkles, BookOpen, Volume2, UploadCloud, CheckCircle, Plus, AlertCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TrophySafeProps {
  userProgress: UserProgress;
  allCharacters: Character[];
  onCharacterSelect: (char: Character) => void;
  onNavigate: (view: "lobby" | "quiz" | "story_maker") => void;
  onUnlockCharacters: (charIds: string[], words: string[]) => void; // Parent upload handler callback
  onUnlearnMasteredCharacter?: (charId: string) => void;
  onDeleteCustomCharacter?: (charId: string) => void;
  onClearMasteredLibrary?: () => void;
  selectedCalendarDate?: string;
  onClose?: () => void;
}

export const LEVEL_STAR_STICKERS = [
  { id: "star_kitty", emoji: "🐱✨", name: "聪慧主厨小猫", stars: 20 },
  { id: "super_rabbit", emoji: "🐰🚀", name: "飞天太空玉兔", stars: 50 },
  { id: "kungfu_panda", emoji: "🐼🥋", name: "功夫国宝熊猫", stars: 100 },
  { id: "smart_owl", emoji: "🦉🎓", name: "绿荫智慧博士", stars: 150 },
  { id: "lion_king", emoji: "🦁👑", name: "荣耀猛狮战将", stars: 200 },
  { id: "rainbow_unicorn", emoji: "🦄🌈", name: "梦幻彩虹萌马", stars: 300 }
];

export const DAILY_REWARD_STICKERS = [
  { id: "strawberry_duck", emoji: "🦆🍓", name: "草莓麦芽小鸭" },
  { id: "lion_fire", emoji: "🦁🔥", name: "勇气小红火狮" },
  { id: "dino_rex", emoji: "🦖🦕", name: "侏罗纪探宝龙" },
  { id: "penguin_jump", emoji: "🐧❄️", name: "飞跃极寒企鹅" },
  { id: "ice_cream", emoji: "🍦🍧", name: "甜心消暑雪糕" },
  { id: "space_rocket", emoji: "🚀🛰️", name: "巡空特警火箭" }
];

export default function TrophySafe({
  userProgress,
  allCharacters,
  onCharacterSelect,
  onNavigate,
  onUnlockCharacters,
  onUnlearnMasteredCharacter,
  onDeleteCustomCharacter,
  onClearMasteredLibrary,
  selectedCalendarDate,
  onClose
}: TrophySafeProps) {
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [inputTextWords, setInputTextWords] = useState("");
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [uploadSuccessToast, setUploadSuccessToast] = useState("");
  const [activeDeleteCharId, setActiveDeleteCharId] = useState<string | null>(null);
  const [stickerSubTab, setStickerSubTab] = useState<"stars" | "daily">("stars");

  // Filter mastered characters
  const masteredCharIds = userProgress.unlockedCharIds || [];
  const masteredDates = userProgress.unlockedDates || {};
  const masteredCharacters = allCharacters.filter((char) => masteredCharIds.includes(char.id));

  // Candidates for unlocking directly (remaining words)
  const candidateCharacters = allCharacters.filter((char) => !masteredCharIds.includes(char.id));

  const playVoice = (charWord: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(charWord);
      utterance.lang = "zh-CN";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle checklist candidate selection
  const handleToggleCandidate = (id: string) => {
    if (selectedCandidateIds.includes(id)) {
      setSelectedCandidateIds(selectedCandidateIds.filter(item => item !== id));
    } else {
      setSelectedCandidateIds([...selectedCandidateIds, id]);
    }
  };

  // Handle uploading action
  const handleUploadSubmit = () => {
    // 1. Process free-text words: extract all pure Chinese characters
    const textChars: string[] = [];
    const chineseRegex = /[\u4e00-\u9fa5]/g;
    let match;
    while ((match = chineseRegex.exec(inputTextWords)) !== null) {
      if (!textChars.includes(match[0])) {
        textChars.push(match[0]);
      }
    }

    if (selectedCandidateIds.length === 0 && textChars.length === 0) {
      alert("请输入已学过的汉字字符，或者在备选列表中勾选想要上报的字哦喵~");
      return;
    }

    // 2. Launch unlock action!
    onUnlockCharacters(selectedCandidateIds, textChars);

    // Setup speech greeting
    const totalCount = selectedCandidateIds.length + textChars.length;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(`上传成功！家长为您导入了${totalCount}个已掌握汉字！活跃星星已经发出了哦喵~`);
      speech.lang = "zh-CN";
      speech.rate = 0.85;
      window.speechSynthesis.speak(speech);
    }

    // Reset fields and show success alert
    setUploadSuccessToast(`成功导入 ${totalCount} 个汉字至熟字库里！获得星星 +${totalCount * 10} 🌟`);
    setSelectedCandidateIds([]);
    setInputTextWords("");
    setTimeout(() => {
      setUploadSuccessToast("");
      setShowUploadPanel(false);
    }, 3000);
  };

  // Add all remaining candidates (Quick Mastery unlocked)
  const handleSelectAllCandidates = () => {
    const allIds = candidateCharacters.map(char => char.id);
    setSelectedCandidateIds(allIds);
  };

  return (
    <div className="bg-slate-50 min-h-full py-4 px-4 text-slate-800 flex flex-col gap-6" id="trophy-safe-screen">
      
      {/* Toast Alert overlay */}
      <AnimatePresence>
        {uploadSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 inset-x-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-2xl shadow-xl z-50 text-center font-black flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} className="text-yellow-300 animate-bounce" />
            <span>{uploadSuccessToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Header Box layout */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-[2rem] p-5 md:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute right-0 bottom-0 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative">
          <div className="flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-black flex items-center gap-1.5 uppercase tracking-wide">
              <Trophy className="text-yellow-300 animate-bounce" size={22} />
              我的趣味识字熟字宝箱 (宝宝字库)
            </h2>
          </div>
          <p className="text-xs text-purple-100/90 font-medium leading-relaxed mt-2.5">
            这里展示着宝宝已经自主学会、默写成功的金牌汉字！还可以通过家长后台一键快速录入，获取专属微信小程序！
          </p>
          
          <div className="mt-4 flex flex-wrap gap-2.5">
            {/* Click to upload learned words */}
            <button
              onClick={() => setShowUploadPanel(!showUploadPanel)}
              className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-purple-950 rounded-xl text-[11px] font-black tracking-wide flex items-center gap-1 cursor-pointer transition shadow-sm"
              id="btn-upload-learned-trigger"
            >
              <UploadCloud size={13} />
              家长通道：快速同步生字
            </button>

            {masteredCharacters.length > 0 && (
              <button
                onClick={() => {
                  onClearMasteredLibrary?.();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-black tracking-wide flex items-center gap-1 cursor-pointer transition shadow-sm border border-rose-500"
                id="btn-clear-mastered-library-cust"
              >
                <Trash2 size={13} />
                清空熟字库
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upload learned words panel */}
      <AnimatePresence>
        {showUploadPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-purple-50/70 border-2 border-purple-100 rounded-3xl p-5 shadow-inner overflow-hidden flex flex-col gap-4"
          >
            <div className="flex justify-between items-center border-b border-purple-100 pb-2">
              <h3 className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                <UploadCloud size={16} className="text-purple-600" />
                家长自主批量添加生字记录
              </h3>
              <button
                onClick={() => setShowUploadPanel(false)}
                className="text-xs font-bold text-purple-500 hover:text-purple-700 underline"
              >
                收起面板
              </button>
            </div>

            <p className="text-[10px] text-purple-900/85 font-medium leading-normal">
              如果宝宝在纸质绘本或幼儿园已经学会了某些汉字，建议在此处录入同步。系统将它们直接送入<b>“熟字库”</b>并赠送宝宝 <b>+10</b> 星星奖励哦！✨
            </p>

            {/* Input option 1: Text Area typing character block */}
            <div>
              <label className="text-[10px] font-black text-purple-900 block mb-1">
                ✍️ 方式一：直接输入已学会的汉字 (任意中文字符，系统智能过滤)
              </label>
              <textarea
                value={inputTextWords}
                onChange={(e) => setInputTextWords(e.target.value)}
                placeholder="例如：日、月、云、川 (汉字间空格或逗号均可识别哦)"
                rows={2}
                className="w-full bg-white border border-purple-200 focus:border-purple-500 text-slate-800 text-xs font-bold p-2.5 rounded-xl transition"
              />
            </div>

            {/* Input option 2: Multiple Selection of unused candidate characters */}
            {candidateCharacters.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-black text-purple-900">
                    ☘️ 方式二：在剩余生字库中直接勾选 (已选: {selectedCandidateIds.length} 个)
                  </label>
                  <button
                    onClick={handleSelectAllCandidates}
                    className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded cursor-pointer transition hover:bg-purple-200"
                  >
                    全部勾选
                  </button>
                </div>
                
                <div className="bg-white/80 border border-purple-100 rounded-2xl p-3 max-h-32 overflow-y-auto grid grid-cols-4 gap-1.5">
                  {candidateCharacters.map((char) => {
                    const isChecked = selectedCandidateIds.includes(char.id);
                    return (
                      <div
                        key={char.id}
                        onClick={() => handleToggleCandidate(char.id)}
                        className={`p-1.5 border rounded-lg text-center cursor-pointer transition-all ${
                          isChecked
                            ? "bg-purple-600 border-purple-600 text-white"
                            : "bg-purple-50/30 border-purple-100 text-purple-950 hover:bg-purple-50"
                        }`}
                      >
                        <span className="text-[13px] font-black block" style={{ fontFamily: "KaiTi, Georgia" }}>
                          {char.word}
                        </span>
                        <span className="text-[7px] font-bold block opacity-60 font-mono -mt-0.5">
                          {char.pinyin}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer action */}
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => {
                  setSelectedCandidateIds([]);
                  setInputTextWords("");
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition"
              >
                重置清空
              </button>
              <button
                onClick={handleUploadSubmit}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[10px] font-black rounded-lg transition active:scale-[0.98] shadow flex items-center gap-1 cursor-pointer"
                id="btn-confirm-parent-upload"
              >
                ✓ 确认导入宝宝熟字库！
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Sub-Launchers: Quiz and Bedtime Stories */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate("quiz")}
          className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white hover:opacity-95 text-left shadow-md transform active:scale-95 transition cursor-pointer flex flex-col justify-between group h-28"
          id="btn-trophy-quiz"
        >
          <div className="flex justify-between items-start">
            <span className="p-1.5 bg-white/20 rounded-xl text-base">🏆</span>
            <span className="text-[9px] bg-white/25 px-2 py-0.5 rounded-full font-bold">小测试</span>
          </div>
          <div>
            <h4 className="font-extrabold text-sm flex items-center gap-1 mt-auto">
              汉字大闯关 <Gamepad2 size={12} className="transition-transform group-hover:translate-x-1" />
            </h4>
            <p className="text-[9px] text-orange-50/80 leading-normal mb-1">测试听音选词，获取更多星星卡牌</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate("story_maker")}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white hover:opacity-95 text-left shadow-md transform active:scale-95 transition cursor-pointer flex flex-col justify-between group h-28"
          id="btn-trophy-story"
        >
          <div className="flex justify-between items-start">
            <span className="p-1.5 bg-white/20 rounded-xl text-base">🧚‍♀️</span>
            <span className="text-[9px] bg-white/25 px-2 py-0.5 rounded-full font-bold">AI故事</span>
          </div>
          <div>
            <h4 className="font-extrabold text-sm flex items-center gap-1 mt-auto">
              AI绘本故事绘 <BookOpen size={12} className="transition-transform group-hover:translate-x-1" />
            </h4>
            <p className="text-[9px] text-purple-50/80 leading-normal mb-1">定制宝宝学过的字的睡前伴读故事</p>
          </div>
        </button>
      </div>

      {/* Dynamic Twin Sticker Achievement Wall */}
      <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-[2rem] border border-indigo-100 p-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-black text-indigo-950 flex items-center gap-1.5 leading-tight">
            ✨ 宝宝专属拼贴画徽章墙 (双轨荣誉系统)
          </h3>
          <p className="text-[10px] text-indigo-700 font-semibold leading-normal">
            达到星星里程碑或每日学写词打卡，即可点亮超好看的成长贴纸纪念章咪！
          </p>
        </div>

        {/* Tab triggers */}
        <div className="grid grid-cols-2 gap-2 bg-indigo-100/50 p-1 rounded-xl">
          <button
            onClick={() => setStickerSubTab("stars")}
            className={`py-2 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
              stickerSubTab === "stars"
                ? "bg-white text-indigo-950 shadow-sm"
                : "text-indigo-600 hover:text-indigo-850"
            }`}
          >
            ⭐ 累计星星点亮 ({LEVEL_STAR_STICKERS.filter(s => userProgress.stars >= s.stars).length}/6)
          </button>
          <button
            onClick={() => setStickerSubTab("daily")}
            className={`py-2 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
              stickerSubTab === "daily"
                ? "bg-white text-indigo-950 shadow-sm"
                : "text-indigo-600 hover:text-indigo-850"
            }`}
          >
            📅 每日学词随机赠 ({ (userProgress.dailyRandomStickers || []).length}/6)
          </button>
        </div>

        {/* Tab content panels */}
        {stickerSubTab === "stars" ? (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl text-[10px] text-amber-900 font-bold">
              <span>宝宝当前收集：<strong className="text-amber-600 font-extrabold text-xs">{userProgress.stars}</strong> 颗金牌活跃星</span>
              <span>继续打卡学新词以攒更多星星 ➔</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {LEVEL_STAR_STICKERS.map((sticker) => {
                const isUnlocked = userProgress.stars >= sticker.stars;
                return (
                  <div
                    key={sticker.id}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                      isUnlocked
                        ? "bg-white border-amber-300 text-slate-800 shadow-sm scale-100 hover:scale-105"
                        : "bg-slate-100/70 border-slate-200 text-slate-450 opacity-70"
                    }`}
                  >
                    <span className={`text-4xl block filter ${isUnlocked ? "drop-shadow-md" : "grayscale opacity-40 blur-[0.3px]"}`}>
                      {sticker.emoji}
                    </span>
                    <h4 className="text-[10px] font-black mt-2 leading-tight">{sticker.name}</h4>
                    <p className={`text-[8px] font-mono font-bold mt-1.5 px-2 py-0.5 rounded-full ${
                      isUnlocked
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-200/50 text-slate-500"
                    }`}>
                      {isUnlocked ? "✓ 已点亮" : `${sticker.stars}星解锁`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-xl text-[10px] text-indigo-900 font-semibold leading-relaxed">
              📢 <b>获取秘籍</b>：每天任意学写、打卡汉字词，即可随机收获专属于今天日期的奇趣纪念拼贴画章捏喵！且与星星数量不互通捏！
            </div>

            <div className="grid grid-cols-3 gap-3">
              {DAILY_REWARD_STICKERS.map((sticker) => {
                const isUnlocked = (userProgress.dailyRandomStickers || []).includes(sticker.id);
                return (
                  <div
                    key={sticker.id}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                      isUnlocked
                        ? "bg-white border-[#E9D5FF] text-slate-800 shadow-sm scale-100 hover:scale-105"
                        : "bg-slate-100/70 border-slate-200 text-slate-450 opacity-70"
                    }`}
                  >
                    <span className={`text-4xl block filter ${isUnlocked ? "drop-shadow-md" : "grayscale opacity-40 blur-[0.3px]"}`}>
                      {sticker.emoji}
                    </span>
                    <h4 className="text-[10px] font-black mt-2 leading-tight">{sticker.name}</h4>
                    <p className={`text-[8px] font-mono font-bold mt-1.5 px-2 py-0.5 rounded-full ${
                      isUnlocked
                        ? "bg-purple-50 text-purple-650"
                        : "bg-slate-200/50 text-slate-500"
                    }`}>
                      {isUnlocked ? "✓ 已点亮" : "每日学词解锁"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Master character list grid - EXACT MATCH layout */}
      <div className="bg-white rounded-[2rem] border border-slate-200/60 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4 shrink-0">
          <h3 className="text-sm font-black text-rose-950 flex items-center gap-1.5">
            🎖️ 生字奖章熟字库 ({masteredCharacters.length}字)
          </h3>
          <span className="text-[10px] text-slate-400 font-extrabold">
            点击卡片放大并听发音喵
          </span>
        </div>

        {masteredCharacters.length > 0 ? (
          <div className="grid grid-cols-3 gap-3" id="master-characters-grid">
            {masteredCharacters.map((char) => {
              const learnedDate = masteredDates[char.id] || masteredDates[char.word] || "2026-06-04";
              return (
                <motion.div
                  key={char.id}
                  onClick={() => {
                    playVoice(char.word);
                    onCharacterSelect(char);
                  }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#FFFDF4] border-2 border-[#F1E5C1]/40 rounded-2xl p-3 flex flex-col items-center justify-between shadow-sm cursor-pointer relative overflow-hidden group"
                >
                  {/* Miniature Red-Gray Trash Can top/left for full management */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDeleteCharId(char.id);
                    }}
                    className="absolute top-1 left-1.5 w-6 h-6 bg-slate-100 hover:bg-rose-500 text-slate-400 hover:text-white rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 shadow-xs z-20 animate-none"
                    title="移出生字/彻底删除"
                  >
                    <Trash2 size={11} />
                  </button>

                  <span className="text-3xl font-extrabold text-[#7D5D00] mt-4 mb-2 select-none" style={{ fontFamily: "KaiTi, Georgia" }}>
                    {char.word}
                  </span>
                  
                  <div className="text-center w-full z-10">
                    <p className="text-[10px] font-bold text-amber-900 leading-tight truncate">{char.pinyin}</p>
                    <p className="text-[7px] font-medium text-slate-450 leading-none truncate mt-1">{char.meaning}</p>
                  </div>

                  <span className="text-[7px] text-slate-400 mt-2 font-mono self-end">
                    {learnedDate}
                  </span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <span className="text-4xl block">🍃🐾📖</span>
            <p className="text-xs font-black text-slate-400 mt-2">宝箱空空，宝宝还没有掌握熟字哦~</p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-normal">
              快去“准备学清单”中选择生字卡、完成小画板临摹，打卡后就能解锁好看的贴纸并将其装进宝箱啦！
            </p>
          </div>
        )}
      </div>

      {/* Interactive Deletion Modal Prompt */}
      <AnimatePresence>
        {activeDeleteCharId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white rounded-[2.5rem] border-4 border-purple-100 p-6 max-w-sm w-full shadow-2xl text-center flex flex-col gap-4"
            >
              <div className="w-12 h-12 bg-rose-50 text-rose-500 text-2xl rounded-full flex items-center justify-center mx-auto animate-pulse">
                🐾
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  家长管理中心：确认移出生字吗？
                </h3>
                <p className="text-[10px] text-slate-450 mt-1.5 leading-relaxed font-semibold">
                  请选择对汉字 <strong className="text-purple-600 font-sans text-sm">“{allCharacters.find(c => c.id === activeDeleteCharId)?.word || activeDeleteCharId}”</strong> 执行的操作捏喵：
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    onUnlearnMasteredCharacter?.(activeDeleteCharId);
                    setActiveDeleteCharId(null);
                  }}
                  className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-black text-[11px] rounded-xl cursor-pointer active:scale-98 transition flex items-center justify-center gap-1.5 border border-purple-250"
                >
                  ⏪ 放入“准备学”打卡清单 (可重温写字)
                </button>
                <button
                  onClick={() => {
                    onDeleteCustomCharacter?.(activeDeleteCharId);
                    setActiveDeleteCharId(null);
                  }}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-[11px] rounded-xl cursor-pointer active:scale-98 transition flex items-center justify-center gap-1.5 border border-rose-250"
                >
                  🗑️ 彻底从宝宝字库永久删除 (彻底移除)
                </button>
                <button
                  onClick={() => setActiveDeleteCharId(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] rounded-xl cursor-pointer active:scale-98 transition"
                >
                  🎈 算啦，保留在宝箱
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
