#!/usr/bin/env node
// Import approved drafts from the private editorial repository into src/.
//
//   node scripts/import-drafts.mjs --private ../platophilosophy-private [--only <translationKey>]
//
// Only the pages listed in scripts/publish-list.json are imported, and only from files whose
// front matter says `status: approved`. Generated files must not be edited by hand: fix the
// draft in the private repository, commit it there, and run this script again.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const LANGS = ["en", "it", "fr"];
const SITE = "https://platophilosophy.com";

// ---------- arguments ----------
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const PRIVATE = opt("--private");
const ONLY = opt("--only");
if (!PRIVATE) fail("missing --private <path to platophilosophy-private>");
if (!fs.existsSync(path.join(PRIVATE, "editorial"))) fail(`${PRIVATE} does not look like platophilosophy-private`);

function fail(msg) { console.error("import-drafts: " + msg); process.exit(1); }

const list = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/publish-list.json"), "utf8"));
const i18n = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(fs.readFileSync(path.join(ROOT, `src/_data/i18n/${l}.json`), "utf8"))]));
const publishedLangs = new Map(list.pages.map((p) => [p.key, new Set(Object.keys(p.sources))]));

// ---------- helpers ----------
function git(...a) { return execFileSync("git", ["-C", PRIVATE, ...a], { encoding: "utf8" }).trim(); }

function provenance(rel) {
  if (git("status", "--porcelain", "--", rel)) fail(`${rel} has uncommitted changes in the private repository: commit it first`);
  const commit = git("log", "-1", "--format=%H", "--", rel);
  const date = git("log", "-1", "--format=%cI", "--", rel);
  if (!commit) fail(`${rel} is not committed in the private repository`);
  return { path: rel, commit, date };
}

function readDraft(rel) {
  const file = path.join(PRIVATE, rel);
  if (!fs.existsSync(file)) fail(`missing draft ${rel}`);
  if (/revision-proposal/.test(rel)) fail(`${rel}: revision proposals are never imported`);
  const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) fail(`${rel}: no front matter`);
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  if (data.status !== "approved") fail(`${rel}: status is "${data.status}", only approved drafts are imported`);
  return { data, body: m[2] };
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>");

// Split title (# …), kicker (*…*) and an all-bold lead paragraph from the body
function splitArticle(body, rel) {
  const blocks = body.trim().split(/\n{2,}/);
  const h1 = blocks.shift();
  if (!/^# /.test(h1)) fail(`${rel}: the first block must be the "# Title"`);
  const title = h1.slice(2).trim();
  let kicker = "";
  if (blocks[0] && /^\*[^*].*\*$/.test(blocks[0].trim())) kicker = blocks.shift().trim().slice(1, -1);
  let lead = "";
  if (blocks[0] && /^\*\*[^\n]*\*\*$/.test(blocks[0].trim()) && !/\*\*\s*\S.*\*\*.*\*\*/.test(blocks[0].trim().slice(2, -2))) {
    lead = inline(blocks.shift().trim().slice(2, -2));
  }
  return { title, kicker, lead, body: blocks.join("\n\n") + "\n" };
}

// Text of the "## <prefix>…" section, without its heading
function section(body, prefix, rel) {
  const parts = body.split(/^## /m);
  const hit = parts.find((p) => p.startsWith(prefix));
  if (!hit) fail(`${rel}: no section starting with "## ${prefix}"`);
  return hit.split("\n").slice(1).join("\n").trim() + "\n";
}

const localUrl = (url, lang) => (lang === "en" ? url : `/${lang}${url}`);
const targetUrl = (key, url, lang) => (publishedLangs.get(key)?.has(lang) ? localUrl(url, lang) : url);

const SECTIONS = {
  biography: { label: "nav.biography", url: "/resources/platophilosophy/index.html", key: "biography-index" },
  philosophy: { label: "nav.philosophy", url: "/resources/philosophy/index.html", key: "philosophy-index" },
  references: { label: "section.references", url: "/resources.html#references", key: "site-resources" },
};
const t = (lang, k) => k.split(".").reduce((o, x) => o[x], i18n[lang]);

function breadcrumb(sectionId, lang, current) {
  const s = SECTIONS[sectionId];
  return {
    links: [
      { label: t(lang, "ui.breadcrumbHome"), url: "/index.html" },
      { label: t(lang, "nav.resources"), url: "/resources.html" },
      { label: t(lang, s.label), url: s.url },
    ],
    current,
  };
}

function jsonld(page, lang, title, description, url, crumbs, date) {
  const abs = (u, key) => SITE + targetUrl(key, u.split("#")[0], lang) + (u.includes("#") ? "#" + u.split("#")[1] : "");
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      inLanguage: lang,
      url: SITE + url,
      mainEntityOfPage: SITE + url,
      author: { "@type": "Organization", name: "PLATO Philosophy", url: SITE },
      publisher: { "@type": "Organization", name: "PLATO Philosophy", url: SITE },
      about: { "@type": "Person", name: "Plato" },
      dateModified: date,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        ...crumbs.links.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: abs(c.url) })),
        { "@type": "ListItem", position: crumbs.links.length + 1, name: crumbs.current },
      ],
    },
  ];
}

