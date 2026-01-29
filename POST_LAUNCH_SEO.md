# POST-LAUNCH SEO SETUP — PLATOPHILOSOPHY.COM

**Esegui questi passaggi DOPO aver pubblicato il sito online**
**Tempo stimato:** 2-3 ore
**Priorità:** CRITICO per indicizzazione e analytics

---

## ✅ GIÀ COMPLETATO (In Locale)

- ✅ sitemap.xml creato e pronto
- ✅ robots.txt configurato
- ✅ 404.html personalizzato
- ✅ Schema.org JSON-LD su index.html, timeline.html, why-philosophy.html
- ✅ Canonical URLs aggiunti
- ✅ Breadcrumb structured data
- ✅ Theme toggle implementato

---

## 🚀 FASE 1: GOOGLE SEARCH CONSOLE (15 minuti)

### Step 1: Verifica Proprietà Sito

1. **Vai su:** https://search.google.com/search-console
2. **Click:** "Aggiungi proprietà"
3. **Inserisci:** `https://platophilosophy.com`
4. **Scegli metodo verifica:** HTML tag (più semplice)

### Step 2: Ottieni Codice Verifica

Il sistema ti darà un codice simile a:
```html
<meta name="google-site-verification" content="ABC123XYZ456..." />
```

### Step 3: Aggiungi Codice a index.html

Apri `/index.html` e aggiungi il meta tag nella sezione `<head>`, dopo i meta tag esistenti:

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Google Search Console Verification -->
  <meta name="google-site-verification" content="IL_TUO_CODICE_QUI" />

  <title>PLATO — Discover Plato, learn philosophy step by step</title>
  ...
</head>
```

### Step 4: Deploy e Verifica

1. **Deploy il sito** con il nuovo codice
2. **Torna a Search Console**
3. **Click "Verifica"**
4. ✅ Dovresti vedere: "Proprietà verificata"

### Step 5: Submit Sitemap

1. Nel menu laterale: **Sitemaps**
2. **Aggiungi nuovo sitemap**
3. **Inserisci:** `https://platophilosophy.com/sitemap.xml`
4. **Click "Invia"**

**Risultato atteso:**
- Stato: "Riuscito"
- Google inizierà a indicizzare le pagine in 3-7 giorni

---

## 📊 FASE 2: GOOGLE ANALYTICS 4 (20 minuti)

### Step 1: Crea Account

1. **Vai su:** https://analytics.google.com
2. **Click:** "Inizia a misurare"
3. **Nome account:** "Plato Philosophy"
4. **Next**

### Step 2: Crea Proprietà

1. **Nome proprietà:** "platophilosophy.com"
2. **Fuso orario:** Europe/Paris (o il tuo)
3. **Valuta:** EUR
4. **Next**

### Step 3: Informazioni Attività

1. **Settore:** Education
2. **Dimensioni azienda:** Small (1-10)
3. **Utilizzo:** "Measure customer engagement"
4. **Next**

### Step 4: Crea Flusso di Dati

1. **Piattaforma:** Web
2. **URL sito web:** `https://platophilosophy.com`
3. **Nome dello stream:** "Plato Website"
4. **Click "Crea stream"**

### Step 5: Ottieni Measurement ID

Vedrai un ID simile a: `G-ABC1234567`

**COPIA QUESTO ID!**

### Step 6: Aggiungi Codice Tracking a TUTTI i File HTML

Crea uno snippet da copiare in OGNI file HTML, subito prima di `</head>`:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC1234567"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ABC1234567', {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure'
  });
