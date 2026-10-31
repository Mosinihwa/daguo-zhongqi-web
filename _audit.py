# -*- coding: utf-8 -*-
"""Static + DOM audit for daguo-zhongqi-web."""
from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BASE = "http://127.0.0.1:8765"
issues: list[str] = []


def get(path: str) -> str:
    with urllib.request.urlopen(BASE + "/" + path.lstrip("/"), timeout=5) as r:
        return r.read().decode("utf-8", "replace")


def check_http_pages():
    pages = [
        "login.html",
        "index.html",
        "artifacts.html",
        "timeline.html",
        "contact.html",
        "series-transport.html",
        "series-space.html",
        "series-energy.html",
        "detail.html",
        "detail.html?id=fuxing",
        "detail.html?id=tl-2008",
        "detail.html?id=nope",
        "js/auth.js",
        "js/layout.js",
        "js/catalog.js",
        "js/detail.js",
        "js/main.js",
        "js/contact.js",
        "css/style.css",
    ]
    for p in pages:
        try:
            body = get(p)
            if not body.strip():
                issues.append(f"empty response: {p}")
        except Exception as e:
            issues.append(f"HTTP fail {p}: {e}")


def extract_ids_from_catalog():
    text = (ROOT / "js" / "catalog.js").read_text(encoding="utf-8")
    # ids appear as id: "xxx"
    return sorted(set(re.findall(r'\bid:\s*"([^"]+)"', text)))


def extract_detail_hrefs():
    hrefs = []
    for p in ROOT.glob("*.html"):
        if p.name.startswith("_"):
            continue
        t = p.read_text(encoding="utf-8")
        hrefs.extend(re.findall(r'detail\.html\?id=([a-z0-9\-]+)', t, flags=re.I))
    return sorted(set(hrefs))


def check_detail_id_consistency():
    catalog_ids = set(extract_ids_from_catalog())
    linked_ids = set(extract_detail_hrefs())
    missing = sorted(linked_ids - catalog_ids)
    orphan = sorted(catalog_ids - linked_ids)
    if missing:
        issues.append(f"links to unknown detail ids: {missing}")
    # orphans are ok-ish but warn
    if orphan:
        issues.append(f"WARN catalog ids never linked from HTML: {orphan}")


def check_html_script_order():
    for p in ROOT.glob("*.html"):
        if p.name in ("login.html", "selftest.html") or p.name.startswith("_"):
            continue
        t = p.read_text(encoding="utf-8")
        if "layout.js" not in t and p.name != "detail.html":
            # detail uses detail.js which calls layout
            if "DGZQLayout" in t or "sidebar" in t:
                if "layout.js" not in t:
                    issues.append(f"{p.name}: uses layout but missing layout.js")
        if p.name == "detail.html":
            # order: auth, catalog, layout, detail
            pos = {name: t.find(name) for name in ("auth.js", "catalog.js", "layout.js", "detail.js")}
            if any(v < 0 for v in pos.values()):
                issues.append("detail.html missing required scripts")
            elif not (pos["auth.js"] < pos["catalog.js"] < pos["layout.js"] < pos["detail.js"]):
                issues.append(f"detail.html script order wrong: {pos}")


def check_switch_account():
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    if "data-switch-account" not in index:
        issues.append("index.html missing data-switch-account on 切换账号")
    layout = (ROOT / "js" / "layout.js").read_text(encoding="utf-8")
    if "data-switch-account" not in layout:
        issues.append("layout.js missing switch-account binder")
    auth = (ROOT / "js" / "auth.js").read_text(encoding="utf-8")
    if "switchAccount" not in auth:
        issues.append("auth.js missing switchAccount")


def check_related_ids():
    text = (ROOT / "js" / "catalog.js").read_text(encoding="utf-8")
    # crude: find related: ["a", "b"]
    catalog_ids = set(extract_ids_from_catalog())
    for block in re.findall(r"related:\s*\[(.*?)\]", text, flags=re.S):
        rels = re.findall(r'"([^"]+)"', block)
        for rid in rels:
            if rid not in catalog_ids:
                issues.append(f"related id missing in catalog: {rid}")


def check_auth_gate_on_pages():
    for p in ROOT.glob("*.html"):
        if p.name in ("login.html", "selftest.html") or p.name.startswith("_"):
            continue
        t = p.read_text(encoding="utf-8")
        if "auth.js" not in t:
            issues.append(f"{p.name}: missing auth.js")
        if p.name == "detail.html":
            if "DGZQLayout.init" in t:
                issues.append("detail.html should init via detail.js only, not inline")
        elif "DGZQLayout.init" not in t and p.name != "detail.html":
            issues.append(f"{p.name}: missing DGZQLayout.init()")


def main():
    check_http_pages()
    check_detail_id_consistency()
    check_html_script_order()
    check_switch_account()
    check_related_ids()
    check_auth_gate_on_pages()

    print("CATALOG_IDS", extract_ids_from_catalog())
    print("LINKED_IDS", extract_detail_hrefs())
    if not issues:
        print("AUDIT PASS")
    else:
        print("AUDIT ISSUES")
        for i in issues:
            print("-", i)


if __name__ == "__main__":
    main()
