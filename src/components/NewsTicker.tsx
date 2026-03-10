'use client';

import { Trophy } from 'lucide-react';

const newsItems = [
    "全国中小学生信息技术创新与实践大赛 (NOC) 创客项目开始报名",
    "VEX 机器人亚洲公开赛即将拉开帷幕，本平台提供通用 3D 结构件设计支持",
    "全国青少年人工智能创新实践活动（教育部白名单赛事）作品提交流程发布",
    "宋工团队辅导学校在青少年科技创新大赛斩获一等奖，模型已开源至本站",
    "关于举办全国青年科普创新实验暨作品大赛（3D打印主题）的通知"
];

export default function NewsTicker() {
    return (
        <div className="w-full bg-primary/10 border-y border-primary/20 flex items-center h-12 overflow-hidden relative">
            <div className="absolute left-0 z-10 w-32 h-full bg-gradient-to-r from-background to-transparent flex items-center px-4">
                <span className="flex items-center gap-2 text-primary font-bold text-sm shrink-0 whitespace-nowrap">
                    <Trophy className="w-4 h-4" /> 赛事播报
                </span>
            </div>

            {/* 跑马灯实现 */}
            <div className="flex animate-[marquee_30s_linear_infinite] pl-32 hover:[animation-play-state:paused] cursor-pointer">
                {newsItems.concat(newsItems).map((news, index) => (
                    <span key={index} className="mx-8 text-sm text-foreground/80 whitespace-nowrap">
                        {news}
                    </span>
                ))}
            </div>
        </div>
    );
}
