/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { Character } from "../types";
import { Trash2, Edit2, CheckCircle2, ChevronRight, HelpCircle, ArrowLeft, Play, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface WritingCanvasProps {
  character: Character;
  onSaveDrawing: (dataUrl: string) => void;
  onClose: () => void;
}

interface StrokePath {
  name: string; // Name of current stroke (e.g., 横, 竖, 撇, 捺)
  points: { x: number; y: number }[]; // Coordinates in percentage (0 - 100)
}

// Complete stroke guide databases covering 20 core kid characters
const STROKE_DATABASES: Record<string, StrokePath[]> = {
  "一": [
    { name: "横 (héng)", points: [{ x: 20, y: 50 }, { x: 80, y: 50 }] }
  ],
  "二": [
    { name: "上短横 (héng)", points: [{ x: 30, y: 35 }, { x: 70, y: 35 }] },
    { name: "下长横 (héng)", points: [{ x: 20, y: 65 }, { x: 80, y: 65 }] }
  ],
  "三": [
    { name: "上横 (héng)", points: [{ x: 30, y: 30 }, { x: 70, y: 30 }] },
    { name: "中短横 (héng)", points: [{ x: 35, y: 50 }, { x: 65, y: 50 }] },
    { name: "下长横 (héng)", points: [{ x: 20, y: 70 }, { x: 80, y: 70 }] }
  ],
  "十": [
    { name: "先横 (héng)", points: [{ x: 20, y: 50 }, { x: 80, y: 50 }] },
    { name: "后竖 (shù)", points: [{ x: 50, y: 15 }, { x: 50, y: 85 }] }
  ],
  "人": [
    { name: "先撇 (piě)", points: [{ x: 50, y: 20 }, { x: 40, y: 40 }, { x: 20, y: 80 }] },
    { name: "后捺 (nà)", points: [{ x: 46, y: 38 }, { x: 62, y: 58 }, { x: 80, y: 80 }] }
  ],
  "木": [
    { name: "横 (héng)", points: [{ x: 20, y: 42 }, { x: 80, y: 42 }] },
    { name: "竖 (shù)", points: [{ x: 50, y: 15 }, { x: 50, y: 85 }] },
    { name: "撇 (piě)", points: [{ x: 50, y: 42 }, { x: 35, y: 62 }, { x: 20, y: 80 }] },
    { name: "捺 (nà)", points: [{ x: 50, y: 42 }, { x: 65, y: 62 }, { x: 80, y: 80 }] }
  ],
  "土": [
    { name: "上短横 (héng)", points: [{ x: 30, y: 35 }, { x: 70, y: 35 }] },
    { name: "中竖 (shù)", points: [{ x: 50, y: 15 }, { x: 50, y: 85 }] },
    { name: "下长横 (héng)", points: [{ x: 15, y: 85 }, { x: 85, y: 85 }] }
  ],
  "山": [
    { name: "先中竖 (shù)", points: [{ x: 50, y: 20 }, { x: 50, y: 80 }] },
    { name: "再竖折 (shù zhé)", points: [{ x: 25, y: 45 }, { x: 25, y: 80 }, { x: 75, y: 80 }] },
    { name: "后右竖 (shù)", points: [{ x: 75, y: 45 }, { x: 75, y: 80 }] }
  ],
  "口": [
    { name: "先左竖 (shù)", points: [{ x: 28, y: 25 }, { x: 28, y: 75 }] },
    { name: "再横折 (héng zhé)", points: [{ x: 28, y: 25 }, { x: 72, y: 25 }, { x: 72, y: 75 }] },
    { name: "后底下横 (héng)", points: [{ x: 28, y: 75 }, { x: 72, y: 75 }] }
  ],
  "日": [
    { name: "先左竖 (shù)", points: [{ x: 28, y: 22 }, { x: 28, y: 78 }] },
    { name: "再横折 (héng zhé)", points: [{ x: 28, y: 22 }, { x: 72, y: 22 }, { x: 72, y: 78 }] },
    { name: "中横一 (héng)", points: [{ x: 28, y: 50 }, { x: 72, y: 50 }] },
    { name: "末封口横 (héng)", points: [{ x: 28, y: 78 }, { x: 72, y: 78 }] }
  ],
  "水": [
    { name: "中竖钩 (shù gōu)", points: [{ x: 50, y: 15 }, { x: 50, y: 75 }, { x: 44, y: 80 }] },
    { name: "左横撇 (héng piě)", points: [{ x: 22, y: 35 }, { x: 40, y: 35 }, { x: 25, y: 55 }] },
    { name: "右上撇 (piě)", points: [{ x: 76, y: 30 }, { x: 55, y: 50 }] },
    { name: "右下捺 (nà)", points: [{ x: 55, y: 50 }, { x: 78, y: 78 }] }
  ],
  "火": [
    { name: "左点 (diǎn)", points: [{ x: 26, y: 35 }, { x: 33, y: 45 }] },
    { name: "右短撇 (piě)", points: [{ x: 74, y: 35 }, { x: 67, y: 45 }] },
    { name: "中人撇 (piě)", points: [{ x: 50, y: 15 }, { x: 40, y: 50 }, { x: 20, y: 80 }] },
    { name: "末尾长捺 (nà)", points: [{ x: 46, y: 45 }, { x: 62, y: 65 }, { x: 80, y: 80 }] }
  ],
  "月": [
    { name: "先左撇 (piě)", points: [{ x: 30, y: 22 }, { x: 30, y: 78 }, { x: 23, y: 84 }] },
    { name: "再横折钩 (héng zhé gōu)", points: [{ x: 30, y: 22 }, { x: 70, y: 22 }, { x: 70, y: 78 }, { x: 63, y: 74 }] },
    { name: "中横一 (héng)", points: [{ x: 30, y: 40 }, { x: 70, y: 40 }] },
    { name: "中横二 (héng)", points: [{ x: 30, y: 58 }, { x: 70, y: 58 }] }
  ],
  "手": [
    { name: "首撇 (piě)", points: [{ x: 65, y: 20 }, { x: 35, y: 28 }] },
    { name: "中短横 (héng)", points: [{ x: 30, y: 42 }, { x: 70, y: 42 }] },
    { name: "下长横 (héng)", points: [{ x: 20, y: 58 }, { x: 80, y: 58 }] },
    { name: "弯钩 (wān gōu)", points: [{ x: 50, y: 28 }, { x: 50, y: 80 }, { x: 40, y: 84 }] }
  ],
  "天": [
    { name: "上短横 (héng)", points: [{ x: 30, y: 28 }, { x: 70, y: 28 }] },
    { name: "下长横 (héng)", points: [{ x: 20, y: 48 }, { x: 80, y: 48 }] },
    { name: "中人撇 (piě)", points: [{ x: 50, y: 25 }, { x: 38, y: 60 }, { x: 20, y: 85 }] },
    { name: "捺 (nà)", points: [{ x: 46, y: 48 }, { x: 62, y: 68 }, { x: 82, y: 85 }] }
  ],
  "上": [
    { name: "先中竖 (shù)", points: [{ x: 50, y: 15 }, { x: 50, y: 82 }] },
    { name: "再短横 (héng)", points: [{ x: 50, y: 48 }, { x: 74, y: 48 }] },
    { name: "下长横 (héng)", points: [{ x: 20, y: 82 }, { x: 80, y: 82 }] }
  ],
  "下": [
    { name: "上长横 (héng)", points: [{ x: 18, y: 22 }, { x: 82, y: 22 }] },
    { name: "中竖 (shù)", points: [{ x: 50, y: 22 }, { x: 50, y: 82 }] },
    { name: "右下点 (diǎn)", points: [{ x: 55, y: 45 }, { x: 72, y: 62 }] }
  ],
  "大": [
    { name: "横 (héng)", points: [{ x: 20, y: 42 }, { x: 80, y: 42 }] },
    { name: "撇 (piě)", points: [{ x: 50, y: 15 }, { x: 38, y: 55 }, { x: 18, y: 84 }] },
    { name: "捺 (nà)", points: [{ x: 45, y: 42 }, { x: 64, y: 65 }, { x: 82, y: 84 }] }
  ],
  "小": [
    { name: "竖钩 (shù gōu)", points: [{ x: 50, y: 12 }, { x: 50, y: 78 }, { x: 40, y: 82 }] },
    { name: "左点 (diǎn)", points: [{ x: 26, y: 45 }, { x: 18, y: 55 }] },
    { name: "右点 (diǎn)", points: [{ x: 74, y: 45 }, { x: 82, y: 55 }] }
  ],
  "门": [
    { name: "首点 (diǎn)", points: [{ x: 34, y: 24 }, { x: 38, y: 34 }] },
    { name: "先左竖 (shù)", points: [{ x: 34, y: 44 }, { x: 34, y: 82 }] },
    { name: "后横折钩 (héng zhé gōu)", points: [{ x: 34, y: 44 }, { x: 68, y: 44 }, { x: 68, y: 82 }, { x: 60, y: 78 }] }
  ],
  "开": [
    { name: "上短横 (héng)", points: [{ x: 28, y: 32 }, { x: 72, y: 32 }] },
    { name: "下长横 (héng)", points: [{ x: 20, y: 52 }, { x: 80, y: 52 }] },
    { name: "撇 (piě)", points: [{ x: 38, y: 32 }, { x: 34, y: 82 }] },
    { name: "竖 (shù)", points: [{ x: 62, y: 32 }, { x: 62, y: 82 }] }
  ],
  "关": [
    { name: "左点 (diǎn)", points: [{ x: 35, y: 22 }, { x: 42, y: 32 }] },
    { name: "右撇 (piě)", points: [{ x: 65, y: 22 }, { x: 58, y: 32 }] },
    { name: "上横 (héng)", points: [{ x: 30, y: 44 }, { x: 70, y: 44 }] },
    { name: "下长横 (héng)", points: [{ x: 20, y: 60 }, { x: 80, y: 60 }] },
    { name: "撇 (piě)", points: [{ x: 50, y: 44 }, { x: 32, y: 85 }] },
    { name: "捺 (nà)", points: [{ x: 50, y: 60 }, { x: 75, y: 85 }] }
  ],
  "风": [
    { name: "撇 (piě)", points: [{ x: 32, y: 20 }, { x: 25, y: 82 }] },
    { name: "横折弯钩 (héng zhé wān gōu)", points: [{ x: 32, y: 20 }, { x: 72, y: 20 }, { x: 72, y: 82 }, { x: 64, y: 76 }] },
    { name: "撇 (piě)", points: [{ x: 48, y: 35 }, { x: 40, y: 60 }] },
    { name: "点 (diǎn)", points: [{ x: 52, y: 45 }, { x: 60, y: 60 }] }
  ],
  "云": [
    { name: "上短横 (héng)", points: [{ x: 35, y: 26 }, { x: 65, y: 26 }] },
    { name: "下长横 (héng)", points: [{ x: 20, y: 48 }, { x: 80, y: 48 }] },
    { name: "撇折 (piě zhé)", points: [{ x: 50, y: 48 }, { x: 35, y: 72 }, { x: 62, y: 72 }] },
    { name: "点 (diǎn)", points: [{ x: 52, y: 62 }, { x: 68, y: 80 }] }
  ]
};

// Skeletal path analyzer for any custom added characters
export function generateStrokesForCharacter(char: string): StrokePath[] {
  if (STROKE_DATABASES[char]) {
    return STROKE_DATABASES[char];
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not acquire off-screen 2d context");

    // Draw target character in heavy bold Kaiti system font, centered nicely
    ctx.fillStyle = "#000000";
    ctx.font = "bold 72px STKaiti, KaiTi, SimKaiti, Microsoft YaHei, serif, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(char, 50, 50);

    const imgData = ctx.getImageData(0, 0, 100, 100);
    const pixels: { x: number; y: number }[] = [];
    
    // Scan pixel matrix on an accelerated grid
    for (let y = 3; y < 97; y += 2) {
      for (let x = 3; x < 97; x += 2) {
        const idx = (y * 100 + x) * 4;
        const alpha = imgData.data[idx + 3];
        if (alpha > 70) {
          pixels.push({ x, y });
        }
      }
    }

    if (pixels.length > 5) {
      // Group dense pixel regions using distance-based connected component clustering
      const clusters: { x: number; y: number }[][] = [];
      const visited = new Set<string>();

      const getDistSq = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
        return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
      };

      for (const p of pixels) {
        const key = `${p.x},${p.y}`;
        if (visited.has(key)) continue;

        const cluster: { x: number; y: number }[] = [];
        const queue = [p];
        visited.add(key);

        while (queue.length > 0) {
          const curr = queue.shift()!;
          cluster.push(curr);

          for (const n of pixels) {
            const nKey = `${n.x},${n.y}`;
            if (visited.has(nKey)) continue;

            const distSq = getDistSq(curr, n);
            // Neighbor within search radius (4.5 pixels distance)
            if (distSq <= 20) {
              visited.add(nKey);
              queue.push(n);
            }
          }
        }

        // Keep significant stroke segments (at least 6 scanned points)
        if (cluster.length >= 6) {
          clusters.push(cluster);
        }
      }

      const generatedStrokes: StrokePath[] = [];

      clusters.forEach((cluster, idx) => {
        let minX = 100, maxX = 0, minY = 100, maxY = 0;
        cluster.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        });

        const width = maxX - minX;
        const height = maxY - minY;

        const sorted = [...cluster];
        // Heuristic sorting based on stroke orientation
        if (width > height * 1.5) {
          // Horizontal-ish stroke flow: draw from left to right
          sorted.sort((a, b) => a.x - b.x);
        } else if (height > width * 1.5) {
          // Vertical-ish stroke flow: draw from top to bottom
          sorted.sort((a, b) => a.y - b.y);
        } else {
          // Slanted or complex curves: draw from upper-left down to lower-right
          sorted.sort((a, b) => (a.x + a.y) - (b.x + b.y));
        }

        // Resample sequential points to form a sleek animated guide line of 3 to 4 anchors
        const pathPoints: { x: number; y: number }[] = [];
        if (sorted.length >= 2) {
          const stepSize = Math.max(1, Math.floor(sorted.length / 3));
          for (let i = 0; i < sorted.length; i += stepSize) {
            pathPoints.push(sorted[i]);
          }
          const last = sorted[sorted.length - 1];
          if (pathPoints[pathPoints.length - 1] !== last) {
            pathPoints.push(last);
          }
        }

        // Deduplicate adjacent points
        const finalPoints: { x: number; y: number }[] = [];
        pathPoints.forEach(pt => {
          if (finalPoints.length === 0) {
            finalPoints.push(pt);
          } else {
            const prev = finalPoints[finalPoints.length - 1];
            if (Math.abs(prev.x - pt.x) > 1 || Math.abs(prev.y - pt.y) > 1) {
              finalPoints.push(pt);
            }
          }
        });

        if (finalPoints.length >= 2) {
          generatedStrokes.push({
            name: `${idx + 1}号笔画 (舒展笔锋)`,
            points: finalPoints
          });
        }
      });

      // Sort strokes to match the natural write order of Chinese Calligraphy (先上后下，先左后右)
      generatedStrokes.sort((s1, s2) => {
        const p1 = s1.points[0];
        const p2 = s2.points[0];
        
        // If they are on different horizontal tiers (tolerance of 12 pixels/percent)
        if (Math.abs(p1.y - p2.y) > 12) {
          return p1.y - p2.y; // top-most first
        }
        return p1.x - p2.x; // left-most first
      });

      // Rename the strokes to match the sorted write order
      generatedStrokes.forEach((s, idx) => {
        s.name = `${idx + 1}号笔顺描红线`;
      });

      if (generatedStrokes.length > 0) {
        return generatedStrokes;
      }
    }
  } catch (err) {
    console.error("Dynamic writing outline computation failed, falling back to basic skeleton:", err);
  }

  // Soft general square block skeleton fallback to avoid any errors
  return [
    { 
      name: "1号起笔 (左侧竖画)", 
      points: [{ x: 30, y: 30 }, { x: 30, y: 70 }] 
    },
    { 
      name: "2号落笔 (顶部横折)", 
      points: [{ x: 30, y: 30 }, { x: 70, y: 30 }] 
    },
    { 
      name: "3号回笔 (右侧竖折)", 
      points: [{ x: 70, y: 30 }, { x: 70, y: 70 }] 
    },
    { 
      name: "4号收章 (底部口封)", 
      points: [{ x: 30, y: 70 }, { x: 70, y: 70 }] 
    }
  ];
}

