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
  resources: null,
  guides: { label: "nav.guides", url: "/resources.html#guides", key: "site-resources" },
  start: { label: "nav.start", url: "/resources/guides/start-here.html", key: "guide-start-here" },
  biography: { label: "nav.biography", url: "/resources/platophilosophy/index.html", key: "biography-index" },
  philosophy: { label: "nav.philosophy", url: "/resources/philosophy/index.html", key: "philosophy-index" },
  references: { label: "section.references", url: "/resources.html#references", key: "site-resources" },
};
const t = (lang, k) => k.split(".").reduce((o, x) => o[x], i18n[lang]);

function breadcrumb(sectionId, lang, current) {
  if (sectionId === "none") return undefined;
  const s = SECTIONS[sectionId];
  const links = [
    { label: t(lang, "ui.breadcrumbHome"), url: "/index.html" },
    { label: t(lang, "nav.resources"), url: "/resources.html" },
  ];
  if (s) links.push({ label: t(lang, s.label), url: s.url });
  return { links, current };
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
    crumbs && {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        ...crumbs.links.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: abs(c.url) })),
        { "@type": "ListItem", position: crumbs.links.length + 1, name: crumbs.current },
      ],
    },
  ].filter(Boolean);
}

// Approved title (# …) of another draft, for previous/next labels
function draftTitle(key, lang) {
  const dir = path.join(PRIVATE, "editorial/drafts", key);
  const f = fs.existsSync(dir) && fs.readdirSync(dir).find((n) => n.startsWith(`${lang}-reader-`) &&
    /^status:\s*approved/m.test(fs.readFileSync(path.join(dir, n), "utf8")));
  if (!f) fail(`no approved ${lang} draft for ${key}`);
  return fs.readFileSync(path.join(dir, f), "utf8").match(/^# (.+)$/m)[1].trim();
}
function frontMatterNav(draft, lang) {
  const item = (k) => (k && k !== "null" ? { key: k, label: draftTitle(k, lang) } : undefined);
  return { previous: item(draft.data.previous), next: item(draft.data.next) };
}
// "**Goal:** text" (Obiettivo, Objectif…) paragraph of a guide, used as its description
function goal(body, rel) {
  const m = body.match(/^\*\*[^*\n]+?\s?:\*\*\s*(.+)$/m);
  if (!m) fail(`${rel}: no "**Goal:**" paragraph for the description`);
  const text = m[1].replace(/\*\*?([^*]+)\*\*?/g, "$1").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ---------- navigation data ----------
let biographyIndex;
function biographyNav(key, lang) {
  biographyIndex ??= JSON.parse(fs.readFileSync(path.join(PRIVATE, "editorial/data/biography-index-trilingual-v0.1.json"), "utf8"));
  const ch = [...biographyIndex.chapters].sort((a, b) => a.order - b.order);
  const i = ch.findIndex((c) => c.translationKey === key);
  const item = (c) => c && { key: c.translationKey, label: c.title[lang] };
  if (key === "biography-timeline") return { previous: item(ch[ch.length - 1]), next: { key: "biography-index", label: t(lang, "nav.biography") } };
  if (i < 0) fail(`${key} not found in biography-index-trilingual-v0.1.json`);
  return {
    previous: item(ch[i - 1]) || { key: "biography-index", label: t(lang, "nav.biography") },
    next: item(ch[i + 1]) || { key: "biography-timeline", label: biographyIndex.timeline.title[lang] },
  };
}

let beginnerPath;
function beginnerStep(key) {
  beginnerPath ??= JSON.parse(fs.readFileSync(path.join(PRIVATE, "editorial/data/beginner-path-trilingual-v0.1.json"), "utf8"));
  if (beginnerPath.status !== "approved") fail(`beginner-path-trilingual-v0.1.json: status is "${beginnerPath.status}"`);
  const step = beginnerPath.steps.find((s) => s.translationKey === key);
  if (!step) fail(`${key} not found in beginner-path-trilingual-v0.1.json`);
  return step;
}
function beginnerNav(key, lang) {
  const step = beginnerStep(key);
  const item = (k) => k && { key: k, label: beginnerStep(k).title[lang] };
  return { previous: item(step.previous), next: item(step.next) };
}

// "## Heading" sections of a draft: [{ heading, blocks }] (blocks before the first heading: heading null)
function sections(body) {
  const out = [{ heading: null, blocks: [] }];
  for (const block of body.trim().split(/\n{2,}/)) {
    const h = block.match(/^## (.+)$/);
    if (h) out.push({ heading: h[1].trim(), blocks: [] });
    else out[out.length - 1].blocks.push(block.trim());
  }
  return out;
}
// Paragraphs addressed to editors (they mention the private datasets) are never published
const forReaders = (blocks) => blocks.filter((b) => !/editorial\//.test(b));
const bullets = (block) => block.split("\n").map((l) => l.match(/^- \*\*(.+?)\*\*(?:\s+—\s+(.*))?$/)).filter(Boolean)
  .map((m) => ({ label: m[1], text: m[2] ? inline(m[2]) : "" }));

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
    if (["article", "biography-index", "biography-timeline", "greek-essentials", "map"].includes(page.type)) {
      const a = splitArticle(draft.body, rel);
      const crumbs = breadcrumb(page.section, lang, a.title);
      const nav = page.navigation === "biography" ? biographyNav(page.key, lang)
        : page.navigation === "philosophy" ? philosophyNav(page.key, lang)
        : page.navigation === "beginner" ? beginnerNav(page.key, lang)
        : page.navigation === "frontmatter" ? frontMatterNav(draft, lang) : {};
      // Description: approved separately in publish-list.json, the draft's own lead, or the approved dataset entry
      const description = page.description === "lead" ? a.lead.replace(/<[^>]+>/g, "")
        : page.description === "beginner-path" ? beginnerStep(page.key).description[lang]
        : page.description === "goal" ? goal(a.body, rel)
        : page.description[lang];
      if (!description) fail(`${rel}: no description (publish-list.json) and no lead`);
      if (description.length > 155) fail(`${rel}: description longer than 155 characters`);
      fm = {
        layout: "layouts/article.njk", templateEngineOverride: "md", lang, translationKey: page.key,
        title: a.title, pageTitle: page.pageTitle?.[lang] || `${a.title} | PLATO`, description,
        kicker: a.kicker, lead: a.lead, canonical: url, breadcrumb: crumbs,
        previous: nav.previous, next: nav.next,
        jsonld: jsonld(page, lang, a.title, description, url, crumbs, prov.date),
      };
      body = a.body;
      const dataset = () => {
        const data = JSON.parse(fs.readFileSync(path.join(PRIVATE, page.data.file), "utf8"));
        if (data.status !== "approved") fail(`${page.data.file}: dataset status is "${data.status}"`);
        if (data.translationKey !== page.key) fail(`${page.data.file}: translationKey "${data.translationKey}" is not "${page.key}"`);
        provenance(page.data.file);
        return data;
      };
      if (page.type === "greek-essentials") {
        // the numbered list of terms in the draft is replaced by the full entries of the dataset
        const entries = [...dataset().entries].sort((x, y) => x.order - y.order);
        const html = ['<div class="greek-terms">', ...entries.map((e) =>
          `<div class="concept-box" id="${e.id}"><p class="concept-title"><span lang="grc">${esc(e.greek)}</span> — <em>${esc(e.transliteration)}</em></p>` +
          `<p class="concept-text"><strong>${esc(e.meaning[lang])}</strong></p><p class="concept-text">${esc(e.note[lang])}</p></div>`), "</div>"].join("\n");
        const list = body.split(/\n{2,}/).find((b) => /^1\. \*\*/.test(b));
        if (!list || (list.match(/^\d+\. /gm) || []).length !== entries.length) fail(`${rel}: numbered list of ${entries.length} terms not found`);
        body = body.replace(list, html);
      }
      if (page.type === "map") {
        // map and location cards from the dataset, before the closing "related resources" paragraph
        const data = dataset();
        if (data.routePolicy !== "no-reconstructed-routes") fail(`${page.data.file}: unexpected routePolicy "${data.routePolicy}"`);
        fm.places = data.places.map((p) => ({ id: p.id, name: p.name[lang], text: p.text[lang], lat: p.lat, lng: p.lng, chapter: p.sourcePage }));
        fm.pageStyles = "styles/map.njk";
        fm.pageScripts = "scripts/map.njk";
        const cards = ['<div id="map" role="region" aria-label="' + esc(a.title) + '"></div>', '<div class="location-cards">',
          ...fm.places.map((p) => `<div class="location-card" id="${p.id}"><h4>${esc(p.name)}</h4><p>${esc(p.text)}</p><a href="${p.chapter}">${esc(t(lang, "ui.readMore"))} →</a></div>`),
          "</div>"].join("\n");
        const blocks = body.trim().split(/\n{2,}/);
        const last = blocks[blocks.length - 1];
        body = /^\*\*[^*]+\*\*/.test(last) && /\]\(/.test(last)
          ? blocks.slice(0, -1).join("\n\n") + "\n\n" + cards + "\n\n" + last + "\n"
          : body + "\n" + cards + "\n";
      }
      if (page.type === "biography-index") {
        // intro, then "timeline", "chapters" and "continue" sections; chapter cards come from the dataset
        const [intro, timeline, chapters, more] = sections(a.body);
        if (!timeline || !chapters || !more) fail(`${rel}: expected three "##" sections (timeline, chapters, continue)`);
        biographyIndex ??= JSON.parse(fs.readFileSync(path.join(PRIVATE, "editorial/data/biography-index-trilingual-v0.1.json"), "utf8"));
        const tlText = forReaders(timeline.blocks);
        const moreLinks = bullets(more.blocks.join("\n"));
        if (moreLinks.length !== 2) fail(`${rel}: expected two links under "${more.heading}"`);
        Object.assign(fm, {
          layout: "layouts/biography-index.njk",
          timelineSection: { heading: timeline.heading, text: inline(tlText.filter((b) => !/^\*\*[^*]+\*\*$/.test(b)).join(" ")),
            button: (tlText.find((b) => /^\*\*[^*]+\*\*$/.test(b)) || "").slice(2, -2) },
          chaptersSection: { heading: chapters.heading, text: forReaders(chapters.blocks).map(inline) },
          chapters: [...biographyIndex.chapters].sort((x, y) => x.order - y.order)
            .map((c) => ({ order: c.order, key: c.translationKey, title: c.title[lang], description: c.description[lang] })),
          continueSection: { heading: more.heading, links: [
            { label: moreLinks[0].label, url: "/resources.html" },
            { label: moreLinks[1].label, url: "/resources/guides/start-here.html" }] },
        });
        body = intro.blocks.join("\n\n") + "\n";
      }
      if (page.type === "biography-timeline") {
        // intro paragraphs, then the event-label legend; events come from the dataset
        const parts = sections(a.body);
        // two 5-item lists: period headings, then event labels (4 categories + "read the chapter")
        const legend = parts.map((s) => bullets(s.blocks.join("\n"))).filter((b) => b.length === 5).pop();
        if (!legend) fail(`${rel}: event-label list (5 items) not found`);
        const data = JSON.parse(fs.readFileSync(path.join(PRIVATE, page.data.file), "utf8"));
        if (data.status !== "approved") fail(`${page.data.file}: dataset status is "${data.status}"`);
        const cats = ["context", "life", "works", "legacy"];
        Object.assign(fm, {
          layout: "layouts/biography-timeline.njk",
          legend: cats.map((c, n) => ({ category: c, label: legend[n].label, text: legend[n].text })),
          readChapter: legend[4].label,
          events: data.events.map((e) => ({ id: e.id, category: e.category, date: e[`${lang}Date`], title: e[`${lang}Title`],
            description: e[`${lang}Description`], chapter: `/resources/platophilosophy/${e.sourcePage}` })),
        });
        provenance(page.data.file);
        body = forReaders(parts[0].blocks).join("\n\n") + "\n";
      }
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
