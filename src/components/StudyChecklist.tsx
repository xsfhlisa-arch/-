/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Character, UserProgress } from "../types";
import { CheckCircle2, ChevronRight, HelpCircle, Star, Sparkles, BookOpen, Search, X, Check, Trash2, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StudyChecklistProps {
  userProgress: UserProgress;
  allCharacters: Character[];
  onLearnCharacters: (charIds: string[]) => void;
  onUploadToBeLearnedList?: (charIds: string[], customWords: string[]) => void;
  onUpdateToBeLearned: (charIds: string[]) => void;
  onSelectCharacterToWrite: (char: Character) => void;
  selectedCalendarDate: string;
  onDeleteCustomCharacter?: (charId: string) => void;
  onClearAllCustomCharacters?: () => void;
  onRestoreDeletedCharacters?: () => void;
}

export default function StudyChecklist({
  userProgress,
  allCharacters,
  onLearnCharacters,
  onUploadToBeLearnedList,
  onUpdateToBeLearned,
  onSelectCharacterToWrite,
  selectedCalendarDate,
  onDeleteCustomCharacter,
  onClearAllCustomCharacters,
  onRestoreDeletedCharacters
}: StudyChecklistProps) {
  // Be-Learned state (retrieve IDs that are in the plan list)
  const toBeLearnedIds = userProgress.toBeLearnedCharIds || [];
  
  // Local checklists selected map
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [masteredWords, setMasteredWords] = useState<string[]>([]);

  // Parent upload panel states
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [inputTextWords, setInputTextWords] = useState("");
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [uploadSuccessToast, setUploadSuccessToast] = useState("");

  // Self-selector picker dialog visibility state
  const [showSelector, setShowSelector] = useState(false);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filtering remaining available characters for picking (exclude mastered ones and those already in plan)
  const masteredCharIds = userProgress.unlockedCharIds || [];
  const candidateCharacters = allCharacters.filter(
    (char) => !masteredCharIds.includes(char.id) && !toBeLearnedIds.includes(char.id)
  );

  // Filtered list based on search bar
  const filteredCandidates = candidateCharacters.filter((char) => {
    const isKeywordMatch =
      char.word.includes(searchQuery) ||
      char.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.meaning.includes(searchQuery);
    return isKeywordMatch;
  });

  // Reset checkboxes when toBeLearned items change
  useEffect(() => {
    const nextMap: Record<string, boolean> = {};
    toBeLearnedIds.forEach(id => {
      nextMap[id] = true; // Default ticked, matching the "Select all today" state
    });
    setCheckedMap(nextMap);
  }, [userProgress.toBeLearnedCharIds]);

  // Handle single checklist change
  const toggleChecked = (id: string) => {
    setCheckedMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Select all inside current display check list
  const selectAll = () => {
    const allTicked = toBeLearnedIds.every(id => checkedMap[id]);
    const nextMap: Record<string, boolean> = {};
    toBeLearnedIds.forEach(id => {
      nextMap[id] = !allTicked;
    });
    setCheckedMap(nextMap);
  };

  // Submit learned items
  const handlePunchCardSubmit = () => {
    const selectedIds = toBeLearnedIds.filter(id => checkedMap[id]);
    if (selectedIds.length === 0) {
      alert("请至少勾选一个今天准备要学会的汉字卡片哦喵~");
      return;
    }

    const words = selectedIds.map(id => allCharacters.find(c => c.id === id || c.word === id)?.word || id);
    setMasteredWords(words);
    
    // Play synthesis approval
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(`真棒喵！宝宝今天学会了汉字：${words.join("，")}`);
      speech.lang = "zh-CN";
      speech.rate = 0.85;
      window.speechSynthesis.speak(speech);
    }

    // Direct submit action
    onLearnCharacters(selectedIds);
    setSuccessAnimation(true);
    
    setTimeout(() => {
      setSuccessAnimation(false);
    }, 4000);
  };

  // Open multi-select overlay dialogue
  const openSelfSelector = () => {
    // Sync current list to draft selected list
    setTempSelectedIds([...toBeLearnedIds]);
    setSearchQuery("");
    setShowSelector(true);
  };

  // Interactive toggle item inside choice grid
  const handleToggleSelectorItem = (id: string) => {
    if (tempSelectedIds.includes(id)) {
      setTempSelectedIds(tempSelectedIds.filter((item) => item !== id));
    } else {
      setTempSelectedIds([...tempSelectedIds, id]);
    }
  };

  // Smart Pre-select 5 characters
  const handleSelectDefaultFive = () => {
    // Pick first 5 simple candidates that are not mastered
    const firstFiveIds = candidateCharacters.slice(0, 5).map((c) => c.id);
    setTempSelectedIds(firstFiveIds);
  };

  // Handle commit select updating parent
  const handleSaveSelectorDraft = () => {
    onUpdateToBeLearned(tempSelectedIds);
    setShowSelector(false);
  };

  // Parent upload helper interactions
  const handleToggleCandidate = (id: string) => {
    if (selectedCandidateIds.includes(id)) {
      setSelectedCandidateIds(selectedCandidateIds.filter(item => item !== id));
    } else {
      setSelectedCandidateIds([...selectedCandidateIds, id]);
    }
  };

  const handleSelectAllCandidates = () => {
    const allSelected = candidateCharacters.every(char => selectedCandidateIds.includes(char.id));
    if (allSelected) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(candidateCharacters.map(char => char.id));
    }
  };

  const handleUploadSubmit = () => {
    // Filter raw text and extract only Chinese characters
    const cleanChineseStr = inputTextWords.replace(/[^\u4e00-\u9fa5]/g, "");
    const textWords = Array.from(new Set(cleanChineseStr.split(""))) as string[];

    if (selectedCandidateIds.length === 0 && textWords.length === 0) {
      alert("请至少输入一个汉字或者在列表勾选一个字进行添加捏~");
      return;
    }

    // Call parent handler
    if (onUploadToBeLearnedList) {
      onUploadToBeLearnedList(selectedCandidateIds, textWords);
    }

    const totalCount = selectedCandidateIds.length + textWords.length;
    setUploadSuccessToast(`✨ 同步导入成功！已将 ${totalCount} 个字加入准备学习清单，赠送宝宝 +${totalCount * 10} 激励金星星！`);
    
    // Voice report feedback
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(`导入成功！宝宝又增加啦${totalCount}个想学的汉字卡片喵！`);
      speech.lang = "zh-CN";
      speech.rate = 0.9;
      window.speechSynthesis.speak(speech);
    }

    // Clear and close
    setInputTextWords("");
    setSelectedCandidateIds([]);
    setTimeout(() => {
      setUploadSuccessToast("");
      setShowUploadPanel(false);
    }, 4500);
  };

  return (
    <div className="bg-slate-50 min-h-full py-2 px-1 text-slate-800" id="study-checklist-screen">
      {/* Dynamic Splash Overlay success */}
      <AnimatePresence>
        {successAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-rose-500/90 z-50 flex flex-col items-center justify-center p-6 text-center text-white"
          >
            <motion.div
              initial={{ scale: 0.3 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-7xl mb-4"
            >
              🎉🎈🌟
            </motion.div>
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">打卡打卡，大功告成！</h2>
            <p className="text-sm font-semibold max-w-sm mb-6 leading-relaxed">
              恭喜小主人在 【{selectedCalendarDate}】 成功掌握了汉字：
              <span className="block text-2xl font-black text-yellow-300 mt-2 filter drop-shadow">
                {masteredWords.join("、")}
              </span>
            </p>
            <div className="bg-white/11 p-4 rounded-2xl border border-white/10 backdrop-blur-sm flex items-center gap-3 w-full max-w-xs mb-8">
              <span className="text-3xl">⭐</span>
              <div className="text-left">
                <p className="text-xs font-black text-rose-100">今日打卡积分到账</p>
                <p className="text-xl font-extrabold text-yellow-300">活跃星星 +{masteredWords.length * 10}</p>
              </div>
            </div>
            <button
              onClick={() => setSuccessAnimation(false)}
              className="px-8 py-3 bg-white text-rose-600 rounded-full text-base font-extrabold tracking-wide shadow-lg active:scale-95 transition cursor-pointer"
            >
              收下奖励，继续冒险！
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-select Picker Dialogue Overlay (点击选择进入) */}
      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg h-[85vh] shadow-2xl flex flex-col justify-between overflow-hidden border border-slate-100"
            >
              {/* Selector Header Bar */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-base font-black flex items-center gap-2">
                    <Sparkles className="animate-pulse text-yellow-300" size={18} />
                    选择今天想学的字卡
                  </h3>
                  <p className="text-[10px] text-orange-100 font-semibold mt-1">
                    点击生字卡片加入到宝宝的“每日准备学”打卡清单中！
                  </p>
                </div>
                <button
                  onClick={() => setShowSelector(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center cursor-pointer transition text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Selector Search Control and Shortcuts */}
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-150 flex flex-col gap-3 shrink-0">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="输入想要查询的汉字、拼音或释义..."
                    className="w-full bg-white text-slate-800 border-2 border-slate-200 focus:border-orange-400 rounded-xl py-2 pl-9 pr-4 text-xs font-bold transition focus:outline-none placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 font-semibold"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Intelligent shortcut commands */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    快捷指令
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <button
                      onClick={handleSelectDefaultFive}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 border border-amber-200 text-amber-800 text-[9px] font-black rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      💡 帮我挑简单5个字
                    </button>
                    <button
                      onClick={() => setTempSelectedIds([])}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-700 text-[9px] font-black rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      ✖ 清空准备学
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable grid area for selection */}
              <div className="flex-1 overflow-y-auto p-5 bg-[#FBFBFA]">
                {filteredCandidates.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2.5">
                    {filteredCandidates.map((char) => {
                      const isChosen = tempSelectedIds.includes(char.id);
                      return (
                        <div
                          key={char.id}
                          onClick={() => handleToggleSelectorItem(char.id)}
                          className={`rounded-2xl border-2 p-3 text-center transition-all duration-150 cursor-pointer flex flex-col justify-between relative select-none ${
                            isChosen
                              ? "bg-rose-50 border-rose-400 text-rose-800 shadow-md shadow-rose-100"
                              : "bg-white border-slate-200/60 text-slate-700 hover:border-slate-300 hover:shadow-xs"
                          }`}
                        >
                          {/* Deletion cross button for custom characters */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`确认要将“${char.word}”字从宝宝备选字库中彻底删除吗？`)) {
                                onDeleteCustomCharacter?.(char.id);
                              }
                            }}
                            className="absolute -top-1 -left-1 w-7 h-7 bg-white hover:bg-rose-600 border border-slate-205 hover:text-white text-rose-500 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 text-sm font-black shadow-md active:scale-95 z-30 pointer-events-auto"
                            title="彻底删除此汉字"
                          >
                            ×
                          </button>

                          {isChosen && (
                            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold z-10 animate-bounce">
                              ✓
                            </span>
                          )}

                          <span className="text-base filter drop-shadow-xs pointer-events-none self-start leading-none opacity-80 mb-1">
                            {char.emoji}
                          </span>
                          <span
                            className="text-2xl font-black block py-1 pointer-events-none"
                            style={{ fontFamily: 'KaiTi, Georgia, serif' }}
                          >
                            {char.word}
                          </span>
                          <span className="text-[8px] font-bold font-mono opacity-60 pointer-events-none block leading-none">
                            {char.pinyin}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <span className="text-4xl block">🔍🐾📙</span>
                    <p className="text-xs font-black text-slate-400 mt-2">没有找到这个字卡哦，系统会为您记下宝宝想学的汉字！</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-normal">
                      您可以通过主页上方的输入框，直接把宝宝自拟想学的汉字加入到准备学列表哦喵~
                    </p>
                  </div>
                )}
              </div>

              {/* Selector bottom footer save bar */}
              <div className="bg-slate-50 border-t border-slate-150 p-4 shrink-0 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  今天准备学库：<strong className="text-orange-600 font-extrabold font-mono text-sm">{tempSelectedIds.length}</strong> 个字
                </span>
                <button
                  onClick={handleSaveSelectorDraft}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition active:scale-95"
                >
                  ✓ 确定学这些字！
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-xl mx-auto flex flex-col gap-5 pt-3">
        {/* Banner with instructions */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2rem] p-5 text-white shadow-md relative overflow-hidden border border-amber-400">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="relative">
            <h2 className="text-lg font-black flex items-center gap-1.5">
              <BookOpen size={18} />
              今天认清学写计划书 (识字打卡清单)
            </h2>
            <p className="text-xs text-orange-50/90 font-medium leading-relaxed mt-2">
              今天想要掌握哪些新汉字呢？在下方选中字卡，督促宝宝在小黑板画箱中临摹、听说大声读出释义！
              自主学成后一键打卡上报，就可以解锁贴纸并送上熟字黄金库啦！✨
            </p>
          </div>
        </div>

        {/* Parent Synchronizer Action Expander Bar */}
        <div className="shrink-0">
          {uploadSuccessToast && (
            <div className="mb-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-black p-3.5 rounded-2xl flex items-center gap-2 animate-bounce shadow-sm">
              <Sparkles className="text-amber-500 shrink-0" size={16} />
              <span>{uploadSuccessToast}</span>
            </div>
          )}

          {!showUploadPanel ? (
            <button
              onClick={() => {
                setShowUploadPanel(true);
                setSelectedCandidateIds([]);
                setInputTextWords("");
              }}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-2xl text-[11px] font-black shadow-sm cursor-pointer transition flex items-center justify-center gap-2"
            >
              👨‍👩‍👧 家长专属通道：快速同步生字卡卡片至“准备学计划清单”！
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-purple-50/70 border-2 border-purple-100 rounded-3xl p-5 shadow-inner overflow-hidden flex flex-col gap-4"
              >
                <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                  <h3 className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                    <UploadCloud size={16} className="text-purple-600" />
                    家长自主批量添加生字计划
                  </h3>
                  <button
                    onClick={() => setShowUploadPanel(false)}
                    className="text-xs font-bold text-purple-500 hover:text-purple-700 underline"
                  >
                    收起面板
                  </button>
                </div>

                <p className="text-[10px] text-purple-900/85 font-medium leading-normal">
                  家长可以在此处直接输入宝宝幼儿园要求学习、或是纸质绘本上遇到的新词，一键加入到宝宝的<b>“准备学清单”</b>中，并赠送 <b>+10</b> 颗星星！✨
                </p>

                {/* Input Option 1 */}
                <div>
                  <label className="text-[10px] font-black text-purple-900 block mb-1">
                    ✍️ 方式一：直接输入生字 (智能提取汉字字符)
                  </label>
                  <textarea
                    value={inputTextWords}
                    onChange={(e) => setInputTextWords(e.target.value)}
                    placeholder="例如：天、地、门、白 (汉字间空格或逗号均可自动识别)"
                    rows={2}
                    className="w-full bg-white border border-purple-200 focus:border-purple-500 text-slate-800 text-xs font-bold p-2.5 rounded-xl transition focus:outline-none"
                  />
                </div>

                {/* Input Option 2 */}
                {candidateCharacters.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] font-black text-purple-900">
                        ☘️ 方式二：在生字库中勾选快捷加入 (已选: {selectedCandidateIds.length} 个)
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

                {/* Bottom confirmation actions */}
                <div className="flex justify-end gap-2 mt-1 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedCandidateIds([]);
                      setInputTextWords("");
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition cursor-pointer"
                  >
                    重置清空
                  </button>
                  <button
                    onClick={handleUploadSubmit}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[10px] font-black rounded-lg transition active:scale-[0.98] shadow flex items-center gap-1 cursor-pointer"
                  >
                    ✓ 确认同步至“准备学清单”！
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Dynamic Select Checklist card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-dashed border-slate-100 pb-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                📝 宝宝今日准备学习字 ({toBeLearnedIds.length}个生字)
              </h3>
            </div>
            
            <div className="flex items-center gap-1.5">
              {/* Click inside and pick button */}
              <button
                onClick={openSelfSelector}
                className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-[10px] font-black cursor-pointer shadow-sm hover:opacity-95 active:scale-95 transition"
                id="btn-self-select-picker"
              >
                🎒 选择新字卡学习
              </button>
              
              {toBeLearnedIds.length > 0 && (
                <button
                  onClick={selectAll}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-655 border border-rose-100 rounded-full text-[10px] font-black tracking-wide"
                >
                  {toBeLearnedIds.every(id => checkedMap[id]) ? "全部不选" : "今日全选"}
                </button>
              )}

              {toBeLearnedIds.length > 0 && (
                <div className="inline-flex items-center gap-1">
                  {!showClearConfirm ? (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-full text-[10px] font-black tracking-wide cursor-pointer transition active:scale-95"
                      id="btn-clear-today-plan"
                    >
                      🧹 清空
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 rounded-full py-0.5 px-2.5 text-[9px] animate-pulse">
                      <span className="text-rose-700 font-extrabold select-none">确清？</span>
                      <button
                        onClick={() => {
                          onUpdateToBeLearned([]);
                          setShowClearConfirm(false);
                        }}
                        className="bg-red-500 hover:bg-red-650 text-white rounded-full px-1.5 font-black cursor-pointer transition"
                      >
                        是
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full px-1.5 font-black cursor-pointer transition"
                      >
                        否
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {toBeLearnedIds.length > 0 ? (
            <div className="flex flex-col gap-3">
              {toBeLearnedIds.map((id) => {
                const char = allCharacters.find(c => c.id === id || c.word === id);
                if (!char) return null;
                const isTicked = !!checkedMap[char.id];

                return (
                  <div
                    key={char.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isTicked
                        ? "bg-rose-50/40 border-rose-200 shadow-sm shadow-rose-100/50"
                        : "bg-slate-50/50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox trigger */}
                      <button
                        onClick={() => toggleChecked(char.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition ${
                          isTicked
                            ? "bg-rose-500 border-rose-500 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isTicked && <span className="text-xs font-black">✓</span>}
                      </button>

                      {/* Character outline */}
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span
                            onClick={() => onSelectCharacterToWrite(char)}
                            className="text-2xl font-black text-slate-800 cursor-pointer hover:text-rose-500 transition-colors"
                            style={{ fontFamily: 'KaiTi, Georgia, serif' }}
                          >
                            {char.word}
                          </span>
                          <span className="text-xs font-bold text-red-500 font-mono">({char.pinyin})</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{char.meaning}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xl filter drop-shadow-xs">{char.emoji}</span>
                      
                      {/* Tracing link trigger */}
                      <button
                        onClick={() => onSelectCharacterToWrite(char)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-[9px] font-extrabold text-amber-800 transition active:scale-95 cursor-pointer"
                        id={`btn-write-${char.id}`}
                      >
                        ✍️ 去写字
                      </button>

                      {/* Dual operations: X to take out of plan, Trash to permanently delete */}
                      <button
                        onClick={() => {
                          const updatedIds = toBeLearnedIds.filter(item => item !== char.id);
                          onUpdateToBeLearned(updatedIds);
                        }}
                        className="w-7 h-7 bg-slate-100 hover:bg-slate-500 hover:text-white text-slate-400 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer shadow-sm active:scale-90"
                        id={`btn-delete-item-${char.id}`}
                        title="移出今日计划"
                      >
                        <X size={12} />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`确认要将汉字“${char.word}”字从字库系统中彻底永久删除吗？`)) {
                            onDeleteCustomCharacter?.(char.id);
                          }
                        }}
                        className="w-7 h-7 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-500 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer shadow-sm active:scale-90"
                        id={`btn-permanent-delete-${char.id}`}
                        title="从整个系统永久删除"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="mt-5 pt-4 border-t border-dashed border-slate-100">
                <button
                  onClick={handlePunchCardSubmit}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-pink-200 active:scale-[0.98] cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  id="btn-punch-all-cards"
                >
                  <CheckCircle2 size={16} />
                  好啦！宝宝今天学完了勾选的字，提交打卡！
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <span className="text-4xl block">✨🎒📖</span>
              <p className="text-xs font-black text-slate-400 mt-2">今日学箱空空，快带宝宝选五个生字开始打卡！</p>
              <div className="flex flex-col gap-2 mt-4 max-w-xs mx-auto">
                <button
                  onClick={openSelfSelector}
                  className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-xl text-xs font-black shadow-md hover:scale-102 transition"
                >
                  🚀 挑选生字卡卡片 (点击自由挑选)
                </button>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-normal">
                  您也可以在第一页顶部的汉字搜索输入框，自由填入想要添加的任何新词汇哦喵~
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
