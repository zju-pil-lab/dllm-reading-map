#!/usr/bin/env python3
"""Import the complete reference list from Sander Dieleman's 2026 CDLM essay.

Usage:
  python3 scripts/import_sander_refs.py /path/to/continuous-dlms.html

Without a local path, the script fetches the canonical article URL. The generated
JSON is intentionally committed so the website build never depends on the network.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import urllib.request
from pathlib import Path


ARTICLE_URL = "https://sander.ai/2026/08/24/continuous-dlms.html?v=1"
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "sander-2026.json"

CATEGORY_KEYS = {
    "foundations": {
        "transformer", "teacherforcing", "gpt2", "score", "improvedscore", "ddpm",
        "gpt3", "chinchilla", "llama", "bert", "vaekingma", "vaerezende", "vdm",
        "sde", "rin", "cir", "flowmatching", "cm",
    },
    "precursors": {"maskpredict", "xlnet", "nat", "iternat"},
    "discrete": {"multinomial", "d3pm", "sundae", "diffusiongemma"},
    "continuous": {
        "diffusionlm", "diffuseq", "ssdlm", "difformer", "seqdiffuseq", "genie",
        "sed", "cdcd", "plaid", "replaid", "analogbits", "langflow", "cobit",
    },
    "simplex": {"simplex", "ddsm", "floto", "dirichletfm", "sf", "hsf"},
    "flow": {"infonoise", "fmlm", "fpf", "fmm", "selfdist", "cfm", "dfm", "scalingcfms", "dmmd", "idlm"},
    "hybrid": {"duo", "cadd", "ccdd", "candi", "sticky", "posterior"},
    "latent": {"ld4lg", "ldlm", "elf", "timecontrol", "planner", "lcm", "sld", "ladir", "ltf", "auroralm"},
    "systems": {"nemotron", "dflash", "fefdllm", "dmax"},
    "multimodal": {"diffusionforcing", "transfusion"},
    "evaluation": {"dataconstrained", "genppl", "mauve"},
    "surveys": {"survey"},
}

ESSENTIAL_ORDER = {
    "d3pm": 1,
    "diffusionlm": 2,
    "cdcd": 3,
    "plaid": 5,
    "duo": 9,
    "cfm": 10,
    "langflow": 11,
    "replaid": 12,
}

WHY_READ = {
    "d3pm": "离散状态空间扩散的统一起点，建立 transition kernel 与 absorbing mask 的基本语言。",
    "diffusionlm": "第一波连续文本扩散的代表作，展示 embedding-space diffusion 的可控生成能力。",
    "sed": "理解 self-conditioning 为何几乎成为连续语言扩散的标配。",
    "cdcd": "把归一化 embedding、交叉熵目标与自适应噪声日程组织成一套清晰配方。",
    "plaid": "从似然与 scaling 的角度检验连续路线，也解释了它一度沉寂的原因。",
    "duo": "连接高斯连续扩散与 uniform-state 离散扩散，是理解混合方法的重要桥梁。",
    "cfm": "把 flow maps 推到 categorical setting，理解一步或少步生成的关键入口。",
    "langflow": "2026 年连续路线回归的代表性工作，系统比较连续与离散建模。",
    "replaid": "用现代训练与评测重新审视连续扩散的规模化结论。",
}

URL_OVERRIDES = {
    "transformer": "https://arxiv.org/abs/1706.03762",
    "teacherforcing": "https://doi.org/10.1162/neco.1989.1.2.270",
    "ddpm": "https://arxiv.org/abs/2006.11239",
    "ld4lg": "https://arxiv.org/abs/2212.09462",
}

VENUE_ALIASES = {
    "Advances in neural information processing systems 30 (NeurIPS)": "NeurIPS",
    "Neural Information Processing Systems": "NeurIPS",
    "International Conference on Learning Representations": "ICLR",
    "International Conference on Machine Learning": "ICML",
    "Association for Computational Linguistics": "ACL",
    "Empirical Methods in Natural Language Processing": "EMNLP",
    "North American Chapter of the Association for Computational Linguistics": "NAACL",
    "OpenAI blog": "Report",
    "blog": "Blog",
}


def clean(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", value)).replace("\xa0", " ").strip()


def split_authors(value: str) -> list[str]:
    value = value.replace(" and ", ", ")
    return [author.strip() for author in value.split(",") if author.strip()]


def category_for(key: str) -> str:
    matches = [category for category, keys in CATEGORY_KEYS.items() if key in keys]
    if len(matches) != 1:
        raise ValueError(f"Expected one category for {key!r}, found {matches}")
    return matches[0]


def tags_for(title: str, category: str) -> list[str]:
    lower = title.lower()
    tags: list[str] = [category]
    rules = [
        ("masked", "masked"),
        ("flow map", "flow-map"),
        ("flow matching", "flow-matching"),
        ("self-condition", "self-conditioning"),
        ("latent", "latent"),
        ("embedding", "embedding"),
        ("simplex", "simplex"),
        ("bit", "bitstream"),
        ("distill", "distillation"),
        ("speculative", "speculative-decoding"),
        ("scal", "scaling"),
        ("reason", "reasoning"),
        ("autoregressive", "AR-hybrid"),
        ("multimodal", "multimodal"),
        ("evaluation", "evaluation"),
        ("perplexity", "evaluation"),
    ]
    for needle, tag in rules:
        if needle in lower and tag not in tags:
            tags.append(tag)
    return tags[:4]


def paper_id(key: str, url: str) -> str:
    match = re.search(r"arxiv\.org/(?:abs|pdf)/(\d{4}\.\d{4,5})", url)
    return f"arxiv:{match.group(1)}" if match else f"sander:{key}"


def parse_references(document: str) -> list[dict]:
    marker = '<h2 id="-references"'
    if marker not in document:
        raise ValueError("Could not locate the References section")
    section = document[document.index(marker):]
    blocks = re.findall(r'<li id="fn:([^"]+)"[^>]*>(.*?)</li>', section, re.S)
    papers: list[dict] = []

    for source_index, (key, block) in enumerate(blocks, start=1):
        match = re.search(
            r'<p>(.*?)“<a href="([^"]+)">(.*?)</a>”,\s*(.*?),\s*(\d{4})\.',
            block,
            re.S,
        )
        if match:
            author_text, url, title, venue, year = match.groups()
        else:
            # Reference 6 has no venue in the source line.
            match = re.search(
                r'<p>(.*?)“<a href="([^"]+)">(.*?)</a>”,\s*(\d{4})\.',
                block,
                re.S,
            )
            if not match:
                raise ValueError(f"Could not parse reference {source_index}: {key}")
            author_text, url, title, year = match.groups()
            venue = "NeurIPS" if key == "ddpm" else ""

        title = clean(title)
        url = URL_OVERRIDES.get(key, html.unescape(url))
        venue = VENUE_ALIASES.get(clean(venue), clean(venue))
        year_number = int(year)
        category = category_for(key)
        tier = "essential" if key in ESSENTIAL_ORDER else (
            "frontier" if year_number == 2026 else
            "context" if category in {"foundations", "precursors", "multimodal"} else
            "recommended"
        )

        papers.append({
            "id": paper_id(key, url),
            "sourceKey": key,
            "sourceIndex": source_index,
            "title": title,
            "authors": split_authors(clean(author_text).rstrip(", ")),
            "year": year_number,
            "published": str(year_number),
            "venue": venue,
            "url": url,
            "category": category,
            "tags": tags_for(title, category),
            "tier": tier,
            "essentialOrder": ESSENTIAL_ORDER.get(key),
            "whyReadZh": WHY_READ.get(key),
            "sourceCollections": ["sander-2026"],
            "lastVerified": "2026-09-04",
        })

    if len(papers) != 81:
        raise ValueError(f"Expected 81 references, parsed {len(papers)}")
    return papers


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("html", nargs="?", type=Path)
    args = parser.parse_args()

    if args.html:
        document = args.html.read_text(encoding="utf-8")
    else:
        request = urllib.request.Request(ARTICLE_URL, headers={"User-Agent": "dLLM-Reading-Map/1.0"})
        with urllib.request.urlopen(request, timeout=30) as response:
            document = response.read().decode("utf-8")

    papers = parse_references(document)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(papers, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(papers)} references to {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