// ---------- navigation data ----------
let biographyIndex;
function biographyNav(key, lang) {
  biographyIndex ??= JSON.parse(fs.readFileSync(path.join(PRIVATE, "editorial/data/biography-index-trilingual-v0.1.json"), "utf8"));
  const ch = [...biographyIndex.chapters].sort((a, b) => a.order - b.order);
  const i = ch.findIndex((c) => c.translationKey === key);
  if (i < 0) fail(`${key} not found in biography-index-trilingual-v0.1.json`);
  const item = (c) => c && { key: c.translationKey, label: c.title[lang] };
  return {
    previous: item(ch[i - 1]) || { key: "biography-index", label: t(lang, "nav.biography") },
    next: item(ch[i + 1]) || { key: "biography-timeline", label: null },
  };
}

let philosophyChapters;
function philosophyNav(key, lang) {
  if (!philosophyChapters) {
    philosophyChapters = [];
    const dir = path.join(PRIVATE, "editorial/drafts");
    for (const d of fs.readdirSync(dir).filter((n) => n.startsWith("philosophy-") && n !== "philosophy-index")) {
      const titles = {}; let order;
      for (const l of LANGS) {
        const f = fs.readdirSync(path.join(dir, d)).find((n) => n.startsWith(`${l}-reader-`) &&
          /status:\s*approved/.test(fs.readFileSync(path.join(dir, d, n), "utf8")));
        if (!f) continue;
        const text = fs.readFileSync(path.join(dir, d, f), "utf8");
        titles[l] = text.match(/^# (.+)$/m)[1].trim();
        const n = text.match(/^\*[^*\n]*?(\d+)\s+(?:of|di|sur)\s+\d+\*$/m);
        if (n && l === "en") order = Number(n[1]);
      }
      if (!order) fail(`${d}: chapter number not found in the English kicker`);
      philosophyChapters.push({ key: d, order, titles });
    }
    philosophyChapters.sort((a, b) => a.order - b.order);
  }
  const i = philosophyChapters.findIndex((c) => c.key === key);
  const item = (c) => c && { key: c.key, label: c.titles[lang] || c.titles.en };
  return {
    previous: item(philosophyChapters[i - 1]) || { key: "philosophy-index", label: t(lang, "nav.philosophy") },
    next: item(philosophyChapters[i + 1]),
  };
}

// ---------- English sitemap metadata is kept from the page being replaced ----------
function existingSitemap(enHtml, enMd) {
  const file = [enMd, enHtml].find((f) => fs.existsSync(f));
  if (!file) return undefined;
  const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const fm = text.match(/^---\n([\s\S]*?)\n---/)?.[1] || "";
  const json = fm.match(/^sitemap: (\{.*\})$/m);
  if (json) return JSON.parse(json[1]);
  const block = fm.match(/^sitemap:\n((?: {2}.+\n?)+)/m);
  if (!block) return undefined;
  const out = {};
  for (const line of block[1].split("\n")) {
    const kv = line.match(/^ {2}(\w+): (.+)$/);
    if (!kv || kv[1] === "lastmod") continue;
    const v = kv[2].replace(/^"|"$/g, "");
    out[kv[1]] = kv[1] === "order" ? Number(v) : v;
  }
  return out;
}

// ---------- writing ----------
function frontMatter(obj) {
  const lines = ["---", "# Generated by scripts/import-drafts.mjs from platophilosophy-private: do not edit here."];
  for (const [k, v] of Object.entries(obj)) if (v !== undefined && v !== null && v !== "") lines.push(`${k}: ${JSON.stringify(v)}`);
  lines.push("---", "");
  return lines.join("\n");
}

function write(rel, text) {
  const file = path.join(ROOT, "src", rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  console.log("  wrote src/" + rel);
}

let count = 0;
for (const page of list.pages) {
  if (ONLY && page.key !== ONLY) continue;
  console.log(`${page.key}`);
  const mdRel = page.url.replace(/^\//, "").replace(/\.html$/, ".md");
  const enHtml = path.join(ROOT, "src", page.url.replace(/^\//, ""));
  const enMd = path.join(ROOT, "src", mdRel);
  const sitemap = existingSitemap(enHtml, enMd);

  let glossaryWritten = false;
  for (const lang of LANGS) {
    const src = page.sources[lang];
    if (!src) continue;
    const rel = typeof src === "string" ? src : src.file;
    const sourceKey = typeof src === "string" ? page.key : src.sourceKey;
    const draft = readDraft(rel);
    if (draft.data.translationKey !== sourceKey) fail(`${rel}: translationKey "${draft.data.translationKey}" is not "${sourceKey}"`);
    if (draft.data.lang !== lang) fail(`${rel}: lang "${draft.data.lang}" is not "${lang}"`);
    const prov = provenance(rel);
    const url = localUrl(page.url, lang);

    let fm, body;
    if (page.type === "article") {
      const a = splitArticle(draft.body, rel);
      const crumbs = breadcrumb(page.section, lang, a.title);
      const nav = page.navigation === "biography" ? biographyNav(page.key, lang) : philosophyNav(page.key, lang);
      if (nav.next && !nav.next.label) nav.next.label = t(lang, "nav.biography");
      fm = {
        layout: "layouts/article.njk", templateEngineOverride: "md", lang, translationKey: page.key,
        title: a.title, pageTitle: page.pageTitle[lang], description: page.description[lang],
        kicker: a.kicker, lead: a.lead, canonical: url, breadcrumb: crumbs,
        previous: nav.previous, next: nav.next,
        jsonld: jsonld(page, lang, a.title, page.description[lang], url, crumbs, prov.date),
      };
      body = a.body;
    } else if (page.type === "glossary") {
      const data = JSON.parse(fs.readFileSync(path.join(PRIVATE, page.data.file), "utf8"));
      if (data.status !== "approved") fail(`${page.data.file}: dataset status is "${data.status}"`);
      if (data.translationKey !== page.data.sourceKey) fail(`${page.data.file}: translationKey "${data.translationKey}" is not "${page.data.sourceKey}"`);
      if (!glossaryWritten) {
        const dprov = provenance(page.data.file);
        const records = data.records.map((r) => ({ id: r.id, greek: r.greek, transliteration: r.transliteration, headwords: r.headwords, definitions: r.definitions }));
        for (const r of records) for (const l of LANGS) if (!r.headwords[l] || !r.definitions[l]) fail(`${page.data.file}: record ${r.id} lacks "${l}"`);
        fs.writeFileSync(path.join(ROOT, "src/_data/glossary.json"),
          JSON.stringify({ "//": "Generated by scripts/import-drafts.mjs: do not edit here.", importedFrom: { path: dprov.path, commit: dprov.commit }, records }, null, 2) + "\n");
        console.log("  wrote src/_data/glossary.json");
        glossaryWritten = true;
      }
      const title = page.heading[lang];
      const crumbs = breadcrumb(page.section, lang, title);
      fm = {
        layout: "layouts/glossary.njk", templateEngineOverride: "md", lang, translationKey: page.key,
        title, pageTitle: page.pageTitle[lang], description: page.description[lang],
        kicker: `${t(lang, "section.references")} · ${data.records.length} ${t(lang, "section.glossaryTerms")}`,
        canonical: url, breadcrumb: crumbs,
        jsonld: jsonld(page, lang, title, page.description[lang], url, crumbs, prov.date),
      };
      body = section(draft.body, src.section, rel);
    } else fail(`${page.key}: unknown type "${page.type}"`);

    if (lang === "en" && sitemap) fm.sitemap = sitemap;
    fm.importedFrom = { path: prov.path, commit: prov.commit };
    write(lang === "en" ? mdRel : `${lang}/${mdRel}`, frontMatter(fm) + body);
    count++;
  }
  if (fs.existsSync(enHtml)) { fs.rmSync(enHtml); console.log("  removed src/" + page.url.replace(/^\//, "") + " (replaced by the imported version)"); }
}
console.log(`import-drafts: ${count} files written`);
