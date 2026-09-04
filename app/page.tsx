import PaperExplorer from '@/components/paper-explorer';
import {
  categories,
  categoryById,
  essentialPapers,
  formatAuthors,
  latestPapers,
  papers,
} from '@/lib/papers';

const coreCategoryIds = ['discrete', 'continuous', 'hybrid', 'flow', 'latent', 'systems'];

export default function Home() {
  const coreCategories = coreCategoryIds.map((id) => categoryById[id]);

  return (
    <main>
      <nav className="site-nav" aria-label="主导航">
        <a className="wordmark" href="#top" aria-label="dLLM Reading Map 首页">
          <span className="wordmark-mark" aria-hidden="true" />
          dLLM / reading map
        </a>
        <div className="nav-links">
          <a href="#start">从这里开始</a>
          <a href="#map">方法地图</a>
          <a href="#library">论文库</a>
          <a href="#updates">如何更新</a>
        </div>
        <a className="nav-github" href="#contribute">Open source ↗</a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> A FIELD GUIDE · SEP 2026</p>
          <h1>
            从 <em>Mask</em> 到 <em>Flow</em>，<br />
            读懂扩散语言模型。
          </h1>
          <p className="hero-deck">
            为学生与研究者整理的开放阅读地图。沿着方法脉络学习，
            用时间线追踪变化，而不是在一张越来越长的论文清单里迷路。
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#start">从 12 篇开始 <span>→</span></a>
            <a className="button button-secondary" href="#library">浏览全部论文</a>
          </div>
        </div>

        <div className="denoise-card" aria-label="Token 去噪过程示意">
          <div className="denoise-head">
            <span>DENOISING TRACE</span><span>t ↓</span>
          </div>
          <div className="trace-row trace-muted"><span>1.00</span><code>[MASK] [MASK] [MASK] [MASK]</code></div>
          <div className="trace-row"><span>0.67</span><code>diffusion [MASK] models [MASK]</code></div>
          <div className="trace-row"><span>0.33</span><code>diffusion language models [MASK]</code></div>
          <div className="trace-row trace-final"><span>0.00</span><code>all tokens, together.</code></div>
          <div className="noise-field" aria-hidden="true" />
          <p className="trace-caption">A tiny visual intuition — not a sampler specification.</p>
        </div>
      </section>

      <section className="stats" aria-label="论文库概况">
        <div><strong>{papers.length}</strong><span>篇精选论文<br />单一数据源</span></div>
        <div><strong>81/81</strong><span>Sander 博客<br />参考文献已收录</span></div>
        <div><strong>{categories.length}</strong><span>研究方向<br />交叉索引</span></div>
        <div className="stats-note"><span className="status-dot" />VERIFIED<br />2026.09.04</div>
      </section>

      <section className="section path-section" id="start">
        <div className="section-heading sticky-heading">
          <p className="eyebrow"><span /> START HERE</p>
          <h2>一条可完成的<br />阅读路径。</h2>
          <p>先读 12 篇主干论文，理解范式怎样从离散扩散走向大模型、混合架构与 flow maps，再按自己的问题深入。</p>
          <div className="scope-note">
            <span>SCOPE</span>
            <p><b>必读</b>建立主干；<b>推荐</b>补齐分支；<b>前沿</b>追踪新进展；<b>背景</b>提供必要上下文。</p>
          </div>
        </div>
        <div className="paper-list">
          {essentialPapers.map((paper) => (
            <article className="paper-row" key={paper.id}>
              <span className="paper-index">{String(paper.essentialOrder).padStart(2, '0')}</span>
              <div>
                <p className="paper-year">{paper.year} · {categoryById[paper.category]?.label}</p>
                <h3><a href={paper.url} target="_blank" rel="noreferrer">{paper.title}</a></h3>
                <p>{paper.whyReadZh}</p>
              </div>
              <a href={paper.url} target="_blank" rel="noreferrer" aria-label={`打开论文：${paper.title}`}>↗</a>
            </article>
          ))}
          <a className="view-all" href="#library">完成主干后，进入完整论文库 <span>{papers.length} papers</span><b>→</b></a>
        </div>
      </section>

      <section className="latest-section" aria-labelledby="latest-title">
        <div className="latest-intro">
          <p className="eyebrow"><span /> LATEST VERIFIED</p>
          <h2 id="latest-title">最近加入</h2>
          <p>“最新”按论文首次公开日期排序，避免旧论文因新版修订重新跳到榜首。</p>
        </div>
        <div className="latest-grid">
          {latestPapers.map((paper, index) => (
            <article className="latest-card" key={paper.id}>
              <div className="latest-meta">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <time dateTime={paper.published}>{paper.published}</time>
              </div>
              <p className="latest-category">{categoryById[paper.category]?.zh}</p>
              <h3><a href={paper.url} target="_blank" rel="noreferrer">{paper.title}</a></h3>
              <p>{formatAuthors(paper.authors, 3)}</p>
              <a className="latest-link" href={paper.url} target="_blank" rel="noreferrer" aria-label={`打开论文：${paper.title}`}>Paper ↗</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section map-section" id="map">
        <div className="section-heading">
          <p className="eyebrow"><span /> BROWSE BY FAMILY</p>
          <h2>类别是主地图，<br />时间是过滤器。</h2>
          <p>主类别只回答一个稳定问题：生成过程主要在哪种状态空间运行？训练阶段、目标函数、能力与系统技巧则作为标签。</p>
        </div>
        <div className="family-grid">
          {coreCategories.map((category, index) => {
            const count = papers.filter((paper) => paper.category === category.id).length;
            return (
              <a className="family-card" href={`#library`} key={category.id}>
                <span className="family-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="family-label">{category.label}</span>
                <h3>{category.zh}</h3>
                <p>{category.description}</p>
                <div className="family-foot"><code>{category.formula}</code><span>{count} papers ↘</span></div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="catalog-section" id="library">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow"><span /> THE LIBRARY</p>
            <h2>全部论文</h2>
          </div>
          <p>按标题、作者或标签搜索；按类别与阅读层级过滤。每条记录链接到论文的一手页面。</p>
        </div>
        <PaperExplorer papers={papers} />
      </section>

      <section className="update-section" id="updates">
        <div className="update-lead">
          <p className="eyebrow"><span /> LIVING COLLECTION</p>
          <h2>让更新成为流程，<br />而不是记忆。</h2>
        </div>
        <div className="update-steps">
          <article><span>01 / DISCOVER</span><h3>每周发现</h3><p>按 dLLM、masked diffusion、flow map、block diffusion 等关键词检索 arXiv 候选。</p></article>
          <article><span>02 / REVIEW</span><h3>人工审核</h3><p>自动化只创建候选清单；相关性、主分类和“为什么值得读”由实验室成员确认。</p></article>
          <article><span>03 / PUBLISH</span><h3>合并即发布</h3><p>数据校验、去重与构建检查通过后，网页自动更新；用 first-posted 日期维护 Latest。</p></article>
        </div>
      </section>

      <section className="source-section" id="contribute">
        <div>
          <p className="eyebrow"><span /> SOURCES & CREDIT</p>
          <h2>开放，但不失去出处。</h2>
        </div>
        <div className="source-list">
          <a href="https://sander.ai/2026/08/24/continuous-dlms.html?v=1" target="_blank" rel="noreferrer">
            <span>01</span><div><b>Sander Dieleman · Continuous diffusion language models</b><p>完整导入其 81 条参考文献，并保留原始编号。</p></div><i>↗</i>
          </a>
          <a href="https://github.com/AIDASLab/Awesome-Diffusion-LLM" target="_blank" rel="noreferrer">
            <span>02</span><div><b>AIDASLab · Awesome-Diffusion-LLM</b><p>作为领域 watchlist 与交叉核查来源；本站分类、数据与中文导读独立整理。</p></div><i>↗</i>
          </a>
          <div className="source-item">
            <span>03</span><div><b>Primary records · arXiv / proceedings</b><p>标题、作者、首次公开日期和链接以一手论文页面为准。</p></div><i>✓</i>
          </div>
        </div>
      </section>

      <footer>
        <div><span className="wordmark-mark" />dLLM / READING MAP</div>
        <p>OPEN, CURATED, BUILT FOR LEARNING.</p>
        <p>LAST VERIFIED · 2026.09.04</p>
      </footer>
    </main>
  );
}
