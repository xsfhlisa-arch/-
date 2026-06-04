/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { pinyin } from "pinyin-pro";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API client initialized successfully.");
  } else {
    console.warn("No valid GEMINI_API_KEY environment variable found. Falling back to local story generator templates.");
  }
} catch (err) {
  console.error("Failed to initialize Google GenAI SDK:", err);
}

// Warm Template stories dictionary for child learning words
const FALLBACK_STORIES: Array<{
  words: string[];
  title: string;
  story: string;
  theme: string;
  goldenQuote: string;
}> = [
  {
    words: ["日", "月"],
    title: "日和月亮的捉迷藏 ☀️🌙",
    story: "在无忧无虑的天空中，住着红润温热的**日**太阳公公和银白晶莹的**月**亮姐姐。每天白昼，太阳照耀着青青山谷，把厚厚的晨雾悄悄擦掉。到了傍晚，月亮姐姐端着满盘金子般的闪烁星星升上了苍穹台。他们平时很少相见，但总会在黄昏或清晨的一瞬间，手拉手打个甜甜的小招呼，玩起可爱的捉迷藏派对喵！",
    theme: "昼夜交替的自然美感，学会珍惜每段相遇的美好时光。",
    goldenQuote: "宝贝轻轻跟一天的辛劳道声再见，拥抱松软香甜的黑夜宝宝梦幻吧！"
  },
  {
    words: ["水", "火"],
    title: "水滴宝宝与火苗精灵 💧🔥",
    story: "在一片神奇的魔幻雨林里，有一股清澈凉爽的小泉**水**。一天，不知从哪里跳出一朵调皮迷路的小红**火**苗，冷得瑟瑟发抖。善良的水滴宝宝没有浇灭它，而是化作层层暖融融的水蒸气，把小红火包裹在中间，既让小火苗感到舒坦安全，又不会淋湿。他们成了终身的好朋友，共同在绿色森林山谷里欢快舞蹈！",
    theme: "包容他人，用智慧与爱去化解冲突与大不同。",
    goldenQuote: "喝一杯温温的水，闭上双眼，舒舒服服睡大觉喵~"
  },
  {
    words: ["山", "木", "石"],
    title: "大山、石头和老树朋友 🏔️🌳🪨",
    story: "很久很久以前，有一座沉静博大的巨**山**。在它的脊梁上，安家着一棵树冠繁盛的香樟小**木**树，以及一块顽皮坚韧的小**石**头。每当狂风呼呼大呼吹过，樟树树叶都会沙沙地发出美妙钢琴曲，石头则安稳地压住松散的泥土，守护着樟树的树根。大山笑着伸出绿色手臂抱紧着他们，三个伙伴风雨同舟，每天都无惧寒冷！",
    theme: "互相依偎，团结的力量能够让我们度过每个考验。",
    goldenQuote: "像大山和松木一样安稳沉静，安睡到东方日出吧！"
  },
  {
    words: ["人", "手", "天"],
    title: "手拉手到手心天边 👨‍👩‍👧✈️",
    story: "蓝天白云下有一群快乐的**人**。每个人都拥有一双温暖灵巧的**手**，能够折出金黄的大纸飞机、搭盖起城堡。一天，小朋友用手拉着爸爸妈妈，抬头望向无边蔚蓝的**天**空。他们在草地上奔跑撒欢，微风拂面走过。爸爸妈妈告诉宝宝：只要心中充满关爱，手拉着手，我们就可以飞上无限高远、摘下最亮晶晶的星星！",
    theme: "家庭团结关爱，勤劳的小手创造充满幸福的乐园！",
    goldenQuote: "握紧你的松软被角，宝宝是在太空驾驶大飞船的小超级飞侠哟喵！"
  }
];

