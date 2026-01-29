# 🏛️ PLATO — Philosophy Dialogue Platform

**Website:** [platophilosophy.com](https://platophilosophy.com)  
**Status:** In Development (26% Complete)  
**Last Updated:** January 28, 2026

---

## 📖 About

PLATO is an educational platform for studying Platonic philosophy through:
- **Comprehensive Resources:** 50 pages of academically rigorous content on Plato's life, philosophy, and dialogues
- **AI Dialogue Experience:** Engage with Plato in 373 BC using Claude AI (Anthropic)
- **Authentic Historical Context:** Historically accurate, academically reviewed content

**Mission:** Make ancient philosophy accessible through clear paths for beginners and deeper routes for advanced readers.

---

## 🎯 Project Structure

### Current Status (13/50 pages complete)

#### ✅ Part 1: Plato's Life (12/12 pages — COMPLETE)
1. `athens-in-428-bc.html` — Athens at Plato's birth
2. `family-and-birth.html` — Aristocratic heritage
3. `youth-and-education.html` — Early education (mousikē & gymnastikē)
4. `meeting-socrates.html` — The defining relationship (408 BC)
5. `trial-of-socrates.html` — Socrates' execution (399 BC)
6. `travels.html` — Mediterranean journey (399-387 BC)
7. `founding-academy.html` — Establishing the Academy (387 BC)
8. `sicilian-adventures.html` — Failed attempts at philosopher-king
9. `later-years.html` — Final dialogues and maturity (360-348 BC)
10. `death-and-legacy.html` — Death and 2,400 years of influence
11. `timeline.html` — Chronological reference

#### ⏳ Part 2: Plato's Philosophy (0/15 pages)
- Theory of Forms
- Epistemology
- The Soul
- Ethics & Virtue
- Political Philosophy

#### ⏳ Part 3: The Dialogues (0/8 pages)
- Reading Guides
- Character Analysis
- Chronology

#### ⏳ Part 4: Context & Method (0/7 pages)
- Ancient Greece
- Greek Language Essentials
- Socratic Method

#### ⏳ Part 5: Reference (0/8 pages)
- Glossary
- Timeline
- Further Reading

#### ✅ Legal Pages (2/2 — COMPLETE)
- `privacy.html` — GDPR compliant privacy policy
- `terms.html` — Terms of service (App Store ready)

---

## 🎨 Design System

### Color Palette
```css
/* Dark Theme (Default) */
--bg: #0b0f14;              /* Background */
--text: rgba(255,255,255,.92);  /* Primary text */
--accent: #d8c18a;          /* Gold accent */
--panel: rgba(255,255,255,.06);  /* Card backgrounds */

/* Light Theme */
--bg: #f6f3ea;              /* Warm light background */
--accent: #8a6a2b;          /* Darker gold */
```

### Typography
- **Sans:** System UI fonts (`ui-sans-serif, system-ui, -apple-system`)
- **Serif:** Classic serif stack (`ui-serif, Iowan Old Style, Palatino, Georgia`)
- **Base size:** 18px (large, readable)

### Components
- **Cards:** Glass-morphism style with subtle borders
- **Buttons:** Pill-shaped with gradient backgrounds
- **Navigation:** Sticky header with backdrop blur
- **Layout:** Max-width 1280px, responsive grid

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Grid, Flexbox
- **Vanilla JavaScript** — No frameworks (intentionally simple)

### Deployment
- **GitHub Pages** or **Netlify** (recommended)
- **Domain:** platophilosophy.com (registered)
- **SSL:** Automatic via hosting platform

### Future (Mobile App)
- React Native + Expo
- Firebase (Auth, Firestore)
- Anthropic Claude API
- RevenueCat (Payments)

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/[username]/platophilosophy.com.git
cd platophilosophy.com
```

### 2. Local Development

#### Option A: VS Code Live Server (Recommended)
1. Install [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `index.html` → "Open with Live Server"
3. Opens at `http://127.0.0.1:5500`

#### Option B: Python HTTP Server
```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

#### Option C: Node.js http-server
```bash
npx http-server -p 8000
```

### 3. File Structure
```
platophilosophy.com/
├── index.html              # Homepage
├── main.css               # Global styles
├── start-here.html        # Introduction page
│
├── Part 1: Life/
│   ├── athens-in-428-bc.html
│   ├── family-and-birth.html
│   ├── youth-and-education.html
│   ├── meeting-socrates.html
│   ├── trial-of-socrates.html
│   ├── travels.html
│   ├── founding-academy.html
│   ├── sicilian-adventures.html
│   ├── later-years.html
│   ├── death-and-legacy.html
│   └── timeline.html
│
├── Legal/
│   ├── privacy.html
│   └── terms.html
│
├── Assets/
│   ├── css/
│   │   └── main.css
│   └── images/
│       └── geo-grid.svg
│
└── docs/                  # Documentation
    ├── RESOURCES_OUTLINE.md
    ├── LIFE_SECTION_COMPLETE.md
    └── README.md
```

---

## 📝 Content Guidelines

All pages follow strict academic standards:

### Writing Standards
- ✅ **Word Count:** 450-800 words per page
- ✅ **Sources:** Primary sources cited (Diogenes Laertius, Plato's dialogues, Plutarch)
- ✅ **Accessibility:** Master-level content, undergraduate readability
- ✅ **Greek Terms:** Proper transliteration with explanations
  - Example: μουσική (mousikē) — cultural education: poetry, music, rhetoric

### Technical Standards
- ✅ **Semantic HTML5:** Proper heading hierarchy, ARIA labels
- ✅ **Responsive Design:** Mobile-first, tested on iOS/Android
- ✅ **Performance:** No external dependencies, fast load times
- ✅ **SEO:** Meta descriptions, Open Graph tags
- ✅ **Accessibility:** WCAG 2.1 AA compliant

---

## 🎓 Academic Sources

### Primary Sources
- Plato's Dialogues (complete works)
- Diogenes Laertius, *Lives of Eminent Philosophers* (Book III)
- Aristotle, *Metaphysics* (references to Plato)
- Plutarch, *Life of Dion*, *Life of Pericles*

### Secondary Sources
- Stanford Encyclopedia of Philosophy
- Cambridge Ancient History
- Modern scholarship (cited where relevant)

### Translation Standards
- Greek terms: Transliterated (no raw Greek characters in body text)
- Proper nouns: Anglicized where conventional (Plato not Plátōn)
- Technical terms: Greek + transliteration + English explanation

---

## 🚢 Deployment

### Deploy to Netlify (Recommended)
1. **Connect Repository:**
   ```bash
   # On Netlify Dashboard
   New site from Git → Choose repository
   ```

2. **Build Settings:**
   - Build command: (leave empty)
   - Publish directory: `/` (root)

3. **Custom Domain:**
   - Add `platophilosophy.com`
   - Configure DNS (Netlify provides instructions)
   - SSL auto-configured

### Deploy to GitHub Pages
```bash
# Settings → Pages → Source: Deploy from branch
# Branch: main → Root

# Access at: https://[username].github.io/platophilosophy.com
```

### Custom Domain Setup
1. Add `CNAME` file with domain name
2. Configure DNS A records:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

---

## 📊 Progress Tracking

### Overall: 26% Complete (13/50 pages)

| Section | Status | Pages | Progress |
|---------|--------|-------|----------|
| **Part 1: Life** | ✅ Complete | 12/12 | 100% |
| **Part 2: Philosophy** | ⏳ In Progress | 0/15 | 0% |
| **Part 3: Dialogues** | 📅 Planned | 0/8 | 0% |
| **Part 4: Context** | 📅 Planned | 0/7 | 0% |
| **Part 5: Reference** | 📅 Planned | 0/8 | 0% |
| **Legal Pages** | ✅ Complete | 2/2 | 100% |

### Milestones
- [x] Domain registered (platophilosophy.com)
- [x] Design system complete
- [x] Part 1 (Life) complete (12 pages)
- [x] Legal pages (Privacy, Terms)
- [ ] Part 2 (Philosophy) — 5 core pages needed for MVP
- [ ] Deployment to production
- [ ] SEO optimization (sitemap, robots.txt)
- [ ] Google Analytics integration

---

## 🔜 Next Steps

### Immediate (This Week)
1. **Deploy Part 1** to production (Netlify)
2. **Create Pages 13-17** (Philosophy core):
   - The Central Question
   - Theory of Forms
   - The Form of the Good
   - Epistemology
   - Anamnesis
3. **Add sitemap.xml** and **404.html**
4. **Launch waitlist campaign** (Goal: 100 emails in 2 weeks)

### Short-term (Next Month)
5. Complete Part 2 (Philosophy) — remaining 10 pages
6. Begin Part 3 (Dialogues) — reading guides
7. Add visual elements (diagrams, family trees, maps)
8. User testing and feedback collection

### Long-term (Q2 2026)
9. Complete all 50 pages
10. Launch mobile app (iOS + Android)
11. Integrate AI dialogue feature (Claude API)
12. Academic partnerships for validation

---

## 💰 Budget

**Total Budget:** €500  
**Spent:** €14 (domain)  
**Remaining:** €486

### Allocation
- ✅ Domain: €11 (platophilosophy.com) + €3 (privacy protection)
- 📅 Apple Developer: €89/year (for iOS app)
- 📅 Google Play: €23 (one-time)
- 📅 Anthropic API: ~€18/month (for dialogue feature)
- 📅 Development: €356 remaining

---

## 🤝 Contributing

This is currently a solo project, but contributions are welcome for:
- **Content Review:** Academic fact-checking
- **Translation:** Greek term verification
- **Design:** Accessibility improvements
- **Bug Reports:** Broken links, typos

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -m 'Add improvement'`)
4. Push to branch (`git push origin feature/improvement`)
5. Open a Pull Request

---

## 📜 License

**Content:** © 2026 platophilosophy.com — All rights reserved  
**Code:** MIT License (HTML/CSS/JS)

The educational content (text of pages) is proprietary. The code structure and design system may be used with attribution.

---

## 📧 Contact

- **Website:** [platophilosophy.com](https://platophilosophy.com)
- **Email:** contact@platophilosophy.com
- **Issues:** [GitHub Issues](https://github.com/[username]/platophilosophy.com/issues)

---

## 🙏 Acknowledgments

- **Primary Sources:** Plato, Diogenes Laertius, Plutarch
- **Academic Resources:** Stanford Encyclopedia of Philosophy
- **Design Inspiration:** Ancient Greek architecture and aesthetics
- **AI Assistance:** Claude (Anthropic) for content generation and technical architecture

---

**Built with ❤️ for philosophy students worldwide**

*"All of Western philosophy is but a footnote to Plato."* — Alfred North Whitehead