const COLORS = [
  { name: "朱砂红", value: "#DC2626" },
  { name: "墨黛黑", value: "#1F2937" },
  { name: "竹青绿", value: "#16A34A" },
  { name: "海天蓝", value: "#2563EB" },
  { name: "夕阳金", value: "#D97706" }
];

export default function WritingCanvas({ character, onSaveDrawing, onClose }: WritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#DC2626"); // Default standard red ink
  const [brushWidth, setBrushWidth] = useState(12);
  const [showGuide, setShowGuide] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Stroke order play states
  const [isPlayingStroke, setIsPlayingStroke] = useState(false);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(-1);
  const animationRef = useRef<number | null>(null);

  // Retrieve stroke instructions
  const [targetStrokes, setTargetStrokes] = useState<StrokePath[]>([]);

  useEffect(() => {
    setTargetStrokes(generateStrokesForCharacter(character.word));
  }, [character.word]);

  const drawGrid = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.strokeStyle = "rgba(220, 38, 38, 0.25)"; // Soft red dashed grid lines
    ctx.lineWidth = 1.5;
    
    // Outer border
    ctx.strokeRect(4, 4, size - 8, size - 8);

    // Set dashed lines
    ctx.setLineDash([5, 5]);

    // Horizontal middle
    ctx.beginPath();
    ctx.moveTo(4, size / 2);
    ctx.lineTo(size - 4, size / 2);
    ctx.stroke();

    // Vertical middle
    ctx.beginPath();
    ctx.moveTo(size / 2, 4);
    ctx.lineTo(size / 2, size - 4);
    ctx.stroke();

    // Diagonals
    ctx.strokeStyle = "rgba(220, 38, 38, 0.1)";
    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(size - 4, size - 4);
    ctx.moveTo(size - 4, 4);
    ctx.lineTo(4, size - 4);
    ctx.stroke();

    // Reset line dash
    ctx.setLineDash([]);
  };

  const drawBackgroundAndText = (ctx: CanvasRenderingContext2D, size: number) => {
    // 1. Clear with warm off-white background
    ctx.fillStyle = "#FCFAF2";
    ctx.fillRect(0, 0, size, size);

    // 2. Draw soft red Kaiti "描红" text in background
    if (showGuide) {
      ctx.save();
      ctx.fillStyle = "rgba(220, 38, 38, 0.13)"; // Soft tracing red ink
      ctx.font = `bold ${size * 0.72}px STKaiti, KaiTi, SimKaiti, serif, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(character.word, size / 2, size / 2);
      ctx.restore();
    }

    // 3. Draw red/dashed grid lines
    drawGrid(ctx, size);
  };

  // Initialize and handle resize of canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const size = Math.min(320, window.innerWidth - 64);
      canvas.width = size;
      canvas.height = size;
      
      drawBackgroundAndText(ctx, size);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [character, showGuide]);

  // Canvas drawing event listeners
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isPlayingStroke) return; // Prevent writing when playing stroke demo
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getEventCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineWidth = brushWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = brushColor;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isPlayingStroke) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getEventCoords(e, canvas);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getEventCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);
    drawBackgroundAndText(ctx, size);
    setSavedSuccess(false);
  };

  const handleSave = () => {
    if (isPlayingStroke) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Save master tracing image in original formats
    const dataUrl = canvas.toDataURL("image/png");
    onSaveDrawing(dataUrl);
    setSavedSuccess(true);
    
    // Voice report feedback
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(`保存成功！宝宝写得真好看，加油喵！`);
      speech.lang = "zh-CN";
      speech.rate = 0.9;
      window.speechSynthesis.speak(speech);
    }

    setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
  };

  // Launch smart play stroke sequence animation (笔顺动画算法)
  const playStrokeAnimation = () => {
    if (isPlayingStroke) return;

    setIsPlayingStroke(true);
    setCurrentStrokeIndex(0);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;

    let strokeIdx = 0;
    let progress = 0; // Cumulative progress 0.0 to 1.0 of drawing current stroke index

    const drawFrame = () => {
      if (strokeIdx >= targetStrokes.length) {
        // Animation finished
        setIsPlayingStroke(false);
        setCurrentStrokeIndex(-1);
        setShowGuide(true);
        
        // Voice report feedback
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const speech = new SpeechSynthesisUtterance("演示完成！请用手指跟着灰色虚线，在黑板画箱中练习写字吧！");
          speech.lang = "zh-CN";
          window.speechSynthesis.speak(speech);
        }
        return;
      }

      setCurrentStrokeIndex(strokeIdx);
      const currentStroke = targetStrokes[strokeIdx];
      const pts = currentStroke.points;

      // Clear layout and redraw background, grid & light 描红 text under the stroke
      drawBackgroundAndText(ctx, size);

      // 1. Draw completed strokes directly onto the canvas in beautiful deep indigo/violet
      for (let s = 0; s < strokeIdx; s++) {
        const prevStroke = targetStrokes[s];
        ctx.beginPath();
        prevStroke.points.forEach((p, idx) => {
          const x = (p.x / 100) * size;
          const y = (p.y / 100) * size;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.lineWidth = brushWidth + 14; // Thicker for excellent display of strokes
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(99, 102, 241, 0.9)"; // Beautiful completed stroke indigo
        ctx.stroke();

        // Label first point of completed stroke with stroke number
        if (prevStroke.points.length > 0) {
          const fx = (prevStroke.points[0].x / 100) * size;
          const fy = (prevStroke.points[0].y / 100) * size;
          ctx.save();
          ctx.fillStyle = "#4F46E5";
          ctx.font = "bold 14px sans-serif";
          ctx.fillText(`${s + 1}`, fx - 16, fy - 16);
          ctx.restore();
        }
      }

      // 2. Draw growing active stroke directly onto the canvas in bright glowing orange
      let targetX = size / 2;
      let targetY = size / 2;
      if (pts.length > 1) {
        ctx.beginPath();
        const startX = (pts[0].x / 100) * size;
        const startY = (pts[0].y / 100) * size;
        ctx.moveTo(startX, startY);

        const totalSegments = pts.length - 1;
        const progressPerSeg = 1 / totalSegments;

        const currentSeg = Math.min(Math.floor(progress / progressPerSeg), totalSegments - 1);
        const segProgress = (progress - currentSeg * progressPerSeg) / progressPerSeg;

        // Draw fully completed segments within this stroke
        for (let i = 0; i <= currentSeg; i++) {
          const p = pts[i];
          const x = (p.x / 100) * size;
          const y = (p.y / 100) * size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        // Draw last growing interpolated line segment
        const p1 = pts[currentSeg];
        const p2 = pts[currentSeg + 1];
        targetX = ((p1.x + (p2.x - p1.x) * segProgress) / 100) * size;
        targetY = ((p1.y + (p2.y - p1.y) * segProgress) / 100) * size;
        ctx.lineTo(targetX, targetY);

        ctx.lineWidth = brushWidth + 16; // Vibrant and thick outline
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#EA580C"; // Glowing active orange
        ctx.stroke();

        // Label first point of ongoing stroke
        const fx = startX;
        const fy = startY;
        ctx.save();
        ctx.fillStyle = "#EA580C";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText(`${strokeIdx + 1}`, fx - 16, fy - 16);
        ctx.restore();
      }

      // 3. Render the interactively glowing pointer tip directly on the main canvas
      if (pts.length > 1) {
        ctx.beginPath();
        ctx.arc(targetX, targetY, (brushWidth / 2) + 9, 0, Math.PI * 2);
        ctx.fillStyle = "#F59E0B";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(targetX, targetY, (brushWidth / 2) + 3, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
      }

      // Progress increment - 0.015 makes each stroke build at a extremely comfortable speed for kids
      progress += 0.015;

      if (progress >= 1) {
        // Move to next stroke sequence
        strokeIdx++;
        progress = 0;
      }

      animationRef.current = requestAnimationFrame(drawFrame);
    };

    // Voice announcement for child
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(`开始演示${character.word}字的写字顺序，宝宝仔细看哦喵！`);
      speech.lang = "zh-CN";
      window.speechSynthesis.speak(speech);
    }

    animationRef.current = requestAnimationFrame(drawFrame);
  };

  return (
    <div className="bg-slate-50 min-h-full py-4 px-4 text-slate-800 flex flex-col justify-between" id="writing-canvas-panel">
      {/* Top action header info */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between border-b border-slate-250 pb-3 h-12 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-black select-none cursor-pointer"
        >
          <ArrowLeft size={16} />
          返回大厅
        </button>

        <h3 className="text-sm font-black flex items-center gap-1 text-rose-950 uppercase select-none">
          ✍️ 小黑板画箱：临摹写字
        </h3>

        <div className="text-right flex items-center gap-1.5 bg-yellow-100 text-amber-900 border border-yellow-250 py-1.5 px-3 rounded-full text-[10px] font-black select-none leading-none">
          <Sparkles size={11} className="text-yellow-600 animate-spin" />
          <span>写字卡 +10🌟</span>
        </div>
      </div>

      {/* Main interaction workspace */}
      <div className="flex-1 max-w-xl mx-auto w-full py-4 flex flex-col items-center justify-center gap-4">
        {/* Helper Tip bubble layout */}
        <div className="bg-white/95 border-2 border-[#F1E5C1] rounded-2xl p-3 shadow-inner w-full text-center">
          <div className="text-base font-black text-rose-950 flex items-center justify-center gap-1">
            <span>书写生字：【</span>
            <span className="text-2xl text-rose-600 font-black animate-pulse" style={{ fontFamily: "KaiTi, Georgia" }}>
              {character.word}
            </span>
            <span>】</span>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold ml-1 font-mono">
              {character.pinyin}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold leading-normal mt-1.5 max-w-sm mx-auto">
            {isPlayingStroke 
              ? "🪄 奇妙水彩笔正自动画出正确笔顺，请仔细看路线哦！" 
              : `用你的手指或鼠标，在方格黑板里跟着灰色虚线练习些“${character.word}”字吧！`
            }
          </p>
        </div>

        {/* Display instructions block if any */}
        {currentStrokeIndex >= 0 && targetStrokes[currentStrokeIndex] && (
          <div className="bg-purple-100 border border-purple-250 text-purple-950 py-1.5 px-4 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 animate-pulse select-none shrink-0">
            <AlertCircle size={12} />
            <span>智能笔画拆解：第 {currentStrokeIndex + 1} 步 —— 正在写 <b>{targetStrokes[currentStrokeIndex].name}</b></span>
          </div>
        )}

        {/* Canvas container with ratio lock */}
        <div 
          ref={containerRef => {
            if (containerRef && canvasRef.current) {
              const rect = containerRef.getBoundingClientRect();
              const size = Math.min(320, window.innerWidth - 64);
              if (canvasRef.current.width !== size) {
                canvasRef.current.width = size;
                canvasRef.current.height = size;
                const ctx = canvasRef.current.getContext("2d");
                if (ctx) drawBackgroundAndText(ctx, size);
              }
            }
          }}
          className="border-8 border-[#3F2B14] rounded-3xl overflow-hidden shadow-2xl relative bg-[#FCFAF2] cursor-crosshair box-border shrink-0 max-w-[325px] flex items-center justify-center"
        >
          {/* Main draw stage */}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="block"
          />
        </div>

        {/* Saved feedback overlay */}
        {savedSuccess && (
          <div className="py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-[10px] font-black tracking-wide animate-bounce flex items-center gap-1 shrink-0">
            <CheckCircle2 size={13} className="text-yellow-300 animate-spin" />
            <span>手稿保存成功！获得星星 +10 🌟</span>
          </div>
        )}

        {/* Control Toolbar */}
        <div className="w-full grid grid-cols-5 gap-2 shrink-0">
          <button
            onClick={playStrokeAnimation}
            disabled={isPlayingStroke}
            className="py-2.5 px-1 bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-95 text-white disabled:opacity-40 rounded-xl text-[10px] font-black shadow flex flex-col items-center justify-center gap-1 cursor-pointer"
            id="btn-play-strokes-demo"
            title="播放写字笔顺动画"
          >
            <Play size={15} />
            看笔顺示范
          </button>

          <button
            onClick={() => setShowGuide(!showGuide)}
            disabled={isPlayingStroke}
            className={`py-2.5 px-1 rounded-xl text-[10px] font-black shadow flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
              showGuide ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-700"
            }`}
            title="是否显示灰色虚线底图"
          >
            <Edit2 size={15} />
            {showGuide ? "隐藏描红" : "显示描红"}
          </button>

          <button
            onClick={clearCanvas}
            disabled={isPlayingStroke}
            className="py-2.5 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black shadow flex flex-col items-center justify-center gap-1 cursor-pointer"
            id="btn-clear-drawing"
            title="擦掉重写"
          >
            <Trash2 size={15} />
            擦除重写
          </button>

          <button
            onClick={handleSave}
            disabled={isPlayingStroke}
            className="col-span-2 py-2.5 px-3 bg-gradient-to-r from-[#1F2937] to-[#374151] hover:from-[#111827] hover:to-[#1f2937] text-white disabled:opacity-40 rounded-xl text-[10px] font-extrabold shadow flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-[0.98] transition"
            id="btn-save-writing-ink"
            title="把宝宝写的字挂进画廊里"
          >
            <CheckCircle2 size={15} className="text-emerald-400" />
            保存手写作品到画廊
          </button>
        </div>

        {/* Color神笔 + Brush Size select boxes */}
        <div className="w-full bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col gap-3.5 shrink-0">
          {/* Color pickers */}
          <div>
            <div className="font-extrabold text-[10px] text-slate-400 mb-2 select-none uppercase tracking-wide">
              🎨 国风彩色神笔 (笔画颜色选择)
            </div>
            <div className="flex justify-between items-center pr-1.5" id="color-palette-bar">
              {COLORS.map((c) => {
                const isActive = brushColor === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => setBrushColor(c.value)}
                    className={`h-7 px-2 border-2 rounded-full cursor-pointer transition flex items-center justify-center gap-1 text-[9px] font-black text-white hover:scale-103 ${
                      isActive ? "scale-105 border-purple-500 rotate-1" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.value }}
                  >
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brush head size slider */}
          <div>
            <div className="flex justify-between items-center mb-1 select-none">
              <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wide">
                🖌️ 毛笔头粗细
              </span>
              <span className="font-mono text-[9px] font-extrabold text-slate-500">
                {brushWidth === 6 ? "细神笔 (6px)" : brushWidth === 12 ? "标准毛笔 (12px)" : "粗豪笔 (20px)"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2" id="brush-size-select-grid">
              {[
                { label: "细笔", width: 6 },
                { label: "标准", width: 12 },
                { label: "粗笔", width: 20 }
              ].map((sw) => {
                const isSelected = brushWidth === sw.width;
                return (
                  <button
                    key={sw.width}
                    onClick={() => setBrushWidth(sw.width)}
                    className={`py-1 rounded-lg text-[9px] font-extrabold cursor-pointer transition ${
                      isSelected
                        ? "bg-slate-800 text-white select-none shadow"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    {sw.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
