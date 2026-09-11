import sanderReferences from '@/data/sander-2026.json';
import curatedExtras from '@/data/curated-extras.json';

export type PaperTier = 'essential' | 'recommended' | 'frontier' | 'context';

export type Paper = {
  id: string;
  sourceKey?: string;
  sourceIndex?: number;
  title: string;
  authors: string[];
  year: number;
  published: string;
  venue: string;
  url: string;
  category: string;
  tags: string[];
  tier: PaperTier;
  essentialOrder: number | null;
  whyReadZh: string | null;
  sourceCollections: string[];
  lastVerified: string;
};

export type Category = {
  id: string;
  label: string;
  zh: string;
  description: string;
  formula: string;
};

export const categories: Category[] = [
  {
    id: 'foundations',
    label: 'Foundations',
    zh: '基础理论',
    description: 'Transformer、VAE、score / flow 与连续时间生成基础。',
    formula: 'score · SDE · flow',
  },
  {
    id: 'precursors',
    label: 'NAR precursors',
    zh: '非自回归前史',
    description: '并行解码、任意序生成与迭代精炼的语言建模前史。',
    formula: 'parallel · refine',
  },
  {
    id: 'discrete',
    label: 'Discrete',
    zh: '离散与掩码扩散',
    description: '直接在 token 状态上进行 multinomial、masked 或 CTMC 扩散。',
    formula: 'xₜ ∈ 𝒱ᴸ',
  },
  {
    id: 'continuous',
    label: 'Continuous',
    zh: '连续 Token 扩散',
    description: '在 one-hot、bit 或 token embedding 空间中加入连续噪声。',
    formula: 'zₜ ∈ ℝᴸˣᵈ',
  },
  {
    id: 'simplex',
    label: 'Manifolds',
    zh: '单纯形与流形',
    description: '在概率单纯形、球面或超球面上定义扩散与 flow。',
    formula: 'zₜ ∈ Δⱽ⁻¹ / 𝕊ᵈ',
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    zh: '混合范式',
    description: '组合 AR、离散与连续过程，包括 block diffusion 与模型转换。',
    formula: 'AR ↔ DLM',
  },
  {
    id: 'flow',
    label: 'Flow maps',
    zh: '流映射与蒸馏',
    description: '用 flow maps、consistency 与蒸馏压缩生成轨迹。',
    formula: 'many steps → few',
  },
  {
    id: 'latent',
    label: 'Latent',
    zh: '潜空间与层级表示',
    description: '在 contextual、segment、sentence 或 thought latent 上生成。',
    formula: 'token → concept',
  },
  {
    id: 'systems',
    label: 'Systems',
    zh: '推理与系统',
    description: '采样、缓存、speculative decoding、并行推理与开放框架。',
    formula: 'latency ↓ throughput ↑',
  },
  {
    id: 'agents',
    label: 'Agentic dLLMs',
    zh: '智能体与工具使用',
    description: '研究 dLLM 作为智能体骨干、规划器或世界模型时的多轮决策、工具调用与交互效率。',
    formula: 'plan ↔ act ↔ observe',
  },
  {
    id: 'evaluation',
    label: 'Evaluation',
    zh: '评测与规模化',
    description: '训练效率、scaling、quality–diversity 与公平比较。',
    formula: 'quality × cost',
  },
  {
    id: 'multimodal',
    label: 'Multimodal',
    zh: '多模态邻接工作',
    description: '连接语言 token 与连续感知表示的相邻研究路线。',
    formula: 'text ↔ perception',
  },
  {
    id: 'surveys',
    label: 'Surveys',
    zh: '综述与导读',
    description: '建立全局视角、术语表与开放问题的入口材料。',
    formula: 'map the field',
  },
];

export const categoryById = Object.fromEntries(
  categories.map((category) => [category.id, category]),
) as Record<string, Category>;

export const papers = [...sanderReferences, ...curatedExtras] as Paper[];

export const essentialPapers = papers
  .filter((paper) => paper.essentialOrder !== null)
  .sort((a, b) => (a.essentialOrder ?? 99) - (b.essentialOrder ?? 99));

export const latestPapers = [...papers]
  .filter((paper) => paper.published.includes('-'))
  .sort((a, b) => b.published.localeCompare(a.published))
  .slice(0, 6);

export function formatAuthors(authors: string[], limit = 4) {
  if (authors.length <= limit) return authors.join(', ');
  return `${authors.slice(0, limit).join(', ')} +${authors.length - limit}`;
}
