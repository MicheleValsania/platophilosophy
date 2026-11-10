const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const LANGS = ["en", "it", "fr"];
const i18n = Object.fromEntries(LANGS.map((l) => [l, require(`./src/_data/i18n/${l}.json`)]));

// ---------- i18n string check: every key must exist in all languages ----------
function flatKeys(obj, prefix = "") {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? flatKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`]);
}
{
  const sets = LANGS.map((l) => new Set(flatKeys(i18n[l])));
  const all = new Set(sets.flatMap((s) => [...s]));
  const missing = [];
  for (const key of all) LANGS.forEach((l, i) => { if (!sets[i].has(key)) missing.push(`${l}: ${key}`); });
  if (missing.length) throw new Error("i18n strings missing:\n  " + missing.join("\n  "));
}

// ---------- page registry: translationKey <-> URL per language ----------
const registry = { byKey: new Map(), byUrl: new Map() };

function normalizeUrl(url) {
  if (!url) return url;
  let u = url.replace(/^https?:\/\/(www\.)?platophilosophy\.com/, "").split("#")[0].split("?")[0];
  if (u === "" || u.endsWith("/")) u += "index.html";
  return u;
}

function lookup(key, lang) {
  const entry = registry.byKey.get(key);
  return entry ? entry[lang] : undefined;
}

// ---------- git dates (cached) ----------
const gitCache = new Map();
function gitDate(file) {
  if (gitCache.has(file)) return gitCache.get(file);
  let out = "";
  try {
    out = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], { encoding: "utf8" }).trim();
  } catch { out = ""; }
  const date = (out || new Date().toISOString()).slice(0, 10);
  gitCache.set(file, date);
  return date;
}

// ---------- build guards ----------
const FORBIDDEN = ["Editorial status", "Stato editoriale", "Statut éditorial", "editorial/drafts", "editorial/data", "TODO"];

// ---------- French typography: narrow no-break space in text nodes only ----------
const NBSP = String.fromCharCode(0x00a0);   // no-break space
const NNBSP = String.fromCharCode(0x202f);  // narrow no-break space
const SPACES = `(?:[ ${NBSP}${NNBSP}]|&nbsp;)`;
const FR_BEFORE = new RegExp(`${SPACES}+([;:?!])`, "g");
const FR_GLUED = new RegExp(String.raw`(?<=[\p{L}\p{N})\]»’”])([;:?!])(?=[\s${NBSP}]|$)`, "gu");
const FR_OPEN = new RegExp(`«${SPACES}*`, "g");
const FR_CLOSE = new RegExp(`${SPACES}*»`, "g");

function frenchSpacing(html) {
  const parts = html.split(/(<[^>]+>)/);
  let skip = 0;
  return parts.map((part) => {
    if (part.startsWith("<")) {
      const m = part.match(/^<(\/?)(script|style|code|pre|textarea)/i);
      if (m) skip += m[1] ? -1 : 1;
      return part;
    }
    if (skip > 0 || !part) return part;
    return part
      .replace(FR_BEFORE, `${NNBSP}$1`)
      .replace(FR_GLUED, `${NNBSP}$1`)
      .replace(FR_OPEN, `«${NNBSP}`)
      .replace(FR_CLOSE, `${NNBSP}»`);
  }).join("");
}

// ---------- IT/FR: internal links point to the same language, or to English with (EN) ----------
const fallbackLinks = [];
function localizeLinks(html, page, lang) {
  const englishUrl = lookup(page.data.translationKey, "en") || page.url;
  const start = html.indexOf("<main");
  const end = html.lastIndexOf("</main>");
  if (start < 0 || end < 0) return html;
  const main = html.slice(start, end).replace(/<a\b([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g, (all, pre, href, post, text) => {
    if (/^(https?:|mailto:|tel:|#|\/\/)/.test(href) || /hreflang=/.test(pre + post)) return all;
    const hash = href.includes("#") ? "#" + href.split("#")[1] : "";
    const absolute = normalizeUrl(new URL(href, "https://x" + englishUrl).pathname);
    if (absolute.startsWith(`/${lang}/`)) return all;
    const key = registry.byUrl.get(absolute);
    const target = key && lookup(key, lang);
    if (target) return `<a${pre}href="${target}${hash}"${post}>${text}</a>`;
    fallbackLinks.push({ page: page.url, href: absolute + hash });
    return `<a${pre}href="${absolute}${hash}" hreflang="en"${post}>${text}<span class="lang-tag"> ${i18n[lang].ui.englishOnly}</span></a>`;
  });
  return html.slice(0, start) + main + html.slice(end);
}

module.exports = function (eleventyConfig) {
  // Static files copied byte for byte
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/google5092346a2663c200.html");
  eleventyConfig.ignores.add("src/google5092346a2663c200.html");

  // Keep every current URL: /path/page.html, never /path/page/ (an explicit permalink, e.g. the sitemap, wins)
  eleventyConfig.addGlobalData("eleventyComputed.permalink", () => (data) =>
    typeof data.permalink === "string" && data.permalink && !data.permalink.includes("{{")
      ? data.permalink
      : `${data.page.filePathStem}.html`);

  // Registry of translations, built once all pages are known
  eleventyConfig.addCollection("translations", (api) => {
    registry.byKey.clear();
    registry.byUrl.clear();
    for (const item of api.getAll()) {
      const { translationKey: key, lang } = item.data;
      if (!key || !lang || item.data.eleventyExcludeFromCollections) continue;
      const entry = registry.byKey.get(key) || {};
      if (entry[lang]) throw new Error(`Duplicate translationKey "${key}" for "${lang}": ${entry[lang]} and ${item.url}`);
      entry[lang] = item.url;
      registry.byKey.set(key, entry);
      registry.byUrl.set(normalizeUrl(item.url), key);
    }
    for (const [key, entry] of registry.byKey) {
      for (const l of LANGS) if (entry[l] && !entry.en) throw new Error(`Page ${entry[l]} (${l}) has no English counterpart for "${key}"`);
    }
    // canonical aliases of the English home
    if (registry.byKey.get("site-home")) registry.byUrl.set("/index.html", "site-home");
    return [];
  });

  // UI strings: {{ "nav.resources" | t(lang) }}
  eleventyConfig.addFilter("t", function (key, lang) {
    const value = key.split(".").reduce((o, k) => (o == null ? o : o[k]), i18n[lang || "en"]);
    if (value == null) throw new Error(`Missing i18n key "${key}" for "${lang}"`);
    return value;
  });

  // URL of the same page in `lang` if it exists, otherwise the given (English) URL
  eleventyConfig.addFilter("localeUrl", function (url, lang) {
    if (!lang || lang === "en" || /^(https?:|mailto:)/.test(url)) return url;
    const hash = url.includes("#") ? "#" + url.split("#")[1] : "";
    const key = registry.byUrl.get(normalizeUrl(url));
    const target = key && lookup(key, lang);
    return target ? target + hash : url;
  });

  // { url, fallback } for a translationKey in `lang`
  eleventyConfig.addFilter("keyUrl", function (key, lang) {
    const own = lookup(key, lang);
    if (own) return { url: own, fallback: false };
    return { url: lookup(key, "en"), fallback: lang !== "en" };
  });

  // Existing language versions of a page, in site order
  eleventyConfig.addFilter("alternates", function (key) {
    const entry = registry.byKey.get(key) || {};
    return LANGS.filter((l) => entry[l]).map((l) => ({ lang: l, url: entry[l] }));
  });

  eleventyConfig.addFilter("gitDate", (inputPath) => gitDate(inputPath));
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));

  // Sitemap entries in their declared order (English pages carry the sitemap data)
  eleventyConfig.addFilter("sitemapEntries", function (pages) {
    return pages
      .filter((p) => p.data.sitemap)
      .sort((a, b) => a.data.sitemap.order - b.data.sitemap.order);
  });

  // Glossary records sorted and grouped by initial letter in the page language
  eleventyConfig.addFilter("glossaryEntries", function (records, lang) {
    const collator = new Intl.Collator(lang, { sensitivity: "base" });
    const initial = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0).toUpperCase();
    const groups = [];
    records
      .map((r) => ({
        id: r.id, greek: r.greek, transliteration: r.transliteration,
        headword: r.headwords[lang], definition: r.definitions[lang],
      }))
      .sort((a, b) => collator.compare(a.headword, b.headword))
      .forEach((r) => {
        const letter = initial(r.headword);
        let g = groups[groups.length - 1];
        if (!g || g.letter !== letter) groups.push((g = { letter, records: [] }));
        g.records.push(r);
      });
    return groups;
  });

  eleventyConfig.addFilter("byLang", (pages, key, lang) =>
    pages.find((p) => p.data.translationKey === key && p.data.lang === lang));

  eleventyConfig.addTransform("i18n-and-guards", function (content) {
    const out = this.page.outputPath || "";
    if (!out.endsWith(".html")) return content;
    let html = content;
    const lang = (html.match(/<html lang="(\w+)"/) || [])[1];
    const key = (html.match(/<html[^>]*data-key="([^"]+)"/) || [])[1];
    if (lang === "it" || lang === "fr") html = localizeLinks(html, { url: this.page.url, data: { translationKey: key } }, lang);
    if (lang === "fr") html = frenchSpacing(html);
    for (const word of FORBIDDEN) {
      if (html.includes(word)) throw new Error(`Build guard: "${word}" found in ${this.page.url}`);
    }
    return html;
  });

  eleventyConfig.on("eleventy.after", () => {
    fs.mkdirSync(".cache", { recursive: true });
    fs.writeFileSync(".cache/i18n-fallback-links.json", JSON.stringify(fallbackLinks, null, 2));
    fallbackLinks.length = 0;
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: false,
    templateFormats: ["html", "njk", "md"],
  };
};