// POST /api/gemini/story endpoint
app.post("/api/gemini/story", async (req, res) => {
  const { words } = req.body;
  if (!words || !Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ error: "Please specify input words list mapped parameters." });
  }

  // 1. Try DeepSeek storyteller AI API first if configured
  const dsApiKey = process.env.DEEPSEEK_API_KEY;
  if (dsApiKey && dsApiKey !== "" && dsApiKey !== "undefined") {
    try {
      console.log("Found DeepSeek API key. Directing story request to DeepSeek chat endpoint...");
      const prompt = `你是一位专注 3-8 岁儿童语言启蒙、性格培养的温暖儿童绘本睡前故事大师，外号叫“小喵老师”。
请为宝宝编写一个童趣满满、发音清晰、富有智慧的识字伴读短故事。

要求：
1. 必须在故事中自然、不显做作地融入以下这几个宝宝正在学习的汉字，并用双星号将每一个目标汉字加粗强调（例如：**${words[0]}**，如果有其他目标汉字，格式相同）。这非常关键，前台识字高亮全靠双星号匹配！
2. 故事的角色要可爱友好（比如：水滴宝宝、树叶精灵、小喵老师、山羊等），可以用温和的语气助词（比如：噢、喵、呀、呼呼等）。
3. 故事原文段落（story字段）长度要求在 150 到 250 个汉字之间，分成 2 到 3 个段落，排版整洁。
4. 返回的内容必须严格符合以下 JSON 数据格式（注意：不要在外面包含 markdown 代码块标签如 \`\`\`json，直接返回纯 JSON 对象字符串）：

输入要学习的词汇：${JSON.stringify(words)}

格式 schema：
{
  "title": "（绘本故事标题，比如：小水滴大冒险、大树跟太阳的悄悄话喵）",
  "story": "（精挑细选的儿童故事正文，汉字总数150~250字，里面要把目标字分别加上双星号加粗）",
  "theme": "（1句简单大方、积极好习惯的故事蕴含道理，比如：学会分享、多喝水不挑食、诚实勤劳等）",
  "goldenQuote": "（1句温暖柔和的安抚性哄睡或晚安耳边蜜语，字数在40字以内）"
}`;

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${dsApiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are a helpful API assistant that only responds in specified structured JSON format." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        })
      });

      if (response.ok) {
        const rawBody = await response.json() as any;
        const choices = rawBody.choices || [];
        if (choices.length > 0 && choices[0].message?.content) {
          const content = choices[0].message.content.trim();
          const parsed = JSON.parse(content);
          console.log("DeepSeek story generated successfully!");
          return res.json({
            title: parsed.title,
            story: parsed.story,
            theme: parsed.theme,
            goldenQuote: parsed.goldenQuote,
            isFallback: false
          });
        }
      } else {
        console.error(`DeepSeek API server returned non-200 status code: ${response.status}`);
      }
    } catch (dsError) {
      console.error("DeepSeek storytelling call failed, trying backup engines:", dsError);
    }
  }

  // 2. Try real Google GenAI Gemini calling if client exists
  if (ai) {
    try {
      const prompt = `你是一位专注 3-8 岁儿童语言启蒙、性格培养的温暖儿童绘本睡前小说大师，外号叫“小喵老师”。
请为宝宝编写一个童趣满满、发音清晰、富有智慧的识字伴读短故事。

要求：
1. 必须在故事中自然、不显做作地融入以下这几个宝宝正在学习的汉字，并用双星号将每一个目标汉字加粗强调（例如：**${words[0]}**，如果有其他目标汉字，格式相同）。这非常关键，前台识字高亮全靠双星号匹配！
2. 故事的角色要可爱友好（比如：水滴宝宝、树叶精灵、小喵老师、山羊等），可以用温和的语气助词（比如：噢、喵、呀、呼呼等）。
3. 故事原文段落（story字段）长度要求在 150 到 250 个汉字之间，分成 2 到 3 个段落，排版整洁。
4. 返回的内容必须严格符合以下 JSON 数据格式（注意：不要在外面包含 markdown 代码块标签如 \`\`\`json，直接返回纯 JSON 对象字符串）：

输入要学习的词汇：${JSON.stringify(words)}

格式 schema：
{
  "title": "（绘本故事标题，比如：小水滴大冒险、大树跟太阳的悄悄话喵）",
  "story": "（精挑细选的儿童故事正文，汉字总数150~250字，里面要把目标字分别加上双星号加粗）",
  "theme": "（1句简单大方、积极好习惯的故事蕴含道理，比如：学会分享、多喝水不挑食、诚实勤劳等）",
  "goldenQuote": "（1句温暖柔和的安抚性哄睡或晚安耳边蜜语，字数在40字以内）"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              story: { type: Type.STRING },
              theme: { type: Type.STRING },
              goldenQuote: { type: Type.STRING },
            },
            required: ["title", "story", "theme", "goldenQuote"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json({
          title: parsed.title,
          story: parsed.story,
          theme: parsed.theme,
          goldenQuote: parsed.goldenQuote,
          isFallback: false
        });
      }
    } catch (apiError) {
      console.error("Gemini storytelling call failed, deploying local child generator fallback:", apiError);
    }
  }

  // 3. Perform Intelligent Fallback Story Generator if AI fails or is absent
  console.log("Serving dynamic template matching story.");
  // Find a matching preconfigured template by intersection count
  let bestMatch = FALLBACK_STORIES[0];
  let maxIntersection = 0;

  for (const t of FALLBACK_STORIES) {
    const intersection = t.words.filter(w => words.includes(w)).length;
    if (intersection > maxIntersection) {
      maxIntersection = intersection;
      bestMatch = t;
    }
  }

  // Construct customized story by modifying the narrative to include parent-ordered characters if missing
  let customTitle = bestMatch.title;
  let customStory = bestMatch.story;
  let customTheme = bestMatch.theme;
  let customGoldenQuote = bestMatch.goldenQuote;

  // If there are words requested that are NOT in the template, let's craft a sweet general story combining all of them!
  const hasExternalWords = words.some(w => !bestMatch.words.includes(w));
  if (hasExternalWords || maxIntersection === 0) {
    const wordsFormatted = words.map(w => `**${w}**`).join("、");
    customTitle = `生字精灵 ${words.join("与")} 的金色派对 🎈`;
    customStory = `在很久很久以前的高高大山脚下，住着一群温暖充满爱心的生字精灵：${wordsFormatted}。他们每个人都有独特的金色技能！有的会在树叶里唱起歌，有的会在小仙女棒下吹出一阵阵微风。今天，他们快快乐乐地手拉着手，在碧蓝的草地上唱起了属于宝宝的童谣歌曲。小动物和森林树木都快乐地为他们鼓掌欢呼。小喵老师轻声念叨着：只要每天认真的识字打卡、掌握了 ${words.join("、")} 这些金牌汉字，宝宝就是整个王国里最爱学、最聪明的智慧领主哦喵！`;
    customTheme = `持之以恒，天天向前识字描红，让我们的语言世界更美好！`;
    customGoldenQuote = `宝贝把今天学会的生字精灵带进梦乡里守候你，闭上双眼，晚安好梦喵！`;
  }

  return res.json({
    title: customTitle,
    story: customStory,
    theme: customTheme,
    goldenQuote: customGoldenQuote,
    isFallback: true
  });
});

// POST /api/gemini/profile endpoint
app.post("/api/gemini/profile", async (req, res) => {
  const { word } = req.body;
  if (!word || typeof word !== "string" || word.length === 0) {
    return res.status(400).json({ error: "Missing character word parameter." });
  }

  // Draw first character only to be 100% safe
  const char = word.charAt(0);
  
  // Calculate raw pinyin using pinyin-pro as first draft
  let tonePinyin = "zì";
  try {
    tonePinyin = pinyin(char, { toneType: "symbol" }) || "zì";
  } catch (err) {
    // fallback
  }

  if (ai) {
    try {
      const prompt = `你是一位专注 3-8 岁儿童汉字文化启蒙的大师。
请为一个汉字【${char}】设计一套充满童趣、饱含温情、极易记忆的孩子识字卡片详情。

要求：
1. 精确标明汉语拼音并带声调（比如：啊 -> ā，服 -> fú，的 -> de）。
2. 提供这个字的简单常用概念/释义（如：山 -> 大山 / 山峰）。
3. 设计一个生动风趣、基于字形演变或图形联想的“字形演变故事”（pictograph），控制在 80-120 字之间，用温柔鼓励的语气并包含小喵老师的口吻。
4. 提供 2 个适合幼儿理解、积极阳光的“常用词组/配词”，并给出拼音及释义（如：生日、落日、日子）。
5. 选出 1 个最贴合本字含义的绘本风格 emoji（如：日 -> ☀️，猫 -> 🐱）。

返回的内容必须严格符合以下 JSON 格式：
{
  "pinyin": "（拼音）",
  "meaning": "（一个简短的1-4字核心释义词）",
  "pictograph": "（字形演变字谜小故事，80-120字左右）",
  "emoji": "（最匹配的绘本 emoji ）",
  "phrases": [
    { "word": "（配词1）", "pinyin": "（配词1拼音）", "meaning": "（适合幼儿理解的温情小解释）" },
    { "word": "（配词2）", "pinyin": "（配词2拼音）", "meaning": "（解说）" }
  ]
}

直接返回上面结构的纯 JSON 字符串（不要包装 markdown 代码块 \`\`\`json 标签）：`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pinyin: { type: Type.STRING },
              meaning: { type: Type.STRING },
              pictograph: { type: Type.STRING },
              emoji: { type: Type.STRING },
              phrases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    pinyin: { type: Type.STRING },
                    meaning: { type: Type.STRING }
                  },
                  required: ["word", "pinyin", "meaning"]
                }
              }
            },
            required: ["pinyin", "meaning", "pictograph", "emoji", "phrases"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json({
          ...parsed,
          word: char,
          isFallback: false
        });
      }
    } catch (apiError) {
      console.error(`Gemini profile failed for character ${char}:`, apiError);
    }
  }

  // Backup offline generation if Gemini is absent
  let computedPinyin = tonePinyin;
  let computedEmoji = "✍️";
  let computedMeaning = "我们新认识的生字精灵";
  let firstPhraseWord = `${char}儿`;
  let secondPhraseWord = `学习${char}`;

  return res.json({
    pinyin: computedPinyin,
    meaning: computedMeaning,
    pictograph: `大自然和古画中的神奇小汉字【${char}】。让我们认认真真、一笔一画写在红田字格里，把它收入宝宝的识字宝箱，和小喵老师一起大步探索它的奥秘吧！`,
    emoji: computedEmoji,
    phrases: [
      { word: firstPhraseWord, pinyin: `${computedPinyin} ér`, meaning: `一个带有“${char}”字的可爱日常词组` },
      { word: secondPhraseWord, pinyin: `xué xí ${computedPinyin}`, meaning: `和爸爸妈妈一起描红“${char}”字，非常快乐` }
    ],
    word: char,
    isFallback: true
  });
});

// Configure Vite as middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static file delivery active.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running and listening on http://localhost:${PORT}`);
  });
}

startServer();
