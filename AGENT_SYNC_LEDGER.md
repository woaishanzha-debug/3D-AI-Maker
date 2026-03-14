# 🤖 3D AI Maker - Agent Sync Ledger (智能体协同账本)

> **⚠️ 警告 (WARNING)**: 
> 本文档是 Gemini、Antigravity 与 Jules 协作的绝对基准线。
> Jules 在执行完任何《执行蓝图》后，**必须**更新此文档的 `Last Executed Task` 和 `System State` 才能算作完工。Antigravity 严禁私自篡改此文档。

## 1. 当前系统基线 (Current System State)
* **Latest Stable Branch:** `main` (已完成三端异步大一统)
* **Core Working Features:** - 非遗贝塞尔曲线底板生成 (Mashao_Base)
  - Twin-Track 对称实体画笔与越界物理裁切
  - 动态教学目标打钩联动 (Quest Progress)
  - 纯前端 3MF 物理导出 (已重构为通用配置对象导出方式，支持跨 16 课程)
  - Generic Course Event Bus 演进蓝图建立
  - Shadow Puppetry (皮影) 课程中的离散部件 Z 轴 3MF 正确导出及自动推进
* **Pending / Next Big Feature:** AI 风格迁移与提示词引擎 (Route C)

## 2. 最近执行记录 (Last Executed Task)
* **Date:** 2026-03-14
* **Task:** 【同步完成】修复皮影工具的两大致命 Bug：① 切割溢出（约束至绘图轨迹）；② 残影遗留（核弹级图层清理与实心联合算法）。
* **Executed By:** Jules (Cloud Execution) & Antigravity (Local Sync)
* **Status:** 已同步至本地，完成了对切割算法（executeSlash）与描摹清理（traceImage）的二次修正。
* **Verification Trace:** 7376962165335111163

## 3. 架构师禁区与已知隐患 (Architect's Redlines & Known Issues)
* **Redline 1:** `svgTo3mfConverter.ts` 的输入 `config.baseLayerId` 必须与前端生成时的底板层级名称精确一致（旧为 `Mashao_Base`），禁止非法名称导致 3MF 模型缺失或变形。对于皮影需要使用 `isDiscreteMode` 参数并保持特定的 `name` 标记。
* **Redline 2:** Antigravity 严禁直接推送 `main` 分支，必须通过本地 PR 或唤醒 Jules 远端操作。
* **Known Issue 1:** 暂无阻断性 Bug，等待 AI 接口接入。
