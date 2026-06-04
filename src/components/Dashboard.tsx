/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Character, UserProgress } from "../types";
import { Calendar, Search, Sparkles, BookOpen, PenTool, Award, Star, Flame, ChevronRight, HelpCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  userProgress: UserProgress;
  allCharacters: Character[];
  onAddAndLearnWord: (word: string) => void;
  onNavigateTab: (tab: "lobby" | "writing" | "checklist" | "trophy") => void;
  selectedCalendarDate: string;
  onSelectCalendarDate: (date: string) => void;
  alertMessage: { text: string; date?: string; word?: string } | null;
  onCloseAlert: () => void;
}

export default function Dashboard({
  userProgress,
  allCharacters,
  onAddAndLearnWord,
  onNavigateTab,
  selectedCalendarDate,
  onSelectCalendarDate,
  alertMessage,
  onCloseAlert
}: DashboardProps) {
  const [inputWord, setInputWord] = useState("");

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const word = inputWord.trim();
    if (!word) return;
    onAddAndLearnWord(word);
    setInputWord("");
  };

  // Helper: Calculate week Monday-Friday of selected calendar date
  const getWeekDates = (dateString: string) => {
    const date = new Date(dateString);
    let day = date.getDay(); // 0 is Sunday, 1 is Monday...
    let diffToMonday = day === 0 ? -6 : 1 - day;
    
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    
    const weekdaysName = ["周一", "周二", "周三", "周四", "周五"];
    const dates = [];
    
    for (let i = 0; i < 5; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      const formatted = `${yyyy}-${mm}-${dd}`;
      dates.push({
        label: weekdaysName[i],
        dateStr: formatted,
        dayNum: dd,
      });
    }
    return dates;
  };

  const weekList = getWeekDates(selectedCalendarDate);

  // List of characters learned on selected date
  const unlockedDatesMap = userProgress.unlockedDates || {};
  const learnedOnSelectedDate = allCharacters.filter((char) => {
    return unlockedDatesMap[char.id] === selectedCalendarDate || unlockedDatesMap[char.word] === selectedCalendarDate;
  });

  // Calculate mastery ratio
  const unlockedCount = userProgress.unlockedCharIds.length;
  const totalCount = allCharacters.length;
  const masteryRatio = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 58;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/60 pb-20 select-none pb-2" id="dashboard-tab-content">
      
      {/* Alert Overlay Dialogue for Learned Character Lookup Notification */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-white rounded-[2.5rem] p-6 max-w-sm w-full border-2 border-rose-100 shadow-2xl flex flex-col items-center text-center gap-4 relative"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 text-3xl">
                🌟
              </div>
              <div>
                <h3 className="text-base font-black text-rose-950 leading-normal">
                  已经在字库里啦 喵！
                </h3>
                <p className="text-xs text-rose-800 font-medium leading-relaxed mt-2.5">
                  宝宝在 <strong className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-extrabold">{alertMessage.date}</strong> 这一天就已经学过了
                  <span className="block text-4xl font-black text-rose-600 my-3 font-serif" style={{ fontFamily: "KaiTi, Georgia, serif" }}>
                    “{alertMessage.word}”
                  </span>
                  小主人的字画仙气已经存入档案了，可以继续练习想学的新奇生字哦！
                </p>
              </div>
              <button
                onClick={onCloseAlert}
                className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs rounded-2xl active:scale-95 transition cursor-pointer"
              >
                我知道了喵
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto w-full px-4 py-3 flex flex-col gap-4">
        
        {/* Top title bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 pt-1.5 select-none text-slate-800">
            <span className="text-2xl animate-spin" style={{ animationDuration: "12s" }}>🌀</span>
            <span className="text-sm font-black tracking-tight font-serif" style={{ fontFamily: "KaiTi, Georgia, serif" }}>乐学识字宝箱 (微端)</span>
          </div>
          <span className="text-xs font-black bg-pink-100 text-pink-600 border border-pink-200 px-2.5 py-1 rounded-full">
            小主人专区 Map
          </span>
        </div>

        {/* 1. Pink stats panel block - EXACT EXTREME MATCH to image 1 */}
        <div className="bg-[#FFEFEF] border-[4px] border-[#FFD5E1] rounded-[2.25rem] p-5 shadow-sm text-slate-800 flex flex-col gap-3.5">
          <div className="flex items-center gap-1.5">
            <span className="text-lg block animate-bounce">🌟</span>
            <div>
              <h2 className="text-sm font-black text-[#A62744] flex items-center gap-1.5">
                小主人快乐识字总计
              </h2>
              <p className="text-[10px] text-[#A62744]/70 font-semibold mt-0.5">
                今天学点新词语，点亮智慧小宝箱吧！
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Links to Tab 4 for mastered characters list */}
            <button
              onClick={() => onNavigateTab("trophy")}
              className="bg-white hover:bg-slate-50 active:scale-95 transition-all text-center py-3.5 px-1 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
              id="stat-familiar-bank"
            >
              <span className="text-[9px] font-black text-[#A8556A] leading-tight block select-none">
                熟字库 👈点击
                <span className="block">去字库</span>
              </span>
              <span className="text-lg font-black text-[#E11D48] text-center select-none block">
                {unlockedCount}字
              </span>
            </button>

            {/* Links to Tab 3 for want-to-learn checklists */}
            <button
              onClick={() => onNavigateTab("checklist")}
              className="bg-white hover:bg-slate-50 active:scale-95 transition-all text-center py-3.5 px-1 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
              id="stat-preparing-checklist"
            >
              <span className="text-[9px] font-black text-[#A8556A] leading-tight block select-none">
                准备学 👈点击
                <span className="block">去清单</span>
              </span>
              <span className="text-lg font-black text-[#E11D48] text-center select-none block">
                {(userProgress.toBeLearnedCharIds || []).length}字
              </span>
            </button>

            {/* Mastery percentage */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-center py-3.5 px-1 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-1.5">
              <span className="text-[9px] font-bold text-indigo-100 tracking-wider">
                总进度
              </span>
              <span className="text-lg font-black text-white filter drop-shadow">
                {masteryRatio}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Action Input Section - MATCH layout */}
        <div className="bg-[#FFF8F8] border border-[#FFECEB] rounded-[2rem] p-5 shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-black text-[#BD6C12] flex items-center gap-1.5 select-none">
            ✏️ 小主人准备学写什么字呢？
          </h3>
          
          <form onSubmit={handleAddSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="输入你想描红的汉字(如：天、日)"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              className="flex-1 bg-[#FFFDFD] border border-[#FFDFDC] px-3.5 py-3 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-pink-300 shadow-inner"
              id="dashboard-word-input"
            />
            <button
              type="submit"
              className="px-4 bg-[#FF4D7D] hover:bg-[#E11D48] text-white rounded-2xl text-xs font-black tracking-wide font-serif shadow shadow-pink-200 cursor-pointer active:scale-95 transition-all w-24 flex items-center justify-center"
              id="btn-add-and-learn"
            >
              加入并学写
            </button>
          </form>

          <p className="text-[9px] text-slate-400 font-medium leading-relaxed" id="dashboard-tips-text">
            💡 输入后系统自动判断：如果您已经学过该字，将提示哪天学过；如果是新汉字，则加入待学计划并直接跳转到黑板开始描红写字练习喵！
          </p>
        </div>

        {/* 3. Calendar Section - FULL STATE DRIVEN - MATCH screenshot */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between shrink-0 mb-1">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1">
              📅 识字小英雄时间历
            </span>

            {/* Date Dropper picker input */}
            <div className="relative inline-block">
              <input
                type="date"
                value={selectedCalendarDate}
                onChange={(e) => onSelectCalendarDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <span className="bg-[#FFF1F2] text-[#FF4D7D] font-extrabold text-[10px] px-3 py-1 rounded-full shadow-inner flex items-center gap-0.5 border border-pink-100">
                {selectedCalendarDate} 📅
              </span>
            </div>
          </div>

          {/* Week list horizontal block selector */}
          <div className="grid grid-cols-5 gap-1.5">
            {weekList.map((item) => {
              const isActive = item.dateStr === selectedCalendarDate;
              // Check if anything unlocked on this calendar date
              let hasUnlocks = false;
              for (let charId in unlockedDatesMap) {
                if (unlockedDatesMap[charId] === item.dateStr) {
                  hasUnlocks = true;
                  break;
                }
              }

              return (
                <button
                  key={item.dateStr}
                  onClick={() => onSelectCalendarDate(item.dateStr)}
                  className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-between h-14 cursor-pointer transition ${
                    isActive
                      ? "bg-[#FF4D7D] text-white shadow shadow-pink-200 -translate-y-[1px]"
                      : "bg-[#F8FAFC] text-slate-800 hover:bg-slate-100"
                  }`}
                  id={`weekday-${item.dayNum}`}
                >
                  <span className={`text-[8px] font-extrabold ${isActive ? "text-pink-100" : "text-slate-400"}`}>
                    {item.label}
                  </span>
                  <span className="text-xs font-black">
                    {item.dayNum}
                  </span>
                  {/* Learned dots marker below */}
                  {hasUnlocks ? (
                    <span className={`w-1 h-1 rounded-full ${isActive ? "bg-white" : "bg-red-500"}`}></span>
                  ) : (
                    <span className="w-1 h-1 bg-transparent"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dynamical Learned list on selected date - MATCH */}
          <div className="border-t border-dashed border-slate-100 pt-3 flex flex-col gap-3">
            <h4 className="text-[10px] font-black text-slate-500 leading-tight">
              📂 在 【{selectedCalendarDate}】 学会的汉字：{learnedOnSelectedDate.length} 个字
            </h4>

            {learnedOnSelectedDate.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {learnedOnSelectedDate.map((char) => (
                  <div
                    key={char.id}
                    className="bg-[#F1F5F9] hover:bg-slate-200 border border-slate-200 px-4 py-1.5 rounded-full text-xs font-black text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                    onClick={() => onNavigateTab("writing")}
                    title="点击去练习"
                  >
                    <span>{char.word}</span>
                    <span className="text-[9px] font-bold text-slate-400 font-mono">({char.pinyin})</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-5 text-center text-[10px] text-slate-400 border border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                🌱 小主人在 【{selectedCalendarDate}】 还没有收获新的汉字果实呢。
                <button
                  onClick={() => onNavigateTab("checklist")}
                  className="block mx-auto mt-2 text-[#FF4D7D] hover:underline font-black cursor-pointer"
                >
                  带小宝贝去学汉字打卡 ➔
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
