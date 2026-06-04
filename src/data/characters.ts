import { Character, Category } from "../types";

export const CHARACTERS: Character[] = [];

export const CATEGORIES: Category[] = [
  {
    id: "nature",
    name: "奇妙大自然",
    color: "from-sky-400 to-blue-500",
    icon: "Sun",
    description: "大自然中的山川草木、风雨雷电"
  },
  {
    id: "animals",
    name: "可爱动物",
    color: "from-amber-400 to-orange-500",
    icon: "Bird",
    description: "和小小森林里的动物做朋友"
  },
  {
    id: "numbers",
    name: "数字方位",
    color: "from-emerald-400 to-teal-500",
    icon: "Hash",
    description: "数一数，量一量，分清上下左右"
  },
  {
    id: "body",
    name: "我的身体",
    color: "from-pink-400 to-rose-500",
    icon: "Hand",
    description: "认识我们神奇的五官和身体部位"
  },
  {
    id: "actions",
    name: "快乐动作",
    color: "from-purple-400 to-indigo-500",
    icon: "Activity",
    description: "跑跑跳跳，飞飞笑笑，真好玩"
  }
];

export const STICKERS = [
  { id: "star_kitty", emoji: "🐱✨", name: "闪耀小猫" },
  { id: "cool_dog", emoji: "🐶🕶️", name: "帅气汪汪" },
  { id: "super_rabbit", emoji: "🐰🚀", name: "太空飞兔" },
  { id: "smart_owl", emoji: "🦉🎓", name: "博学猫头鹰" },
  { id: "rainbow_unicorn", emoji: "🦄🌈", name: "彩虹独角兽" },
  { id: "gold_medal", emoji: "🥇🏆", name: "识字小达人" },
  { id: "king_lion", emoji: "🦁👑", name: "森林之王" },
  { id: "magic_dolphin", emoji: "🐬🔮", name: "魔法海豚" }
];

