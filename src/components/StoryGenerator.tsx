/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Character } from "../types";
import { BookOpen, Sparkles, Volume2, VolumeX, Copy, Check, ExternalLink, FileText, X, Wand2, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StoryGeneratorProps {
  unlockedCharacters: Character[];
  allCharacters: Character[];
  onBack?: () => void;
}

interface StoryResult {
  title: string;
  story: string;
  theme: string;
  goldenQuote: string;
}

const STORAGE_KEY = "kids_literacy_magic_pasted_stories";

export default function StoryGenerator({ unlockedCharacters, allCharacters, onBack }: StoryGeneratorProps) {
  // Use unlocked or fall back to any available custom/precompiled characters if none unlocked yet
  const availableChars = unlockedCharacters.length >= 1 
    ? unlockedCharacters 
    : allCharacters.slice(0, 8);

  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"copy_prompt" | "paste_read">("copy_prompt");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Paste inputs
  const [pastedTitle, setPastedTitle] = useState("");
  const [pastedStoryText, setPastedStoryText] = useState("");
  const [pastedTheme, setPastedTheme] = useState("");
  const [pastedQuote, setPastedQuote] = useState("");
  
  const [currentStory, setCurrentStory] = useState<StoryResult | null>(null);

  // Load from memory if present
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setCurrentStory(parsed);
          setPastedTitle(parsed.title || "");
          setPastedStoryText(parsed.story || "");
          setPastedTheme(parsed.theme || "");
          setPastedQuote(parsed.goldenQuote || "");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSelectWord = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else {
      if (selectedWords.length >= 4) return; // Keep it focused for children
      setSelectedWords([...selectedWords, word]);
    }
  };

  // Compile a dynamically customized prompt depending on words chosen
  const generateDynamicPrompt = () => {
    const wordListStr = selectedWords.map(w => `**${w}**`).join("、");
    const labelStr = selectedWords.join("、");
    
    return `我正在带我家宝贝玩《乐学识字宝箱》创意绘本识字游戏。请协助为5岁儿童编写一篇约250字到300字的温馨启蒙睡前哄睡故事。

1. 必须巧妙融入的核心汉字词：${wordListStr}（请注意：这些核心汉字在返回的故事正文中出现时，必须使用粗体包围，比如：小兔子抬头看着 **${selectedWords[0] || "天"}** 空...）。
2. 写作风格：文字要求温暖可爱、充满自然想象力韵律，用小动物奇遇来巧妙地解释这些汉字代表的事物。
3. 返回格式请严格为以下四个段落（直接返回内容，不要带多余的Markdown总标题），均使用中文：

【标题】我的定制故事名字（例如：小兔子和云朵风风的躲猫猫）
【正文】故事的完整可爱内容
【故事寓意】一两句对宝宝说的话
【哄睡蜜语】一句温柔、有助于安睡的贴心晚安小手记。`;
  };

  const handleCopyPromptText = () => {
    const promptStr = generateDynamicPrompt();
    navigator.clipboard.writeText(promptStr);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
    
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance("故事提示词复制成功！快去网页版 DeepSeek 或 ChatGPT 生成故事吧！");
      speech.lang = "zh-CN";
      speech.rate = 0.9;
      window.speechSynthesis.speak(speech);
    }
  };

  const handleAutoGenerateStory = async () => {
    if (selectedWords.length === 0) {
      alert("请先选择 1~4 个汉字哟 🐾");
      return;
    }
    
    setIsGenerating(true);
    
    // Voice reporting
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(`大仙子正在连词成篇为宝宝编故事，请稍候片刻哦喵~`);
      speech.lang = "zh-CN";
      speech.rate = 1.0;
      window.speechSynthesis.speak(speech);
    }

    try {
      const res = await fetch("/api/gemini/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: selectedWords })
      });
      if (!res.ok) throw new Error("Server returned error status");
      
      const data = await res.json();
      const storyObj: StoryResult = {
        title: data.title || `宝宝生字冒险记 - 【${selectedWords.join("、")}】`,
        story: data.story || "",
        theme: data.theme || "学而不进，则罔。",
        goldenQuote: data.goldenQuote || "晚安宝贝，做个甜甜的故事美梦。"
      };

      setCurrentStory(storyObj);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storyObj));
      
      // Auto-populate inputs for safety
      setPastedTitle(storyObj.title);
      setPastedStoryText(storyObj.story);
      setPastedTheme(storyObj.theme);
      setPastedQuote(storyObj.goldenQuote);

      setActiveTab("paste_read"); // switch tab to read immediately
      
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(`故事定制装订成功啦，快点击小播放键来和宝宝一起听听吧！`);
        speech.lang = "zh-CN";
        speech.rate = 0.95;
        window.speechSynthesis.speak(speech);
      }
    } catch (err) {
      console.error("Story creation failed, trying local backup client-side synthesizer:", err);
      // Client-side fallback if server is entirely offline
      const storyObj: StoryResult = {
        title: `字宝宝 【${selectedWords.join(" 与 ")}】 的大自然聚会 🍎`,
        story: `在很久很久以前的大森林深处，新来了几位高矮胖瘦各不相同的字宝宝，他们分别叫：${selectedWords.map(w => `**${w}**`).join("、")}。这些字宝宝性格极其乖巧，一呼风就吹树叶响，一说云白云便飘过来大呼呼。宝宝和爸爸妈妈一起描红他们，认认真真写在在红色黑板格子里。只要把知识装在行囊里，宝宝每天都能收获亮晶晶的小皇冠哟喵！`,
        theme: `每天积累一点识字能量，宝宝的探索小脚印就能走得更远更稳当！`,
        goldenQuote: `今天的生字伙伴在童话王国里悄悄守候你，闭上大眼睛，晚安好梦！`
      };
      
      setCurrentStory(storyObj);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storyObj));
      setPastedTitle(storyObj.title);
      setPastedStoryText(storyObj.story);
      setPastedTheme(storyObj.theme);
      setPastedQuote(storyObj.goldenQuote);
      setActiveTab("paste_read");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedStoryText.trim()) {
      alert("请输入故事正文后再解析哦喵~");
      return;
    }

    const storyObj: StoryResult = {
      title: pastedTitle.trim() || `宝宝的生字奇域记 - 【${selectedWords.join("、") || "生字画"}】`,
      story: pastedStoryText,
      theme: pastedTheme.trim() || `认识了大自然里的字词 “${selectedWords.join("、") || "生词"}”，生命就多了一份智慧的颜色！`,
      goldenQuote: pastedQuote.trim() || "闭上亮晶晶的小眼睛，在甜甜的故事王国外做个好梦吧，宝贝晚安！"
    };

    setCurrentStory(storyObj);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storyObj));
    
    // Voice reporting
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance("故事定制完成！在下方播放录音听一听吧！");
      speech.lang = "zh-CN";
      speech.rate = 0.9;
      window.speechSynthesis.speak(speech);
    }
  };

  // Speaks aloud using SpeechSynthesis API
  const speakStory = () => {
    if (!currentStory) return;
    if ("speechSynthesis" in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        return;
      }

      // Clean characters
      const cleanText = currentStory.story.replace(/\*\*/g, "");
      const finalSpeech = `故事名，${currentStory.title}。故事开始。 ${cleanText}。 故事寓意：${currentStory.theme}。 晚安，宝贝。`;
      const utterance = new SpeechSynthesisUtterance(finalSpeech);
      utterance.lang = "zh-CN";
      utterance.rate = 0.85; // Slow, reassuring speed for kids

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("当前浏览器不支持播放功能喵。");
    }
  };

  const clearStoryAndPastes = () => {
    if (confirm("确定要清空当前故事和输入框吗？")) {
      setCurrentStory(null);
      setPastedTitle("");
      setPastedStoryText("");
      setPastedTheme("");
      setPastedQuote("");
      localStorage.removeItem(STORAGE_KEY);
      
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      }
    }
  };

  // Highlights raw matching characters inside text dynamically
  const renderFormattedStory = (text: string) => {
    if (!text) return null;
    const chars = Array.from(text);
    return chars.map((char, index) => {
      // Check if this single character is one of our active study words
      const isMatch = selectedWords.includes(char) || (unlockedCharacters.some(c => c.word === char));
      if (isMatch) {
        return (
          <motion.span
            key={index}
            animate={{ scale: [1, 1.12, 1], rotate: [0, 1, -1, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, delay: index * 0.04 }}
            className="inline-block px-1 rounded-md bg-rose-100 text-[#9B2C2C] border-b-2 border-rose-400 font-extrabold font-serif text-lg md:text-xl mx-[1px]"
          >
            {char}
          </motion.span>
        );
      }
      return <span key={index} className="text-slate-700 leading-relaxed tracking-wide text-sm md:text-base">{char}</span>;
    });
  };

  return (
    <div className="bg-gradient-to-b from-indigo-50/50 via-white to-purple-50/50 p-4 md:p-6 min-h-full pb-20" id="story-magic-panel">
      
      {/* Top action header */}
      <div className="max-w-2xl mx-auto text-center mb-5 shrink-0 select-none">
        <div className="flex justify-between items-center mb-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-1.5 bg-white border border-indigo-150 text-indigo-700 hover:bg-indigo-50 font-black text-xs rounded-full flex items-center gap-1 cursor-pointer transition shadow-xs"
            >
              ⬅️ 返回大厅
            </button>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-[#BD6C12] rounded-full text-[10px] font-black">
            <Sparkles size={12} className="animate-pulse" />
            免配置API · 智能绘本剧场
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight font-serif" style={{ fontFamily: "KaiTi, Georgia, serif" }}>
          📖 定制 AI 宝宝睡前故事
        </h1>
        <p className="text-slate-500 text-[11px] mt-1.5 max-w-md mx-auto leading-relaxed">
          不需要昂贵繁琐的 AI Key 配置捏！直接点击下方步骤，快速生成提示词，到任意浏览器网页免费生成故事粘贴回来即可！
        </p>
      </div>

      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        
        {/* Step 1: Active selection words card */}
        <div className="bg-white p-4.5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-500" />
              1. 选出宝宝刚才学、或者写成功的字词：
            </h3>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-mono">
              已选 {selectedWords.length} / 4 个
            </span>
          </div>

          {availableChars.length > 0 ? (
            <div className="flex flex-wrap gap-2" id="story-selection-words">
              {availableChars.map((char) => {
                const isSelected = selectedWords.includes(char.word);
                return (
                  <button
                    key={char.id}
                    onClick={() => handleSelectWord(char.word)}
                    className={`relative flex items-center gap-1 px-3 py-2 rounded-xl border-2 font-black text-xs transition duration-150 cursor-pointer ${
                      isSelected
                        ? "border-pink-500 bg-pink-50/50 text-pink-700 shadow-sm"
                        : "border-slate-100 bg-slate-50/30 text-slate-700 hover:border-slate-200"
                    }`}
                  >
                    <span>{char.emoji}</span>
                    <span className="font-sans">{char.word}</span>
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1 bg-pink-500 text-white rounded-full px-1 text-[8px] scale-90">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-4 text-center text-[10px] text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              🌱 您目前还没有任何熟字卡哦，可以先去大厅输入一些好看的汉字词喵~
            </div>
          )}
        </div>

        {/* Step 2 & 3 custom dual tabs system */}
        <div className="bg-white rounded-[2.25rem] border border-slate-200 p-4 shadow-sm flex flex-col gap-4">
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab("copy_prompt")}
              className={`py-2 px-1 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === "copy_prompt"
                  ? "bg-white text-indigo-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Copy size={13} />
              第一步：生成并复制 Prompt
            </button>
            <button
              onClick={() => setActiveTab("paste_read")}
              className={`py-2 px-1 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === "paste_read"
                  ? "bg-white text-indigo-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText size={13} />
              第二步：贴入已编故事
            </button>
          </div>

          {activeTab === "copy_prompt" ? (
            <div className="flex flex-col gap-4">
              <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl flex flex-col gap-2 relative">
                <span className="absolute right-3.5 top-3 text-[#5F57E6] text-xs font-black bg-white px-2 py-0.5 rounded-full border border-indigo-150 font-mono animate-bounce">
                  网页版免费推荐 🐾
                </span>
                <h4 className="text-xs font-black text-indigo-950">
                  📋 动态定制睡眠哄睡 Prompt：
                </h4>
                <p className="text-[10px] text-indigo-800 font-semibold leading-relaxed">
                  大语言模型会将宝贝刚学的汉字串联成大自然的故事，帮助加深联想记忆：
                </p>

                {selectedWords.length > 0 ? (
                  <div className="bg-white border-2 border-dashed border-indigo-200 max-h-44 overflow-y-auto p-3 rounded-xl mt-1.5">
                    <pre className="text-[10px] font-mono text-slate-650 whitespace-pre-wrap leading-normal font-semibold font-sans">
                      {generateDynamicPrompt()}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-center text-[10px] text-amber-800 font-black flex items-center justify-center gap-1 mt-1.5">
                    ⚠️ 请在上方先点击勾选 1~4 个您想要生成故事的生字哦！
                  </div>
                )}
              </div>

              {selectedWords.length > 0 && (
                <div className="flex flex-col gap-3 text-center">
                  {/* Automatic AI Story Creation Button */}
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={handleAutoGenerateStory}
                    className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg shadow-pink-100 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        AI大仙子正在为您连词编故事中...☕️
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} className="animate-spin" style={{ animationDuration: '6s' }} />
                        ✨ 一键智能AI连词成篇 (免费自动生成定制童话)
                      </>
                    )}
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-4 text-[10px] font-black text-slate-400">若需使用其它的外部 AI 模型，可以：</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPromptText}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedPrompt ? <Check size={14} className="text-emerald-600" /> : <Copy size={13} />}
                    {copiedPrompt ? "提示词已成功放入您的剪贴板！" : "📋 复制故事提示词 (去网页版手动生成)"}
                  </button>
                  
                  <div className="flex items-center justify-center gap-3 mt-1 text-[10px] text-slate-400 font-black">
                    <span>外部免费大模型推荐：</span>
                    <a
                      href="https://www.deepseek.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-0.5 bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 rounded-md transition flex items-center gap-0.5"
                    >
                      DeepSeek 网页版 <ExternalLink size={10} />
                    </a>
                    <a
                      href="https://chatgpt.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-md transition flex items-center gap-0.5"
                    >
                      ChatGPT 网页版 <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleImportStory} className="flex flex-col gap-3">
              <div className="bg-[#FFFDF6] border border-amber-200 p-4 rounded-2xl flex flex-col gap-3">
                <h4 className="text-xs font-black text-[#855F00] flex items-center gap-1">
                  ✏️ 定制录入童话纸页：
                </h4>

                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-500">
                      故事书名字 (如: 小水滴日记)
                    </label>
                    <input
                      type="text"
                      value={pastedTitle}
                      onChange={(e) => setPastedTitle(e.target.value)}
                      placeholder="不填将根据所选字自动命名"
                      className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-850 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-500">
                      睡前童话精彩正文 (推荐300字左右) *
                    </label>
                    <textarea
                      required
                      value={pastedStoryText}
                      onChange={(e) => setPastedStoryText(e.target.value)}
                      placeholder="请在这里粘贴从 AI 网页复制回来的完整故事童话。故事里出现的生字，系统都会自动识别画线突出显示哦！"
                      rows={5}
                      className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-850 focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-500">
                        寓意箴言
                      </label>
                      <input
                        type="text"
                        value={pastedTheme}
                        onChange={(e) => setPastedTheme(e.target.value)}
                        placeholder="不填默认自动联想"
                        className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-850 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-500">
                        哄睡晚安密语
                      </label>
                      <input
                        type="text"
                        value={pastedQuote}
                        onChange={(e) => setPastedQuote(e.target.value)}
                        placeholder="不填默认自动联想"
                        className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-850 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow cursor-pointer transition active:scale-98 flex items-center justify-center gap-1"
                >
                  <Wand2 size={13} />
                  ✨ 装订故事并开启有声伴读画册！
                </button>
                {currentStory && (
                  <button
                    type="button"
                    onClick={clearStoryAndPastes}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-550 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    清空
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Display Beautiful customized fairytale book container */}
        {currentStory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-gradient-to-b from-[#FFFDF8] to-[#FCF8EC] border-2 border-[#D8C79C]/60 rounded-[2.5rem] shadow-xl overflow-hidden p-6 relative flex flex-col gap-4 mb-10 text-slate-800"
            id="story-sheet-container"
          >
            {/* Paper notebook line guides left border */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-rose-100 border-l border-rose-200"></div>

            <div className="pl-6 flex flex-col gap-4">
              
              {/* Header section with voice play buttons */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-amber-950 font-serif leading-tight">
                    📜 {currentStory.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] text-amber-900/60 font-black">
                    <Moon size={11} className="text-indigo-400" />
                    宝宝重点字联读高光：
                    {selectedWords.length > 0 ? (
                      selectedWords.map((word) => (
                        <span key={word} className="bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded text-rose-800 font-extrabold text-[10px]">
                          {word}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">（点击上方字卡以点亮）</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={speakStory}
                  className={`p-3 rounded-full cursor-pointer transition-all border shrink-0 shadow-sm relative ${
                    isPlaying
                      ? "bg-amber-150 border-amber-300 text-amber-700 animate-pulse scale-102"
                      : "bg-white border-amber-900/10 text-amber-800 hover:bg-amber-50"
                  }`}
                  title="开/关伴读声音"
                >
                  {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>

              {/* Story scroll page block */}
              <div className="bg-[#FAF6EA]/50 border border-dashed border-[#E9DFBD]/50 p-4.5 rounded-2xl w-full">
                <p className="whitespace-pre-line text-slate-800 text-sm leading-relaxed font-semibold">
                  {renderFormattedStory(currentStory.story)}
                </p>
              </div>

              {/* Theme & quote blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 select-none">
                <div className="bg-amber-100/35 p-3 rounded-xl border border-amber-900/5">
                  <h4 className="text-[10px] font-black text-amber-950 flex items-center gap-1 mb-1">
                    🐾 故事启蒙道理
                  </h4>
                  <p className="text-[10px] text-amber-900/80 leading-relaxed font-bold">
                    {currentStory.theme}
                  </p>
                </div>

                <div className="bg-[#ECFAF2]/80 p-3 rounded-xl border border-emerald-950/5">
                  <h4 className="text-[10px] font-black text-emerald-900 flex items-center gap-1 mb-1">
                    🌾 摇篮哄睡耳语
                  </h4>
                  <p className="text-[10px] text-emerald-950/80 italic font-bold leading-relaxed">
                    "{currentStory.goldenQuote}"
                  </p>
                </div>
              </div>

              {/* Punch star alert card */}
              <div className="bg-gradient-to-r from-amber-100/50 to-orange-100/30 p-3 rounded-2xl border border-amber-200/50 flex items-center justify-between select-none">
                <p className="text-[10px] font-black text-amber-950">
                  🎉 【识字宝宝贴画奖赏】听完睡前童话，获赠星星能量 +10 🌟！
                </p>
                <span className="text-[9px] font-black bg-[#E2B100] text-white px-2 py-0.5 rounded-full shadow-xs">
                  智慧点满
                </span>
              </div>

            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
