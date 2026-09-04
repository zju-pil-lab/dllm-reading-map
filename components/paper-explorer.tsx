'use client';

import { useMemo, useState } from 'react';
import type { Paper, PaperTier } from '@/lib/papers';
import { categories, categoryById, formatAuthors } from '@/lib/papers';

type SortMode = 'latest' | 'oldest' | 'title' | 'source';
type TierFilter = 'all' | PaperTier;

const tierLabels: Record<TierFilter, string> = {
  all: '全部层级',
  essential: '必读',
  recommended: '推荐',
  frontier: '前沿',
  context: '背景',
};

const sortLabels: Record<SortMode, string> = {
  latest: '最新优先',
  oldest: '最早优先',
  title: '标题 A—Z',
  source: '博客顺序',
};

function searchableText(paper: Paper) {
  return [paper.title, paper.authors.join(' '), paper.venue, paper.category, ...paper.tags]
    .join(' ')
    .toLocaleLowerCase();
}

export default function PaperExplorer({ papers }: { papers: Paper[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [tier, setTier] = useState<TierFilter>('all');
  const [sort, setSort] = useState<SortMode>('latest');
  const [visible, setVisible] = useState(14);

  const filteredPapers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const result = papers.filter((paper) => {
      const categoryMatch = category === 'all' || paper.category === category;
      const tierMatch = tier === 'all' || paper.tier === tier;
      const queryMatch = !normalizedQuery || searchableText(paper).includes(normalizedQuery);
      return categoryMatch && tierMatch && queryMatch;
    });

    return result.sort((a, b) => {
      if (sort === 'oldest') return a.published.localeCompare(b.published);
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'source') {
        const aIndex = a.sourceIndex ?? 10_000;
        const bIndex = b.sourceIndex ?? 10_000;
        return aIndex - bIndex;
      }
      return b.published.localeCompare(a.published);
    });
  }, [papers, query, category, tier, sort]);

  const shownPapers = filteredPapers.slice(0, visible);
  const hasFilters = query || category !== 'all' || tier !== 'all';

  function clearFilters() {
    setQuery('');
    setCategory('all');
    setTier('all');
    setVisible(14);
  }

  return (
    <div className="explorer-shell">
      <div className="explorer-tools">
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">搜索论文、作者或标签</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(14);
            }}
            placeholder="搜索标题、作者、方法…"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setVisible(14); }} aria-label="清空搜索">×</button>
          )}
        </label>

        <label className="select-wrap">
          <span className="sr-only">阅读层级</span>
          <select value={tier} onChange={(event) => { setTier(event.target.value as TierFilter); setVisible(14); }}>
            {Object.entries(tierLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>

        <label className="select-wrap">
          <span className="sr-only">排序方式</span>
          <select value={sort} onChange={(event) => { setSort(event.target.value as SortMode); setVisible(14); }}>
            {Object.entries(sortLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>

      <div className="category-filter" aria-label="按类别筛选">
        <button className={category === 'all' ? 'active' : ''} onClick={() => { setCategory('all'); setVisible(14); }} type="button">
          全部 <span>{papers.length}</span>
        </button>
        {categories.map((item) => {
          const count = papers.filter((paper) => paper.category === item.id).length;
          return (
            <button className={category === item.id ? 'active' : ''} onClick={() => { setCategory(item.id); setVisible(14); }} type="button" key={item.id}>
              {item.zh} <span>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="result-bar">
        <p aria-live="polite"><strong>{filteredPapers.length}</strong> 篇论文</p>
        {hasFilters && <button type="button" onClick={clearFilters}>清除筛选 ×</button>}
      </div>

      {shownPapers.length > 0 ? (
        <div className="catalog-list">
          {shownPapers.map((paper) => (
            <article className="catalog-row" key={paper.id}>
              <div className="catalog-meta">
                <span>{paper.year}</span>
                <span>{paper.venue || '—'}</span>
              </div>
              <div className="catalog-main">
                <div className="paper-flags">
                  <span>{categoryById[paper.category]?.zh ?? paper.category}</span>
                  {paper.tier === 'essential' && <b>必读</b>}
                  {paper.tier === 'frontier' && <b className="frontier-flag">前沿</b>}
                  {paper.sourceCollections.includes('sander-2026') && <i>Sander # {paper.sourceIndex}</i>}
                </div>
                <h3><a href={paper.url} target="_blank" rel="noreferrer">{paper.title}</a></h3>
                <p className="catalog-authors">{formatAuthors(paper.authors)}</p>
                {paper.whyReadZh && <p className="catalog-why"><span>为什么读</span>{paper.whyReadZh}</p>}
                <div className="tag-list">
                  {paper.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
              <a className="paper-out" href={paper.url} target="_blank" rel="noreferrer" aria-label={`打开论文：${paper.title}`}>↗</a>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>没有匹配的论文。</p>
          <button type="button" onClick={clearFilters}>重置筛选</button>
        </div>
      )}

      {visible < filteredPapers.length && (
        <button className="load-more" type="button" onClick={() => setVisible((value) => value + 16)}>
          显示更多 <span>{Math.min(16, filteredPapers.length - visible)} 篇</span>
        </button>
      )}
    </div>
  );
}
