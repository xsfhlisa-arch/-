/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Download, Copy, Check, FileCode, Terminal, HelpCircle, X } from "lucide-react";

export default function WeChatExporter({ onClose }: { onClose?: () => void }) {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeFileTab, setActiveFileTab] = useState<string>("app.json");

  const miniprogramFiles: Record<string, { code: string; language: string; description: string }> = {
    "app.json": {
      language: "json",
      description: "小程序全局配置文件，定义页面路径和窗口主题颜色",
      code: `{
  "pages": [
    "pages/index/index"
  ],
  "window": {
    "navigationBarBackgroundColor": "#ff4d7d",
    "navigationBarTitleText": "乐学识字宝箱 (WeChat Lite)",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#f8fafc"
  },
  "sitemapLocation": "sitemap.json"
}`
    },
    "index.wxml": {
      language: "html",
      description: "主页面的 WXML 模板，完美对应小画箱、日历打卡界面",
      code: `<!-- pages/index/index.wxml -->
<view class="container">
  <!-- 顶部标题栏 -->
  <view class="header">
    <text class="header-title">乐学识字宝箱 🎒</text>
    <text class="header-subtitle">每天识字大冒险，收获满满成就卡！</text>
  </view>

  <!-- 识字数据统计看板 -->
  <view class="stats-card">
    <view class="stats-header">
      <text class="stars-icon">✨</text>
      <text class="stats-title">小主人快乐识字统计</text>
    </view>
    <view class="stats-row">
      <view class="stat-item" bindtap="goToTrophy">
        <text class="stat-label">熟字库 👉点击去字库</text>
        <text class="stat-value">{{unlockedCount}} 字</text>
      </view>
      <view class="stat-item" bindtap="goToChecklist">
        <text class="stat-label">准备学 👉点击去清单</text>
        <text class="stat-value">{{toBeLearnedCount}} 字</text>
      </view>
      <view class="stat-ratio bg-indigo">
        <text class="stat-label">总进度</text>
        <text class="stat-value">{{masteryRatio}}%</text>
      </view>
    </view>
  </view>

  <!-- 准备学写什么字 -->
  <view class="action-card">
    <text class="card-title">✍️ 宝宝准备学写什么字？</text>
    <view class="input-row">
      <input class="word-input" placeholder="输入想要临摹的汉字(如：天、日)" value="{{inputWord}}" bindinput="onWordInput" />
      <button class="join-btn" bindtap="onJoinAndLearn">加入并学习</button>
    </view>
    <text class="card-tips">💡 如果宝宝已经学会该字，将提示哪天学过；若是新汉字，则加入学字计划并直接跳转去练习写字！</text>
  </view>

  <!-- 日历打卡组件 -->
  <view class="calendar-card">
    <view class="calendar-header">
      <text class="calendar-title">📅 识字成果打卡日历</text>
      <picker mode="date" value="{{selectedDate}}" bindchange="onDatePickerChange">
        <view class="date-picker-btn">{{selectedDate}} 🔽</view>
      </picker>
    </view>
    
    <view class="weekday-row">
      <block wx:for="{{weekDays}}" wx:key="dateStr">
        <view class="weekday-item {{item.dateStr === selectedDate ? 'active' : ''}}" data-date="{{item.dateStr}}" bindtap="onSelectDate">
          <text class="week-label">{{item.label}}</text>
          <text class="day-num">{{item.dayNum}}</text>
          <view class="dot" wx:if="{{item.hasLearned}}"></view>
        </view>
      </block>
    </view>

    <!-- 日历学习字详情 -->
    <view class="learned-detail">
      <text class="detail-label">📙 在 【{{selectedDate}}】 学会的汉字：{{learnedOnDateList.length}} 个字</text>
      <view class="capsules-row">
        <block wx:for="{{learnedOnDateList}}" wx:key="*this">
          <view class="capsule">{{item}}</view>
        </block>
        <text class="empty-tips" wx:if="{{learnedOnDateList.length === 0}}">今天学箱里空空空，快带宝宝学一个字打卡吧~</text>
      </view>
    </view>
  </view>
</view>`
    },
    "index.js": {
      language: "javascript",
      description: "主逻辑 JS，处理 localStorage 数据，以及播放声音和日历动态星期的计算",
      code: `// pages/index/index.js
Page({
  data: {
    inputWord: '',
    selectedDate: '2026-06-04',
    stars: 45,
    streak: 3,
    // 固定的演示学字清单和熟字日期对照表
    unlockedDates: {
      '一': '2026-06-01',
      '二': '2026-06-01',
      '十': '2026-06-01',
      '人': '2026-06-02',
      '木': '2026-06-02',
      '土': '2026-06-02',
      '山': '2026-06-03',
      '上': '2026-06-03',
      '口': '2026-06-04'
    },
    toBeLearnedList: ['日', '水', '火', '月', '手'],
    weekDays: [],
    learnedOnDateList: []
  },

  onLoad() {
    this.initWeekAndLearned();
  },

  // 动态计算当前选中日期的该星期周期
  initWeekAndLearned() {
    const selected = this.data.selectedDate;
    const weekDays = this.getWeekDates(selected);
    const unlockedDates = this.data.unlockedDates;

    // 绑定下方的成就汉字列表
    const learnedOnDateList = [];
    for (let char in unlockedDates) {
      if (unlockedDates[char] === selected) {
        learnedOnDateList.push(char);
      }
    }

    // 绘制小圆点
    const updatedWeekdays = weekDays.map(item => {
      let dailyCount = 0;
      for (let char in unlockedDates) {
        if (unlockedDates[char] === item.dateStr) {
          dailyCount++;
        }
      }
      return {
        ...item,
        hasLearned: dailyCount > 0
      };
    });

    const unlockedCount = Object.keys(unlockedDates).length;
    const totalCount = 32; // 总库参考

    this.setData({
      weekDays: updatedWeekdays,
      learnedOnDateList: learnedOnDateList,
      unlockedCount: unlockedCount,
      toBeLearnedCount: this.data.toBeLearnedList.length,
      masteryRatio: Math.round((unlockedCount / totalCount) * 100)
    });
  },

  getWeekDates(dateString) {
    const date = new Date(dateString);
    const day = date.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    
    const weekList = [];
    const daysName = ["周一", "周二", "周三", "周四", "周五"];
    for (let i = 0 ; i < 5; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      weekList.push({
        label: daysName[i],
        dateStr: yyyy + '-' + mm + '-' + dd,
        dayNum: dd
      });
    }
    return weekList;
  },

  onWordInput(e) {
    this.setData({ inputWord: e.detail.value.trim() });
  },

  onJoinAndLearn() {
    const word = this.data.inputWord;
    if (!word) {
      wx.showToast({ title: '请输入汉字哦！', icon: 'none' });
      return;
    }

    const { unlockedDates, toBeLearnedList } = this.data;
    
    // 1. 判断是否已学会
    if (unlockedDates[word]) {
      wx.showModal({
        title: '已掌握这个字啦 ☀️',
        content: '宝宝在 【' + unlockedDates[word] + '】 这一天就已经学会了“' + word + '”字，快带宝宝复习巩固吧！',
        showCancel: false
      });
      this.setData({ inputWord: '' });
      return;
    }

    // 2. 加入并跳去写字
    if (!toBeLearnedList.includes(word)) {
      toBeLearnedList.push(word);
    }
    
    this.setData({
      toBeLearnedList: toBeLearnedList,
      inputWord: ''
    });

    this.initWeekAndLearned();

    wx.showToast({
      title: '已加入准备学清单！',
      icon: 'success'
    });
  },

  onDatePickerChange(e) {
    this.setData({ selectedDate: e.detail.value });
    this.initWeekAndLearned();
  },

  onSelectDate(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({ selectedDate: date });
    this.initWeekAndLearned();
  }
})`
    },
    "index.wxss": {
      language: "css",
      description: "页面排版 WXSS，包含可爱的粉色渐变与圆角物理阴影",
      code: `/* pages/index/index.wxss */
page {
  background-color: #fcf9f7;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  padding-bottom: 40rpx;
}

.container {
  padding: 24rpx;
}

.header {
  background: linear-gradient(135deg, #ff5e89, #ff715a);
  padding: 40rpx 30rpx;
  border-radius: 0 0 40rpx 40rpx;
  color: #fff;
  margin: -24rpx -24rpx 30rpx -24rpx;
}

.header-title {
  font-size: 42rpx;
  font-weight: 800;
  display: block;
}

.header-subtitle {
  font-size: 24rpx;
  opacity: 0.9;
  margin-top: 8rpx;
  display: block;
}

.stats-card {
  background-color: #ffeff3;
  border-radius: 32rpx;
  padding: 30rpx;
  border: 4rpx solid #ffd4df;
  margin-bottom: 30rpx;
}

.stats-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.stars-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.stats-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #c92f55;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.stat-item {
  flex: 1;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 8rpx rgba(197, 34, 75, 0.05);
}

.stat-ratio {
  flex: 1;
  border-radius: 24rpx;
  padding: 20rpx;
  text-align: center;
  color: #fff;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
}

.stat-label {
  font-size: 20rpx;
  color: #a8556a;
  display: block;
  font-weight: bold;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 900;
  display: block;
  margin-top: 10rpx;
  color: #e11d48;
}

.stat-ratio .stat-label {
  color: #c7d2fe;
}

.stat-ratio .stat-value {
  color: #ffffff;
}

.action-card {
  background-color: #fff;
  border-radius: 32rpx;
  padding: 30rpx;
  border: 2rpx solid #ffebea;
  margin-bottom: 30rpx;
}

.card-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #bd6c12;
  margin-bottom: 16rpx;
  display: block;
}

.input-row {
  display: flex;
  gap: 16rpx;
}

.word-input {
  flex: 1;
  height: 80rpx;
  border: 2rpx solid #ffdedc;
  border-radius: 20rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
  background-color: #fff9f9;
}

.join-btn {
  background-color: #ff4d7d;
  color: white;
  font-weight: bold;
  font-size: 26rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 20rpx;
  padding: 0 30rpx;
}

.card-tips {
  font-size: 20rpx;
  color: #a1a1a1;
  margin-top: 12rpx;
  display: block;
  line-height: 1.4;
}

.calendar-card {
  background-color: #fff;
  border-radius: 32rpx;
  padding: 30rpx;
  border: 2rpx solid #f1f3f7;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.calendar-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #1e293b;
}

.date-picker-btn {
  font-size: 24rpx;
  background-color: #fff1f2;
  color: #ff4d7d;
  font-weight: bold;
  padding: 8rpx 20rpx;
  border-radius: 100rpx;
}

.weekday-row {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
}

.weekday-item {
  flex: 1;
  background-color: #f8fafc;
  border-radius: 20rpx;
  padding: 16rpx 10rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.weekday-item.active {
  background-color: #ff4d7d;
  color: #ffffff !important;
}

.weekday-item.active .week-label {
  color: #ffe4ec;
}

.weekday-item.active .day-num {
  color: #ffffff;
}

.week-label {
  font-size: 20rpx;
  color: #64748b;
  font-weight: bold;
}

.day-num {
  font-size: 28rpx;
  font-weight: 800;
  margin-top: 8rpx;
  color: #1e293b;
}

.dot {
  width: 10rpx;
  height: 10rpx;
  background-color: #e11d48;
  border-radius: 50%;
  margin-top: 8rpx;
}

.learned-detail {
  margin-top: 30rpx;
  border-top: 2rpx dashed #f1f5f9;
  padding-top: 30rpx;
}

.detail-label {
  font-size: 24rpx;
  font-weight: bold;
  color: #475569;
  display: block;
}

.capsules-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}

.capsule {
  background-color: #f1f5f9;
  border-radius: 100rpx;
  font-size: 24rpx;
  font-weight: bold;
  color: #1e293b;
  padding: 12rpx 36rpx;
  border: 1rpx solid #e2e8f0;
}

.empty-tips {
  font-size: 22rpx;
  color: #94a3b8;
  font-weight: 500;
}
`
    }
  };

  const copyToClipboard = (fileName: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(fileName);
    setTimeout(() => {
      setCopiedFile(null);
    }, 2000);
  };

  const triggerDownload = (fileName: string, text: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAllAsBatch = () => {
    Object.entries(miniprogramFiles).forEach(([fileName, item]) => {
      triggerDownload(fileName, item.code);
    });
  };

  const renderingContent = (
    <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-3xl p-5 border border-indigo-100 shadow-sm text-left" id="wechat-exporter-root">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-100/50 pb-4 mb-4">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-1.5 leading-tight">
              <Terminal size={14} className="text-pink-500 animate-pulse" />
              微信小程序代码一键生成
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 cursor-pointer transition mb-1"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">
            直接复制代码或点击下载，可在《微信开发者工具》内无缝导入并预览体验！
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadAllAsBatch}
            className="flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs font-extrabold shadow shadow-pink-200 cursor-pointer transition active:scale-95 text-[10px]"
            id="btn-download-wechat-project"
          >
            <Download size={12} />
            下载全部源码 (4个文件)
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="hidden md:flex w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 items-center justify-center text-slate-500 hover:text-slate-700 cursor-pointer transition"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Navigation file tabs */}
        <div className="md:col-span-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0" id="wechat-files-list">
          {Object.keys(miniprogramFiles).map((fileName) => (
            <button
              key={fileName}
              onClick={() => setActiveFileTab(fileName)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left cursor-pointer transition whitespace-nowrap md:whitespace-normal w-full border ${
                activeFileTab === fileName
                  ? "bg-slate-800 border-slate-800 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FileCode size={13} className={activeFileTab === fileName ? "text-pink-400" : "text-gray-400"} />
              {fileName}
            </button>
          ))}
        </div>

        {/* Selected file preview and description */}
        <div className="md:col-span-9 flex flex-col bg-white rounded-2xl border border-indigo-50 overflow-hidden shadow-inner">
          <div className="bg-slate-50 px-4 py-2 flex items-center justify-between border-b border-indigo-50 shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] font-black font-mono text-slate-800">{activeFileTab}</span>
              <span className="text-[9px] text-slate-400 font-medium">{miniprogramFiles[activeFileTab].description}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(activeFileTab, miniprogramFiles[activeFileTab].code)}
                className="flex items-center gap-1.5 px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 rounded-lg cursor-pointer transition"
              >
                {copiedFile === activeFileTab ? (
                  <>
                    <Check size={11} className="text-emerald-500" />
                    <span className="text-emerald-600 font-black">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>复制代码</span>
                  </>
                )}
              </button>

              <button
                onClick={() => triggerDownload(activeFileTab, miniprogramFiles[activeFileTab].code)}
                className="flex items-center gap-1 px-1.5 py-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer transition"
                title="单独下载此文件"
              >
                <Download size={12} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-3.5 overflow-auto max-h-[220px] font-mono text-[10px] bg-slate-900 border-t border-slate-800">
            <pre className="text-slate-200 text-[10px] leading-relaxed whitespace-pre-wrap select-all">
              {miniprogramFiles[activeFileTab].code}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-3 bg-indigo-50/50 border border-indigo-100/50 p-3 rounded-2xl flex items-start gap-2.5">
        <HelpCircle size={15} className="text-indigo-600 mt-0.5 shrink-0" />
        <div>
          <h4 className="text-[10px] font-black text-indigo-900">💡 微信开发者工具 3步导入教程：</h4>
          <ol className="text-[10px] text-indigo-950 font-medium leading-relaxed list-decimal pl-4 mt-1 space-y-0.5">
            <li>打开《微信开发者工具》，选择新建小程序项目，项目名称输入 <strong>乐学识字宝箱</strong>。</li>
            <li>将上面下载的四个核心文件，分别放入您工程目录中（覆盖对应的 <strong>app.json</strong> 以及 <strong>pages/index/</strong> 下的三个文件）。</li>
            <li>开发者工具将自动编译运行，即刻看到和本系统一模一样的移动端识字日历打卡体验！</li>
          </ol>
        </div>
      </div>
    </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl p-1 relative">
          {renderingContent}
        </div>
      </div>
    );
  }

  return renderingContent;
}
