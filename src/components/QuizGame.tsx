/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Character, QuizQuestion, UserProgress } from "../types";
import { Award, CheckCircle, XCircle, ArrowRight, Home, Sparkles, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuizGameProps {
  characters: Character[];
  userProgress: UserProgress;
  onQuizComplete: (starsEarned: number, unlockedStickerId?: string) => void;
  onClose: () => void;
}

const STICKERS = [
  { id: "star_kitty", emoji: "🐱✨", name: "聪慧小猫喵喵" },
  { id: "cool_dog", emoji: "🐶🕶️", name: "帅气学霸吉比" },
  { id: "super_rabbit", emoji: "🐰🚀", name: "太空飞天兔兔" },
  { id: "smart_owl", emoji: "🦉🎓", name: "博士博学猫头鹰" },
  { id: "rainbow_unicorn", emoji: "🦄🌈", name: "缤纷独角仙子" },
  { id: "gold_medal", emoji: "🥇🎖️", name: "识字金牌达人" }
];

export default function QuizGame({ characters, userProgress, onQuizComplete, onClose }: QuizGameProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [wonSticker, setWonSticker] = useState<typeof STICKERS[0] | null>(null);

  // Generate 5 random questions on mount
  useEffect(() => {
    if (characters.length < 4) return;
    
    const quizList: QuizQuestion[] = [];
    const charPool = [...characters];
    
    // Shuffle helper
    const shuffleArray = <T,>(arr: T[]): T[] => {
      return [...arr].sort(() => Math.random() - 0.5);
    };

    const types: ("char_to_pinyin" | "pinyin_to_char" | "char_to_meaning" | "char_to_emoji")[] = [
      "char_to_pinyin",
      "pinyin_to_char",
      "char_to_meaning",
      "char_to_emoji"
    ];

    for (let i = 0; i < 5; i++) {
      const targetChar = charPool[Math.floor(Math.random() * charPool.length)];
      const qType = types[Math.floor(Math.random() * types.length)];
      
      // Select 3 incorrect options from other characters
      const wrongChars = charPool.filter((c) => c.id !== targetChar.id);
      const shuffledWrong = shuffleArray(wrongChars).slice(0, 3);
      
      let questionText = "";
      let ans = "";
      let wrongOptions: string[] = [];

      switch (qType) {
        case "char_to_pinyin":
          questionText = `汉字“${targetChar.word}”读什么音呢？`;
          ans = targetChar.pinyin;
          wrongOptions = shuffledWrong.map((c) => c.pinyin);
          break;
        case "pinyin_to_char":
          questionText = `读音“${targetChar.pinyin}”对应哪个字呢？`;
          ans = targetChar.word;
          wrongOptions = shuffledWrong.map((c) => c.word);
          break;
        case "char_to_meaning":
          questionText = `汉字“${targetChar.word}”代表什么意思？`;
          ans = targetChar.meaning;
          wrongOptions = shuffledWrong.map((c) => c.meaning);
          break;
        case "char_to_emoji":
          questionText = `哪个图画最贴合“${targetChar.word}”字的意思？`;
          ans = targetChar.emoji;
          wrongOptions = shuffledWrong.map((c) => c.emoji);
          break;
      }

      // Safeguard against duplicates in wrong options
      const uniqueOptions = Array.from(new Set([ans, ...wrongOptions]));
      while (uniqueOptions.length < 4) {
        const extraChar = charPool[Math.floor(Math.random() * charPool.length)];
        let extraVal = "";
        if (qType === "char_to_pinyin") extraVal = extraChar.pinyin;
        else if (qType === "pinyin_to_char") extraVal = extraChar.word;
        else if (qType === "char_to_meaning") extraVal = extraChar.meaning;
        else extraVal = extraChar.emoji;

        if (!uniqueOptions.includes(extraVal)) {
          uniqueOptions.push(extraVal);
        }
      }

      const shuffledOptions = shuffleArray(uniqueOptions);

      quizList.push({
        id: `q-${i}-${Date.now()}`,
        type: qType,
        question: questionText,
        questionChar: targetChar.word,
        options: shuffledOptions,
        answer: ans,
        explanation: `“${targetChar.word}”字可以念作【${targetChar.pinyin}】，意思是：${targetChar.meaning}。象形描述：${targetChar.pictograph.slice(0, 40)}`
      });
    }

    setQuestions(quizList);
  }, [characters]);

  // Plays synthesized cheerful chirpy sound effects
  const playBeep = (type: "correct" | "incorrect" | "ending") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "correct") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "incorrect") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(196, ctx.currentTime); // G3
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio context policy blocked or other issues
    }
  };

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const question = questions[currentIndex];
    const correct = option === question.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
      playBeep("correct");
    } else {
      playBeep("incorrect");
    }
  };

  const speakQuestion = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed, compute star values and select an unlocked sticker
      const earnedStars = score * 5 + 10; // 5 per correct + 10 bonus
      
      // Determine earned sticker
      const unacquired = STICKERS.filter(s => !(userProgress.collectedStickers || []).includes(s.id));
      const stickerToEarn = unacquired.length > 0 
        ? unacquired[Math.floor(Math.random() * unacquired.length)]
        : STICKERS[Math.floor(Math.random() * STICKERS.length)];
      
      setWonSticker(stickerToEarn);
      setGameFinished(true);
      playBeep("ending");
      onQuizComplete(earnedStars, stickerToEarn?.id);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center p-6 text-gray-500">
        正在为您精当编排生字关卡卡牌...
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="bg-gradient-to-b from-sky-50/50 via-white to-orange-50/50 p-4 md:p-6 h-full flex flex-col justify-between" id="quiz-game-panel">
      {/* Top quiz status card */}
      {!gameFinished && (
        <div className="max-w-xl mx-auto w-full">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-full shadow-sm text-xs text-gray-600 hover:bg-gray-50 font-semibold cursor-pointer transition"
            >
              <Home size={14} />
              返回主页
            </button>
            <div className="flex items-center gap-1 bg-amber-100 px-3 py-1.5 rounded-full text-xs font-extrabold text-amber-800">
              <Sparkles size={13} className="text-amber-500" />
              当前星星 🌟 {userProgress.stars}
            </div>
          </div>

          {/* Progress bar visualizer */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full mb-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-400 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="text-center font-bold text-xs text-slate-400 mb-1">
            第 {currentIndex + 1} / {questions.length} 题
          </div>
        </div>
      )}

      {/* Main card interface */}
      <div className="flex-1 max-w-xl mx-auto w-full py-4 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!gameFinished ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="bg-white p-6 rounded-3xl border border-sky-100 shadow-xl"
              id="quiz-card"
            >
              {/* Question Text with speech support */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-800 text-center">
                  {currentQuestion.question}
                </h2>
                <button
                  onClick={() => speakQuestion(currentQuestion.question)}
                  className="p-1.5 bg-sky-50 text-sky-600 rounded-full hover:bg-sky-100 active:scale-95 transition shrink-0 cursor-pointer"
                  title="播放问题读音"
                >
                  <Volume2 size={15} />
                </button>
              </div>

              {/* Big character presentation */}
              {currentQuestion.questionChar && (
                <div 
                  className="w-28 h-28 mx-auto flex items-center justify-center border-4 border-dashed border-red-500/10 bg-red-500/5 text-red-600 font-extrabold rounded-2xl mb-8 shadow-inner select-none"
                  style={{ fontSize: "4.5rem", fontFamily: "KaiTi, Georgia, serif" }}
                >
                  {currentQuestion.questionChar}
                </div>
              )}

              {/* Choice lists */}
              <div className="grid grid-cols-2 gap-4" id="quiz-options-list">
                {currentQuestion.options.map((option) => {
                  const isThisOptionSelected = selectedOption === option;
                  const isCorrectAnswer = option === currentQuestion.answer;
                  
                  let optStyle = "border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-slate-50 hover:border-slate-350";
                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      optStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-inner";
                    } else if (isThisOptionSelected) {
                      optStyle = "border-red-500 bg-red-50 text-red-800 font-bold shadow-inner";
                    } else {
                      optStyle = "border-slate-100 bg-slate-100 text-slate-300 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleOptionClick(option)}
                      disabled={isAnswered}
                      className={`h-16 rounded-2xl border-2 flex items-center justify-center text-lg md:text-xl font-sans font-bold transition-all duration-200 cursor-pointer ${optStyle}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Explanation tip block */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-150 text-left"
                  id="quiz-answer-explains"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {isCorrect ? (
                      <span className="text-emerald-650 font-bold text-sm flex items-center gap-1">
                        <CheckCircle size={16} /> 答对啦！小主人超级棒！👑
                      </span>
                    ) : (
                      <span className="text-red-600 font-bold text-sm flex items-center gap-1">
                        <XCircle size={16} /> 答错了，不要气馁喵！下一题加油~
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            // Game Finished Victory board
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-3xl border border-sky-100 shadow-2xl text-center"
              id="quiz-grade-completed"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Award size={36} className="text-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-1">
                趣味汉字大挑战完成！🎉
              </h2>
              <p className="text-slate-400 text-xs mb-6 font-semibold">恭喜小主人顺利答完所有题目，奖励已发放喵！</p>

              {/* Reward stats cards columns */}
              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/50">
                  <span className="text-2xl block">🌟</span>
                  <p className="text-amber-800 font-black text-base mt-1">+{score * 5 + 10}</p>
                  <p className="text-[10px] text-amber-700/70 font-bold">获取星星奖励</p>
                </div>

                {wonSticker && (
                  <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-150">
                    <span className="text-3xl block animate-pulse">{wonSticker.emoji}</span>
                    <p className="text-indigo-800 font-black text-xs mt-1">{wonSticker.name}</p>
                    <p className="text-[10px] text-indigo-700/60 font-medium">学会新字章</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6">
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  挑战成绩单：以极其卓越的成绩通过了关卡 <strong className="text-emerald-600 font-black text-sm">{score} / 5</strong>
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  {score === 5
                    ? "全对神级操作！宝宝简直是天才汉字专家！🏆"
                    : score >= 3
                    ? "好棒喵！再接再厉就能拿到满分五星图章咯~"
                    : "听小喵老师的话，多听几个床头睡前故事，一定可以拿到高分！"}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white font-bold text-sm shadow-md shadow-sky-500/10 rounded-xl hover:from-sky-500 hover:to-blue-600 cursor-pointer active:scale-95 transition"
                id="btn-return-lobby"
              >
                收下奖励，返回主屋
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Button to proceed forward */}
      {!gameFinished && isAnswered && (
        <div className="max-w-xl mx-auto w-full mb-4">
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 text-white font-bold text-sm shadow-md rounded-xl hover:bg-slate-900 cursor-pointer active:scale-95 transition"
            id="btn-next-question"
          >
            {currentIndex === questions.length - 1 ? "完成闯关" : "下一题"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
