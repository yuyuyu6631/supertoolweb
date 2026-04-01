# 演示视频生产工作流

这是一个把“系统自动演示录制 + FFmpeg 成片整理”固化下来的标准工作流。

适用场景：
- 需要为当前系统生成可重复录制的演示视频
- 需要把 Playwright 录屏、演示文案、字幕时间轴、成片输出串成固定流程
- 需要让后续 AI 或人工按同一口径重复执行

本工作流的核心产物：
- 一份原始自动录屏
- 一份成片视频
- 一份演示文案
- 一份字幕时间轴与录制清单

建议执行顺序：
1. 先读 [WORKFLOW.md](./WORKFLOW.md)
2. 执行前对照 [CHECKLIST.md](./CHECKLIST.md)
3. 需要复用时直接使用 [PROMPT_TEMPLATE.md](./PROMPT_TEMPLATE.md)
4. 本地执行入口使用 [run.ps1](./run.ps1)
5. 完成后按 [OUTPUT_TEMPLATE.md](./OUTPUT_TEMPLATE.md) 汇报
