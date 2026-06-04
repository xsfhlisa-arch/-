/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Character } from "../types";
import { MessageSquare, Sparkles, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";

interface TeacherKittyProps {
  character: Character;
}

export default function TeacherKitty({ character }: TeacherKittyProps) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  // Load origin details of character when it shifts
  useEffect(() => {
    const fetchExplanation = async () => {
      setLoading(true);
      setExplanation("");
      try {
        const res = await fetch("/api/gemini/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: character.word }),
        });
        const data = await res.json();
        setExplanation(data.explanation);
      } catch (e) {
        console.error(e);
        // Fallback local explanation if API runs offline
        setExplanation(`喵哈啰！这里是小喵老师~喵☀️“${character.word}”字很神奇哦！它在古代是一个可爱的象形字。${character.pictograph}小仙子一定要好好记住它哦！喵~`);
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [character]);

  const speakExplanation = () => {
    if (!explanation) return;
    if ("speechSynthesis" in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(explanation);
      utterance.lang = "zh-CN";
      utterance.rate = 0.9; // Mild gentle speech rate for preschoolers
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("哎呀，当前浏览器不支持小猫大声说话哦，建议重新在主浏览器打开体验语音朗读。");
    }
  };

  return (
    <div className="bg-amber-50/70 rounded-2xl border border-amber-200/50 p-4 relative" id="teacher-kitty-block">
      {/* Cat mascot layout design */}
      <div className="flex gap-3">
        {/* Kitty Avatar illustration */}
        <div className="relative shrink-0 select-none">
          <motion.div
            animate={{
              y: [0, -3, 0],
              rotate: [0, 1, -1, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }}
            className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-white shadow-md text-3xl"
          >
            🐱
          </motion.div>
          <span className="absolute -bottom-1 -right-0.5 bg-yellow-400 text-[10px] px-1 rounded-full border border-white font-extrabold text-white">
            喵
          </span>
        </div>

        {/* Interactive Speech Bubble */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-amber-900 flex items-center gap-1">
              小喵老师说书 (AI Teacher Kitty)
              <Sparkles size={11} className="text-amber-500 animate-pulse" />
            </span>
            {explanation && !loading && (
              <button
                onClick={speakExplanation}
                className={`p-1 rounded-full cursor-pointer transition ${
                  isPlaying ? "bg-amber-200 text-amber-800" : "bg-white text-gray-500 hover:bg-gray-100"
                }`}
                title="大声叫出来"
              >
                {isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            )}
          </div>

          <div className="relative bg-white p-3 rounded-2xl border border-amber-100">
            {/* Arrow decor bubble pointer */}
            <div className="absolute left-[-6px] top-4 w-3 h-3 bg-white border-l border-b border-amber-100 rotate-45"></div>

            {loading ? (
              <div className="py-2 flex items-center justify-center gap-1.5 text-xs text-amber-900/40">
                <span className="animate-bounce">🐾</span>
                小喵老师正在翻阅魔法古书，请稍等喵...
              </div>
            ) : (
              <p className="text-xs text-gray-700 leading-relaxed font-semibold font-sans">
                {explanation}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