</script>
```

**File da aggiornare (32 totali):**
- index.html
- resources.html
- roadmap.html
- privacy.html
- terms.html
- 404.html
- beginner/ (6 files)
- resources/guides/ (4 files)
- resources/references/ (2 files)
- resources/platophilosophy/ (12 files)

**Opzione rapida:** Usa "trova e sostituisci" nel tuo editor:
- Cerca: `</head>`
- Sostituisci con: `[codice GA qui]\n</head>`

### Step 7: Test Installazione

1. **Deploy il sito**
2. **Visita:** `https://platophilosophy.com`
3. **Apri DevTools** (F12)
4. **Console tab:** Non dovresti vedere errori GA
5. **Torna a Google Analytics**
6. **Real-time report:** Dovresti vedere "1 user now"

✅ Se vedi il tuo visit in real-time, funziona!

---

## 🎨 FASE 3: OPEN GRAPH IMAGES (2 ore) - OPZIONALE MA FORTEMENTE RACCOMANDATO

### Perché Serve?

Quando condividi link su Facebook, LinkedIn, WhatsApp, Twitter:
- **SENZA OG image:** Solo testo grigio, brutto, nessuno clicca
- **CON OG image:** Preview bellissimo, +300% click-through rate

### Tool Consigliato: Canva

**Free tier è sufficiente!**

### Step 1: Setup Template

