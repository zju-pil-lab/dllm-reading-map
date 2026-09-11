#!/usr/bin/env python3
"""Find recent arXiv candidates without automatically publishing them."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARXIV_API = "https://export.arxiv.org/api/query"
ATOM = {"atom": "http://www.w3.org/2005/Atom"}
QUERY = 'all:"diffusion language model" OR all:"masked diffusion language" OR all:"flow map language model" OR all:"diffusion LLM" OR all:"agentic dLLM"'


def known_arxiv_ids() -> set[str]:
    papers = []
    for name in ("sander-2026.json", "curated-extras.json"):
        papers.extend(json.loads((ROOT / "data" / name).read_text(encoding="utf-8")))
    return {paper["id"].removeprefix("arxiv:") for paper in papers if paper["id"].startswith("arxiv:")}


def compact(value: str | None) -> str:
    return " ".join((value or "").split())


def fetch_candidates(days: int, limit: int) -> list[dict]:
    params = urllib.parse.urlencode({
        "search_query": QUERY,
        "start": 0,
        "max_results": limit,
        "sortBy": "submittedDate",
        "sortOrder": "descending",
    })
    request = urllib.request.Request(
        f"{ARXIV_API}?{params}",
        headers={"User-Agent": "dLLM-Reading-Map/1.0 (paper discovery; GitHub Actions)"},
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        root = ET.fromstring(response.read())

    known = known_arxiv_ids()
    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=days)
    candidates = []

    for entry in root.findall("atom:entry", ATOM):
        raw_id = compact(entry.findtext("atom:id", namespaces=ATOM)).rsplit("/", 1)[-1]
        arxiv_id = re.sub(r"v\d+$", "", raw_id)
        published_raw = compact(entry.findtext("atom:published", namespaces=ATOM))
        published = dt.datetime.fromisoformat(published_raw.replace("Z", "+00:00"))
        if arxiv_id in known or published < cutoff:
            continue

        title = compact(entry.findtext("atom:title", namespaces=ATOM))
        summary = compact(entry.findtext("atom:summary", namespaces=ATOM))
        haystack = f"{title} {summary}".lower()
        if "diffusion" not in haystack or not any(term in haystack for term in ("language", "text", "llm")):
            continue

        authors = [compact(author.findtext("atom:name", namespaces=ATOM)) for author in entry.findall("atom:author", ATOM)]
        candidates.append({
            "id": arxiv_id,
            "title": title,
            "authors": authors,
            "published": published.date().isoformat(),
            "url": f"https://arxiv.org/abs/{arxiv_id}",
        })

    return candidates


def write_markdown(candidates: list[dict], output: Path) -> None:
    if not candidates:
        output.write_text("", encoding="utf-8")
        return
    lines = [
        "## Weekly arXiv candidates",
        "",
        "Automatically discovered; **nothing here is published until a maintainer reviews it**.",
        "Check relevance, duplicates, category, first-posted date, and official artifacts.",
        "",
    ]
    for paper in candidates:
        authors = ", ".join(paper["authors"][:4])
        if len(paper["authors"]) > 4:
            authors += f" +{len(paper['authors']) - 4}"
        lines.extend([
            f"- [ ] **[{paper['title']}]({paper['url']})**",
            f"  - `{paper['id']}` · {paper['published']} · {authors}",
        ])
    output.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--days", type=int, default=45)
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--output", type=Path, default=Path("candidates.md"))
    parser.add_argument("--github-output", action="store_true")
    args = parser.parse_args()

    candidates = fetch_candidates(args.days, args.limit)
    write_markdown(candidates, args.output)
    print(f"Found {len(candidates)} candidate(s).")

    github_output = os.environ.get("GITHUB_OUTPUT")
    if args.github_output and github_output:
        with open(github_output, "a", encoding="utf-8") as handle:
            handle.write(f"count={len(candidates)}\n")


if __name__ == "__main__":
    main()
