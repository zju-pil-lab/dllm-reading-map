# Contributing

感谢你帮助维护 dLLM Reading Map。我们欢迎新增论文、修正元数据、补充代码/模型链接，以及改进阅读路径。

## 收录范围

论文应当直接研究 diffusion / flow-based language modeling，或为理解该领域提供明确、必要的理论与系统背景。仅在视觉、语音或机器人动作上使用 diffusion，而语言模型本身仍为普通自回归模型的工作，通常不进入核心论文库。

## 新增论文

1. 先搜索标题和 canonical arXiv ID，确认没有重复。
2. 优先使用不带 `v1` / `v2` 的 arXiv abstract URL。
3. `published` 使用首次公开日期；`year` 可使用正式发表年份。
4. 每篇论文只有一个 `category`，但可以有多个 `tags`。
5. 不复制摘要。若进入 Essential，需写一条原创、具体的 `whyReadZh`。
6. 将记录加入 `data/curated-extras.json`，然后运行：

```bash
npm run validate:data
npm run lint
npm run build
```

## 分类判断

主类别优先回答“生成过程主要在哪个状态空间运行”：

- `discrete`：token、mask、categorical state 或 CTMC；
- `continuous`：token-level one-hot、bit 或 embedding 中的连续过程；
- `simplex`：simplex、sphere 或其他流形；
- `hybrid`：AR、离散与连续过程的组合或转换；
- `flow`：flow map、consistency 与 trajectory distillation；
- `latent`：contextual、segment、sentence、concept 或 thought latent；
- `systems` / `evaluation`：主要贡献是推理系统或评测分析；
- `foundations` / `precursors` / `multimodal` / `surveys`：背景与邻接材料。

不确定时，在 PR 中说明你的判断即可。

## PR 说明

请写明：论文为什么相关、选择该分类的理由、是否有官方代码或模型、元数据从哪里核对。维护者可能调整 tier 或 tags，以保持整个阅读地图一致。