export const PRECOMPILED_LOOKUP_DICT: Character[] = [
  // NATURE (自然类)
  {
    id: "ri",
    word: "日",
    pinyin: "rì",
    meaning: "太阳",
    category: "nature",
    pictograph: "古人画出的太阳是一个圆圆的圈，中间点了一个小点。慢慢演变成了今天的“日”字，代表温暖的太阳和一天天的时间哦！",
    level: 1,
    emoji: "☀️",
    phrases: [
      { word: "生日", pinyin: "shēng rì", meaning: "每年过生命诞生的快乐日子" },
      { word: "落日", pinyin: "luò rì", meaning: "黄昏太阳红彤彤落山时的物像" },
      { word: "日子", pinyin: "rì zi", meaning: "一天一天的美妙时光" }
    ]
  },
  {
    id: "yue",
    word: "月",
    pinyin: "yuè",
    meaning: "月亮",
    category: "nature",
    pictograph: "月儿圆了又弯，弯了又圆。古人把经常看见的弯弯月牙画了下来，中间两横代表月光，就变成了可爱的“月”字啦！小朋友，晚上睡觉前跟月亮说晚安吧！",
    level: 1,
    emoji: "🌙",
    phrases: [
      { word: "月亮", pinyin: "yuè liang", meaning: "晚上在天空中发光的小伙伴" },
      { word: "月饼", pinyin: "yuè bǐng", meaning: "中秋节和爸爸妈妈一起吃的圆圆甜点" },
      { word: "月牙", pinyin: "yuè yá", meaning: "像弯弯小香蕉一样的可爱月亮" }
    ]
  },
  {
    id: "shui",
    word: "水",
    pinyin: "shuǐ",
    meaning: "水",
    category: "nature",
    pictograph: "中间一条弯弯的是流淌的溪流，两边抓取的波线是水流溅起的花线，这就是滋养万物的“水”字啦！",
    level: 1,
    emoji: "💧",
    phrases: [
      { word: "水果", pinyin: "shuǐ guǒ", meaning: "甘甜饱满、多汁美味的水果哦" },
      { word: "雨水", pinyin: "yǔ shuǐ", meaning: "从天空云朵里落下来的小水滴" },
      { word: "河水", pinyin: "hé shuǐ", meaning: "大河里奔流不停的水" }
    ]
  },
  {
    id: "huo",
    word: "火",
    pinyin: "huǒ",
    meaning: "火焰",
    category: "nature",
    pictograph: "两边跳起的小火星，中间是熊熊燃烧的大木柴，火焰升腾而起，组成了一个温暖跳动的“火”字。",
    level: 1,
    emoji: "🔥",
    phrases: [
      { word: "火车", pinyin: "huǒ chē", meaning: "呜呜叫、吐着黑烟的铁甲巨龙轨道车" },
      { word: "火山", pinyin: "huǒ shān", meaning: "会喷出红红熔岩和石头的大山" },
      { word: "火花", pinyin: "huǒ huā", meaning: "木柴燃烧时飞出来的小人星" }
    ]
  },
  {
    id: "shan",
    word: "山",
    pinyin: "shān",
    meaning: "大山",
    category: "nature",
    pictograph: "就像三座并排、连绵起伏的大山峰！中间那座山峰最高，两边的小山峰保护着它，真是雄伟的“山”字啊！",
    level: 1,
    emoji: "🏔️",
    phrases: [
      { word: "大山", pinyin: "dà shān", meaning: "高高大大的绿色石头巨人" },
      { word: "上山", pinyin: "shàng shān", meaning: "排排坐或者手拉手往高高的山顶爬去" },
      { word: "山羊", pinyin: "shān yáng", meaning: "长着胡子在山崖上快乐跳跃的羊咩咩" }
    ]
  },
  {
    id: "mu",
    word: "木",
    pinyin: "mù",
    meaning: "树木 / 木头",
    category: "nature",
    pictograph: "一棵大树立中间，一横代表向两边长出的树枝，一撇一捺是深入地下吸水的一双强壮根基，这就是“木”字。",
    level: 1,
    emoji: "🌳",
    phrases: [
      { word: "木头", pinyin: "mù tou", meaning: "树木砍下来后结实的手工材料" },
      { word: "积木", pinyin: "jī mù", meaning: "能够拼成城堡和飞船的彩色木块" },
      { word: "树木", pinyin: "shù mù", meaning: "森林里挨着绿意、高过树屋的大树" }
    ]
  },
  {
    id: "shi",
    word: "石",
    pinyin: "shí",
    meaning: "石头",
    category: "nature",
    pictograph: "左上面起横折代表峭壁，下面“口”字代表从峭壁或大山上掉落下来的方形小石块。硬邦邦的“石”字！",
    level: 2,
    emoji: "🪨",
    phrases: [
      { word: "石头", pinyin: "shí tou", meaning: "路边扁扁的、硬邦邦的小石头" },
      { word: "石板", pinyin: "shí bǎn", meaning: "用来铺平小路的大石片" },
      { word: "宝石", pinyin: "bǎo shí", meaning: "地底下亮晶晶、五彩斑斓的奇珍之石" }
    ]
  },
  {
    id: "yu",
    word: "雨",
    pinyin: "yǔ",
    meaning: "雨滴",
    category: "nature",
    pictograph: "最上面一横代表厚厚的云空，下面像一扇窗，里面有点点滴滴，正是从云团里落到地面的可爱雨滴哦！",
    level: 2,
    emoji: "🌧️",
    phrases: [
      { word: "下雨", pinyin: "xià yǔ", meaning: "乌云姐姐把雨水哗啦啦洒向大地" },
      { word: "雨伞", pinyin: "yǔ sǎn", meaning: "在雨天绽放的、保护我们不淋雨的五彩大蘑菇" },
      { word: "彩虹", pinyin: "cǎi hóng", meaning: "雨停了以后，太阳公公送给天空的七彩发箍" }
    ]
  },

  // ANIMALS (动物类)
  {
    id: "yu_ani",
    word: "鱼",
    pinyin: "yú",
    meaning: "小鱼",
    category: "animals",
    pictograph: "就像一条活蹦乱跳的小鱼！上面像三角状的鱼头，中间田字格是美丽的鱼鳞，底下像鱼尾分叉，是不是很像它在水里游？",
    level: 1,
    emoji: "🐟",
    phrases: [
      { word: "小鱼", pinyin: "xiǎo yú", meaning: "在水里吐泡泡、游来游去的小精灵" },
      { word: "金鱼", pinyin: "jīn yú", meaning: "长着大尾巴、红彤彤在鱼缸里玩耍的小鱼" },
      { word: "捉鱼", pinyin: "zhuō yú", meaning: "在清澈见底的小溪里抓逗嬉戏的小鱼" }
    ]
  },
  {
    id: "niao",
    word: "鸟",
    pinyin: "niǎo",
    meaning: "小鸟",
    category: "animals",
    pictograph: "画了一只站在树梢的飞鸟。上面的小尖角、中间圆圆的点是鸟儿明亮的眼睛，大弯勾是它圆鼓鼓的肚子和翘起的羽翼！",
    level: 1,
    emoji: "🐦",
    phrases: [
      { word: "小鸟", pinyin: "xiǎo niǎo", meaning: "清晨在窗外叫醒我们的歌唱家" },
      { word: "飞鸟", pinyin: "fēi niǎo", meaning: "展开翅膀飞向更高更蓝天空的小天使" },
      { word: "小鸟依人", pinyin: "xiǎo niǎo yī rén", meaning: "形容宝宝温柔可爱、依偎在妈妈怀抱的样子" }
    ]
  },
  {
    id: "ma",
    word: "马",
    pinyin: "mǎ",
    meaning: "奔跑的马儿",
    category: "animals",
    pictograph: "最顶部是马儿神气的鬃毛，大大的撇代表马儿健壮的躯干，底部的四个点代表马儿奔跑时的四个蹄子和飞扬的尾巴！",
    level: 2,
    emoji: "🐎",
    phrases: [
      { word: "小马", pinyin: "xiǎo mǎ", meaning: "在草原上哒哒哒奔跑的小马驹" },
      { word: "马路", pinyin: "mǎ lù", meaning: "宽宽的、以前跑马、现在开汽车的街道" },
      { word: "木马", pinyin: "mù mǎ", meaning: "游乐园里上下摇晃、载着我们笑声的木头玩具" }
    ]
  },
  {
    id: "niu",
    word: "牛",
    pinyin: "niú",
    meaning: "强壮的牛",
    category: "animals",
    pictograph: "最上面一撇一横代表牛儿弯弯的、指向天空的小牛角，中间一根直竖代表牛儿长长的脊梁，真是勤劳能干的“牛”字！",
    level: 1,
    emoji: "🐂",
    phrases: [
      { word: "牛奶", pinyin: "niú nǎi", meaning: "白白香香、喝了让我们长高高的牛奶" },
      { word: "小黄牛", pinyin: "xiǎo huáng niú", meaning: "在草地上吃青草、发出哞哞叫的壮壮牛" },
      { word: "牛气", pinyin: "niú qì", meaning: "形容小朋友特别棒、表现超棒！" }
    ]
  },
  {
    id: "yang",
    word: "羊",
    pinyin: "yáng",
    meaning: "可爱的小羊",
    category: "animals",
    pictograph: "最上面的一撇一捺是小山羊头上倒挂弯曲的大角，底下的三横是羊儿软软的毛，一竖是可爱小脸蛋的轮廓，简直就是小羊的肖像！",
    level: 1,
    emoji: "🐑",
    phrases: [
      { word: "山羊", pinyin: "shān yáng", meaning: "长着小胡子、在山坡跳跃的小山羊" },
      { word: "咩咩", pinyin: "miē miē", meaning: "形容小羊咩咩咩打招呼的声音" },
      { word: "羊毛衫", pinyin: "yáng máo shān", meaning: "冬天里，羊妈妈送给我们的超暖外套" }
    ]
  },
  {
    id: "tu",
    word: "兔",
    pinyin: "tù",
    meaning: "跳跃小兔",
    category: "animals",
    pictograph: "最像蹦蹦跳跳的小白兔！上面短撇是兔子的长耳朵，中间是圆肚子和短腿，右下角那一点是它像小果冻一样的短尾巴！",
    level: 2,
    emoji: "🐇",
    phrases: [
      { word: "兔子", pinyin: "tù zi", meaning: "红红眼睛、长耳朵、爱吃大胡萝卜的小家伙" },
      { word: "白兔", pinyin: "bái tù", meaning: "像一个大雪球一样、跳得很快的小白" },
      { word: "兔年", pinyin: "tù nián", meaning: "充满活力与快乐、蹦蹦跳跳的一年" }
    ]
  },

  // NUMBERS & DIRECTIONS (数字类)
  {
    id: "yi",
    word: "一",
    pinyin: "yī",
    meaning: "数字一",
    category: "numbers",
    pictograph: "就像我们伸出一根手指，或者在沙滩上轻轻画下的一条代表横木。这是一切数字的神奇起点！",
    level: 1,
    emoji: "1️⃣",
    phrases: [
      { word: "一二三", pinyin: "yī èr sān", meaning: "小不点数数的基本功" },
      { word: "一只", pinyin: "yī zhī", meaning: "孤单、但也自由快乐的一只小鸟" },
      { word: "一起", pinyin: "yī qǐ", meaning: "大家手拉手，高声喊：出发啦！" }
    ]
  },
  {
    id: "er",
    word: "二",
    pinyin: "èr",
    meaning: "数字二",
    category: "numbers",
    pictograph: "两条平列画下的横档，上面短代表天，上面长代表地，也是表示数量两个的意思，简简单单！",
    level: 1,
    emoji: "2️⃣",
    phrases: [
      { word: "两个", pinyin: "liǎng ge", meaning: "成双成对的两只小鞋子" },
      { word: "二氧化碳", pinyin: "èr yǎng huà tàn", meaning: "呼气时吐出来的、植物很喜欢的和气" },
      { word: "老二", pinyin: "lǎo èr", meaning: "排行在第二位的小弟弟或小妹妹" }
    ]
  },
  {
    id: "san",
    word: "三",
    pinyin: "sān",
    meaning: "数字三",
    category: "numbers",
    pictograph: "三条平行的木条，古人觉得“三”是个神奇的数字，一二三数下来，天地人三才都在这个美妙的“三”字里面啦！",
    level: 1,
    emoji: "3️⃣",
    phrases: [
      { word: "三轮车", pinyin: "sān lún chē", meaning: "长着三只大轮子、用力踩不摔倒的小脚踏车" },
      { word: "三明治", pinyin: "sān míng zhì", meaning: "两片面包包住中间烤火腿和蛋的美味三明治" },
      { word: "三好学生", pinyin: "sān hǎo xué shēng", meaning: "身体好、学习好、品德好的优秀小榜样" }
    ]
  },
  {
    id: "shang",
    word: "上",
    pinyin: "shàng",
    meaning: "向上 / 上面",
    category: "numbers",
    pictograph: "一根长长的横梁代表地面，竖直指向天，代表往高处、指向上面。代表高高的云端方向！",
    level: 1,
    emoji: "⬆️",
    phrases: [
      { word: "上午", pinyin: "shàng wǔ", meaning: "太阳公公红着脸冉冉升起、精神饱满的工作时间" },
      { word: "树上", pinyin: "shù shàng", meaning: "小鸟筑巢、红苹果挂在最高枝干的地方" },
      { word: "楼上", pinyin: "lóu shàng", meaning: "寄在我们头顶上、能听到快乐琴声的邻居家" }
    ]
  },
  {
    id: "xia",
    word: "下",
    pinyin: "xià",
    meaning: "向下 / 下面",
    category: "numbers",
    pictograph: "一横代表地面，垂直的竖折指向泥土和下面，代表往深处、往下面探索去！",
    level: 1,
    emoji: "⬇️",
    phrases: [
      { word: "下雨", pinyin: "xià yǔ", meaning: "乌云姐姐把雨水哗啦啦落向大地" },
      { word: "楼下", pinyin: "lóu xià", meaning: "一出门就能看见草地和小花狗的地方" },
      { word: "下午", pinyin: "xià wǔ", meaning: "太阳公公累了、在落山前的暖洋洋时光" }
    ]
  },

  // BODY (身体类)
  {
    id: "kou",
    word: "口",
    pinyin: "kǒu",
    meaning: "嘴巴",
    category: "body",
    pictograph: "就像一张张得大大的、方方的嘴巴！用来享受香甜的水果、喝水、唱歌和甜甜夸妈妈！",
    level: 1,
    emoji: "👄",
    phrases: [
      { word: "吃口", pinyin: "chī kǒu", meaning: "吃下一口香喷喷苹果，咬下一大口" },
      { word: "出口", pinyin: "chū kǒu", meaning: "嘴巴漏出的一点点温暖香气" },
      { word: "入口", pinyin: "rù kǒu", meaning: "通往新奇好玩游戏乐园的神秘密大门" }
    ]
  },
  {
    id: "shou",
    word: "手",
    pinyin: "shǒu",
    meaning: "小手",
    category: "body",
    pictograph: "就像伸出五根手指的小手掌！两边是小手指，中间是一条长长的直指。这是一双洗得白白的、能画画的“手”！",
    level: 1,
    emoji: "✋",
    phrases: [
      { word: "小手", pinyin: "xiǎo shǒu", meaning: "柔软得像五个香蕉棒一样、能画画的可爱手心" },
      { word: "手帕", pinyin: "shǒu pà", meaning: "折在口袋里的彩色魔法纸巾，帮我们擦汗洗手" },
      { word: "看手相", pinyin: "kàn shǒu xiàng", meaning: "展开手，看看手掌上有多少条好玩的生命线" }
    ]
  },
  {
    id: "er_body",
    word: "耳",
    pinyin: "ěr",
    meaning: "耳朵",
    category: "body",
    pictograph: "就像人耳朵的软轮廓！外面弯弯的是我们的小耳朵，里面的两条短横是里面的听小骨，帮我们听见小猫咪的喵喵声！",
    level: 2,
    emoji: "👂",
    phrases: [
      { word: "耳朵", pinyin: "ěr duo", meaning: "长在小脑袋两侧，一对爱听睡前故事的小喇叭" },
      { word: "耳机", pinyin: "ěr jī", meaning: "送出美妙音乐的“音乐防噪耳罩”" },
      { word: "耳聪目明", pinyin: "ěr cōng mù míng", meaning: "形容聪敏，声音听得清，花草看得明" }
    ]
  },
  {
    id: "mu_body",
    word: "目",
    pinyin: "mù",
    meaning: "眼睛",
    category: "body",
    pictograph: "古人的“目”是横着画的一个圆润眼睛，中间代表瞳孔。后来竖起来了，就变成了代表眼睛的“目”字。",
    level: 1,
    emoji: "👁️",
    phrases: [
      { word: "目光", pinyin: "mù guāng", meaning: "眼睛里流出的温柔彩色视线" },
      { word: "目的", pinyin: "mù dì", meaning: "我们决定奔跑向去的那个中心点" },
      { word: "瞩目", pinyin: "zhǔ mù", meaning: "特别大、特别新奇、一眼就能吸引视线的大宝贝" }
    ]
  },
  {
    id: "xin",
    word: "心",
    pinyin: "xīn",
    meaning: "心意 / 爱心",
    category: "body",
    pictograph: "画出跳动的心脏外形：底部是满满的心房腔，中间有几点是连接的血管和跳出生命力的小红心，暖洋洋的！",
    level: 2,
    emoji: "❤️",
    phrases: [
      { word: "爱心", pinyin: "ài xīn", meaning: "给受伤的小野雀包扎伤口时的超级温暖力量" },
      { word: "心爱", pinyin: "xīn ài", meaning: "睡觉时必须抱着、脏了也最喜欢的玩具" },
      { word: "开心", pinyin: "kāi xīn", meaning: "心里开出一大朵快乐的金色向日葵" }
    ]
  },

  // ACTIONS (动作类)
  {
    id: "da",
    word: "大",
    pinyin: "dà",
    meaning: "大",
    category: "actions",
    pictograph: "像一个张开双臂、双腿岔开、神气得不得了的小人。张得开开的，这就是巨大的“大”字！",
    level: 1,
    emoji: "🙋",
    phrases: [
      { word: "大人", pinyin: "dà rén", meaning: "身体高高、能抱起我们、去超市帮我们拿高处糖果的爸爸妈妈" },
      { word: "大西瓜", pinyin: "dà xī guā", meaning: "夏天绿油油的皮、一刀切开红彤彤、甜甜的多汁瓜" },
      { word: "大风", pinyin: "dà fēng", meaning: "把落叶吹得在空中跳芭蕾舞的大风呼呼" }
    ]
  },
  {
    id: "xiao",
    word: "小",
    pinyin: "xiǎo",
    meaning: "小",
    category: "actions",
    pictograph: "中间一条短短的直线，两边各切成一个小点，就像一粒小沙子被切得碎碎的，代表非常微小可爱的“小”哦！",
    level: 1,
    emoji: "🐤",
    phrases: [
      { word: "小白兔", pinyin: "xiǎo bái tù", meaning: "耳朵长长、尾巴短短的温和好伙伴" },
      { word: "小心", pinyin: "xiǎo xīn", meaning: "过马路时，像猫咪一样轻盈慢速" },
      { word: "小鸟", pinyin: "xiǎo niǎo", meaning: "棉花糖大小、只会叽叽叫的小歌唱家" }
    ]
  },
  {
    id: "fei",
    word: "飞",
    pinyin: "fēi",
    meaning: "飞翔",
    category: "actions",
    pictograph: "就像一只振翅高飞的小鸟！长长的羽翼张开，带上身体一飞冲天，飞到了厚厚的白云上面去了！",
    level: 2,
    emoji: "🕊️",
    phrases: [
      { word: "飞机", pinyin: "fēi jī", meaning: "长着大翅膀、在天空发出隆隆声的铁盒子" },
      { word: "起飞", pinyin: "qǐ fēi", meaning: "张开双臂向着春天的花海里奔跑飞升" },
      { word: "飞虫", pinyin: "fēi chóng", meaning: "在花丛中嗡嗡嗡忙着采集花粉的小蝴蝶" }
    ]
  },
  {
    id: "ku",
    word: "哭",
    pinyin: "kū",
    meaning: "哭泣",
    category: "actions",
    pictograph: "上面两个“口”好比两只圆滚滚的流泪眼睛，下面像个小人张大嘴哇哇大哭，泪珠滚落下了伤心的小眼泪。",
    level: 2,
    emoji: "😢",
    phrases: [
      { word: "哭脸", pinyin: "kū liǎn", meaning: "眼睛红红、嘴角像小委屈一模一样的难过表情" },
      { word: "大哭", pinyin: "dà kū", meaning: "哇哇大哭得天崩地裂、发泄不快乐的小核弹" },
      { word: "爱哭鬼", pinyin: "ài kū guǐ", meaning: "一碰就掉眼泪的小淘气，但一抱抱又立马变晴天" }
    ]
  },
  {
    id: "xiao_act",
    word: "笑",
    pinyin: "xiào",
    meaning: "大笑 / 微笑",
    category: "actions",
    pictograph: "最上面是青翠修长的“竹”字头，风一吹竹子就像弯弯眼眉一样摇摆，代表开心。下面是一个身体扭动、乐开怀的人。",
    level: 1,
    emoji: "😊",
    phrases: [
      { word: "哈哈大笑", pinyin: "hā hā dà xiào", meaning: "开心极了，嘴巴张得老大，肚子一颤一颤的声音" },
      { word: "微笑", pinyin: "wēi xiào", meaning: "嘴角轻轻往上一翘，像一弯月牙，最温柔的心意" },
      { word: "逗笑", pinyin: "dòu xiào", meaning: "爸爸刮一刮小鼻子，让我们忍不住咯咯咯笑的游戏" }
    ]
  },
  {
    id: "ren",
    word: "人",
    pinyin: "rén",
    meaning: "人类",
    category: "body", // Wait, let's copy from original category or matches body
    pictograph: "人：两撇头顶天立地，像人的双腿，支撑天地。",
    level: 1,
    emoji: "🧑",
    phrases: [
      { word: "大人", pinyin: "dà rén", meaning: "身体高大、能照顾我们的人" },
      { word: "好人", pinyin: "hǎo rén", meaning: "热心帮助别人、和善的好朋友" },
      { word: "人家", pinyin: "rén jia", meaning: "指其他人，或者宝宝温柔撒娇的语气" }
    ]
  },
  {
    id: "tu_soil",
    word: "土",
    pinyin: "tǔ",
    meaning: "泥土",
    category: "nature",
    pictograph: "土：一横一竖像泥土上钻出小嫩芽，下面代表大自然承载万物的泥土大床。",
    level: 1,
    emoji: "🌱",
    phrases: [
      { word: "土地", pinyin: "tǔ dì", meaning: "长出红苹果和金黄麦子的大地" },
      { word: "泥土", pinyin: "ní tǔ", meaning: "下雨天散发青草香气、软乎乎的土" },
      { word: "土星", pinyin: "tǔ xīng", meaning: "太空中戴着一个亮晶晶大光环的土黄大球" }
    ]
  },
  {
    id: "shi_num",
    word: "十",
    pinyin: "shí",
    meaning: "数字十",
    category: "numbers",
    pictograph: "十：一横代表东西，一竖代表南北，交叉组成十，代表十全十美、数量很多的意思！",
    level: 1,
    emoji: "🔟",
    phrases: [
      { word: "十个", pinyin: "shí gè", meaning: "十根手指，十个香甜的红苹果" },
      { word: "十分", pinyin: "shí fēn", meaning: "分外好，比如十分神气、十分快乐！" },
      { word: "十全十美", pinyin: "shí quán shí měi", meaning: "形容一件事做得很完美，挑不出缺点！" }
    ]
  }
];
