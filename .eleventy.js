const i18n = {
  en: require("./src/_data/i18n/en.json"),
};

module.exports = function (eleventyConfig) {
  // Static files copied byte for byte
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/google5092346a2663c200.html");
  eleventyConfig.ignores.add("src/google5092346a2663c200.html");

  // Keep every current URL: /path/page.html, never /path/page/
  eleventyConfig.addGlobalData("permalink", "{{ page.filePathStem }}.html");

  // UI strings: {{ "nav.resources" | t(lang) }}
  eleventyConfig.addFilter("t", function (key, lang) {
    const dict = i18n[lang || "en"] || i18n.en;
    const value = key.split(".").reduce((o, k) => (o == null ? o : o[k]), dict);
    if (value == null) throw new Error(`Missing i18n key "${key}" for "${lang}"`);
    return value;
  });

  // Sitemap entries in their declared order
  eleventyConfig.addFilter("sitemapEntries", function (pages) {
    return pages
      .filter((p) => p.data.sitemap)
      .sort((a, b) => a.data.sitemap.order - b.data.sitemap.order);
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    templateFormats: ["html", "njk"],
  };
};