1. **Vai su:** https://canva.com
2. **Crea design personalizzato:** 1200 x 630 px
3. **Stile suggerito:**
   - Background: Gradiente scuro (#1a1f26 → #0d1116)
   - Φ symbol grande (200px) a sinistra o centro
   - Titolo pagina in grande
   - "platophilosophy.com" piccolo in basso
   - Colore accento: #d8c18a (oro/beige)

### Step 2: Crea Variazioni (minimo 5 prioritarie)

**Priorità ALTA (crea queste per prime):**
1. `og-home.jpg` → "Discover Plato. Learn through dialogue."
2. `og-beginner-path.jpg` → "Beginner's Path to Philosophy"
3. `og-timeline.jpg` → "Plato's Life Timeline (428-348 BC)"
4. `og-start-here.jpg` → "Start Here - Introduction to Plato"
5. `og-life-index.jpg` → "Plato's Life - Complete Biography"

**Opzionale (quando hai tempo):**
- og-family-birth.jpg
- og-trial-socrates.jpg
- og-academy.jpg
- etc.

### Step 3: Upload Images

Crea cartella: `/assets/images/og/`

Upload tutte le immagini .jpg nella cartella

### Step 4: Aggiungi ai Meta Tags

Per ogni pagina HTML, aggiungi dopo i meta tag OpenGraph esistenti:

**Esempio per index.html:**
```html
<meta property="og:image" content="https://platophilosophy.com/assets/images/og/og-home.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Plato Philosophy - Discover Plato and learn philosophy step by step" />
```

**Esempio per timeline.html:**
```html
<meta property="og:image" content="https://platophilosophy.com/assets/images/og/og-timeline.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Interactive timeline of Plato's life from 428 BC to 348 BC" />
```

### Step 5: Test OG Images

1. **Facebook Debugger:** https://developers.facebook.com/tools/debug/
2. **Inserisci URL:** `https://platophilosophy.com`
3. **Fetch new information**
4. ✅ Dovresti vedere preview con immagine

**Se l'immagine non appare:**
- Verifica che l'URL sia assoluto (https://...)
- Verifica che l'immagine sia 1200x630px
- Click "Scrape Again" per pulire cache

---

## 🎯 FASE 4: FAVICON SET (30 minuti) - OPZIONALE

### Perché Serve?

- Tab del browser mostra icona Φ invece di default
- Bookmark mostra logo
- iOS/Android home screen icon
- Professional touch

### Step 1: Crea Immagine Base

Crea un'immagine 512x512px:
- Background: Trasparente o #1a1f26
- Φ symbol centrato, bianco o gold (#d8c18a)

Salva come PNG

### Step 2: Genera Set Completo

1. **Vai su:** https://realfavicongenerator.net
2. **Upload la tua immagine 512x512px**
3. **Personalizza:**
   - iOS: Background #1a1f26
   - Android: Theme color #1a1f26
   - Windows tile: Background #d8c18a
4. **Generate**
5. **Download il package zip**

### Step 3: Upload Files

Estrai lo zip e upload in `/assets/images/`:
- favicon.ico
- favicon-16x16.png
- favicon-32x32.png
- apple-touch-icon.png
- android-chrome-192x192.png
- android-chrome-512x512.png
- site.webmanifest

### Step 4: Aggiungi a HTML

Aggiungi in `<head>` di TUTTI i file HTML (dopo i meta tags):

```html
<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/images/apple-touch-icon.png">
<link rel="manifest" href="/assets/images/site.webmanifest">
<meta name="theme-color" content="#1a1f26">
<meta name="msapplication-TileColor" content="#1a1f26">
```

### Step 5: Test

1. **Deploy**
2. **Visita sito**
3. ✅ Tab del browser dovrebbe mostrare icona Φ
4. ✅ Aggiungi a bookmark: dovrebbe avere icona

---

## ✅ FASE 5: VALIDAZIONE E TEST (30 minuti)

### Test 1: Schema.org Validator

1. **Vai su:** https://validator.schema.org
2. **Test URL:** `https://platophilosophy.com`
3. ✅ 0 errori, 0 warnings
4. Ripeti per:
   - /beginner/why-philosophy.html
   - /resources/platophilosophy/timeline.html

### Test 2: Google Rich Results Test

1. **Vai su:** https://search.google.com/test/rich-results
2. **Test URL:** `https://platophilosophy.com`
3. ✅ Dovrebbe dire "Page is eligible for rich results"
4. ✅ Tipi rilevati: Website, Organization

### Test 3: Mobile-Friendly Test

1. **Vai su:** https://search.google.com/test/mobile-friendly
2. **Test URL:** `https://platophilosophy.com`
3. ✅ "Page is mobile-friendly"

### Test 4: PageSpeed Insights

1. **Vai su:** https://pagespeed.web.dev
2. **Test URL:** `https://platophilosophy.com`
3. **Target:**
   - Mobile: >80
   - Desktop: >90

Se sotto target, ottimizza:
- Comprimi immagini
- Minify CSS/JS
- Enable caching

### Test 5: OpenGraph Preview

**Facebook:**
- https://developers.facebook.com/tools/debug/
- Test 3-4 URL diverse
- ✅ Preview con immagine

**Twitter:**
- https://cards-dev.twitter.com/validator
- Test homepage
- ✅ Summary large image card

---

## 📈 FASE 6: MONITORAGGIO (Ongoing)

### Settimana 1-2

**Google Search Console:**
- Vai ogni 2-3 giorni
- Controlla "Coverage" → Quante pagine indicizzate?
- Target: 32/32 pagine indicizzate entro 2 settimane

**Google Analytics:**
- Controlla Real-time: Ci sono visitatori?
- Acquisition → Traffic sources
- Pages → Quali pagine più visitate?

### Mese 1

**Search Console:**
- Performance → Search queries: Quali keyword portano traffic?
- Click-through rate: Media >2%?
- Average position: In calo (buono) o in salita (male)?

**Analytics:**
- Users: Target 50-200 nel primo mese
- Bounce rate: Target <70%
- Avg session duration: Target >2 minuti
- Waitlist signups: Track conversions

### Mese 2-3

**Keyword Tracking:**

Monitora posizioni per:
- "Plato biography"
- "Plato philosophy explained"
- "Learn about Plato"
- "Socratic method"
- "Theory of Forms"

Use: https://www.google.com/search (incognito mode)

**Backlinks:**

Cerca menzioni del sito:
- `site:reddit.com platophilosophy`
- `site:twitter.com platophilosophy`

**Goal:** 5-10 backlinks di qualità nel primo anno

---

## 🆘 TROUBLESHOOTING

### Problema: "Pagine non indicizzate dopo 2 settimane"

**Soluzioni:**
1. Verifica robots.txt: `https://platophilosophy.com/robots.txt`
2. Verifica sitemap: `https://platophilosophy.com/sitemap.xml`
3. Search Console → URL Inspection → Richiedi indicizzazione manuale
4. Controlla errori in Coverage report

### Problema: "Schema.org errors"

**Soluzioni:**
1. Usa validator.schema.org
2. Controlla syntax JSON (jsonlint.com)
3. Verifica che tutti i campi required siano presenti
4. Fix errors, redeploy, retest

### Problema: "OG image non appare su Facebook"

**Soluzioni:**
1. FB Debugger → Scrape Again
2. Verifica image URL assoluto (https://...)
3. Verifica che immagine sia 1200x630px
4. Check image accessible (not 404)
5. Wait 24h per cache FB

### Problema: "Analytics non traccia visite"

**Soluzioni:**
1. DevTools → Console: Cerca errori GA
2. Verifica Measurement ID corretto
3. Controlla blockers (AdBlock, Privacy Badger)
4. Test in incognito mode
5. Real-time report: Vai sul sito, aspetta 30 sec

---

## 📊 RISULTATI ATTESI

### Settimana 1-2
- ✅ Google indicizza homepage
- ✅ 5-10 pagine indicizzate
- ✅ Analytics funzionante
- ⏳ 10-50 visite organiche

### Mese 1
- ✅ Tutte 32 pagine indicizzate
- ✅ Prime search queries appaiono
- ✅ 50-200 visite organiche
- ✅ Waitlist: 5-20 signups

### Mese 2-3
- ✅ Rankings per long-tail keywords
- ✅ 200-500 visite organiche
- ✅ Featured snippets possibili
- ✅ Prime condivisioni social

### Anno 1 Target
- ✅ 500-2,000 visite/mese organiche
- ✅ Page 1 Google per 5-10 keywords
- ✅ 5-10 backlinks di qualità
- ✅ 200-500 waitlist signups

---

## 💰 COSTI

**Obbligatori:**
- Google Search Console: €0
- Google Analytics: €0
- Schema.org: €0

**Opzionali:**
- Canva Pro (OG images): €12/mese (free tier ok)
- Plausible Analytics (privacy-focused alternative to GA): €9/mese

**TOTALE OBBLIGATORIO: €0**

---

## 📚 RISORSE UTILI

- **Google Search Central:** https://developers.google.com/search
- **Schema.org Docs:** https://schema.org/Article
- **Moz Beginner Guide:** https://moz.com/beginners-guide-to-seo
- **Web.dev Learn SEO:** https://web.dev/learn/seo
- **Ahrefs Academy:** https://ahrefs.com/academy (free courses)

---

## ✅ CHECKLIST FINALE

Prima di considerare SEO completo:

### Technical
- [ ] Google Search Console verificato
- [ ] Sitemap.xml submitted
- [ ] 32/32 pagine indicizzate
- [ ] robots.txt accessibile
- [ ] 404.html funzionante

### Analytics
- [ ] Google Analytics installato su tutte le pagine
- [ ] Real-time tracking funziona
- [ ] Conversions tracked (waitlist signups)

### On-Page (Opzionale ma raccomandato)
- [ ] OG images create (minimo 5 prioritarie)
- [ ] Favicon set completo
- [ ] Tutti i meta tag ottimizzati

### Validation
- [ ] Schema.org validator: 0 errori
- [ ] Rich Results test: Eligible
- [ ] Mobile-friendly test: Pass
- [ ] PageSpeed >80 mobile, >90 desktop

### Monitoring Setup
- [ ] Google Analytics dashboard familiarità
- [ ] Search Console weekly check schedulato
- [ ] Keyword tracking list creata

---

**PRONTO PER IL LANCIO! 🚀**

Una volta completati questi step, il tuo sito sarà ottimizzato per:
- Indicizzazione veloce (3-7 giorni)
- Rich snippets in Google
- Ottimo engagement social
- Tracking accurato delle performance

**Buona fortuna con il lancio!**
