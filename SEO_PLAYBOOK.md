# Vertex — Ranking Playbook

Everything in this file is a task **you** do, in a browser, without touching code.
The code side is finished and documented in
`src/_project-state/session-seo-aeo-structured-data_2026-07-18.md`.

Work top to bottom. Week 1 is where almost all the value is.

---

## Before anything else: deploy

None of this works against an old build.

```bash
npm run build     # must pass
git add -A && git commit -m "SEO: structured data, llms.txt, metadata"
git push          # Vercel deploys automatically
```

Then confirm these four URLs load in a browser:

- `https://vertexconsulting.mk/robots.txt`
- `https://vertexconsulting.mk/sitemap.xml`
- `https://vertexconsulting.mk/llms.txt`
- `https://vertexconsulting.mk/llms-full.txt`

If any 404s, stop and fix that first. Everything below depends on them.

---

# Week 1 — the foundation

## 1. Google Search Console (30 min, non-negotiable)

This is the single most important account you will create. It is how Google
tells you what it thinks of your site.

1. Go to **search.google.com/search-console** → *Add property*.
2. Choose **Domain** (not URL prefix). Enter `vertexconsulting.mk`.
3. Google gives you a TXT record. Add it in **Cloudflare** → DNS → Add record:
   - Type: `TXT`
   - Name: `@`
   - Content: the string Google gave you
4. Back in Search Console, click *Verify*. DNS can take up to an hour.
5. Once verified: **Sitemaps** in the left sidebar → enter `sitemap.xml` → Submit.
6. **URL Inspection** (top search bar) → paste each of these → *Request Indexing*:

   ```
   https://vertexconsulting.mk/en
   https://vertexconsulting.mk/mk
   https://vertexconsulting.mk/en/consulting/business-consulting
   https://vertexconsulting.mk/mk/consulting/business-consulting
   https://vertexconsulting.mk/en/marketing/web-design
   https://vertexconsulting.mk/mk/marketing/web-design
   https://vertexconsulting.mk/en/contact
   ```

   There is a daily quota of roughly 10. Do the rest tomorrow.

> **Alternative verification, if DNS gives you trouble:** Search Console also
> offers an "HTML tag" method. Copy just the `content="..."` value, add it in
> Vercel → Settings → Environment Variables as `GOOGLE_SITE_VERIFICATION`, and
> redeploy. The tag appears automatically. Domain verification is still better
> — it covers every subdomain at once.

## 2. Google Business Profile (30 min — the biggest single lever)

For "business consultant Strumica" style searches, **this outranks your
website.** The map pack sits above the blue links. You are invisible there
right now.

1. **business.google.com** → *Manage now* → *Add your business*.
2. Name: **Vertex Consulting** — exactly as it appears on the website. Do not
   append keywords; Google suspends profiles for that.
3. Category: **Business management consultant**. Secondary categories:
   *Marketing agency*, *Website designer*, *Computer consultant*.
4. Address: `ул. Младинска 43, Струмица`. Match the site character for
   character — this consistency is what "NAP consistency" means and Google
   checks it.
5. Phone: `+389 70 214 033`. Website: `https://vertexconsulting.mk`.
6. Hours: Mon–Fri 09:00–17:00.
7. Google mails a postcard with a verification code to the Strumica address.
   It takes 1–2 weeks. Start this early — everything else waits on it.

Once verified:

- Upload **at least 10 photos**: office exterior, office interior, Goran, the
  team, work in progress. Profiles with photos get meaningfully more calls.
- Write the description using the words customers search for: *бизнис
  консалтинг*, *дигитален маркетинг*, *веб дизајн*, *Струмица*.
- Add each of your 8 services as a **Service** item.
- **Ask your last 5 happy clients for a Google review.** Reviews are the
  strongest local ranking factor there is. Send a direct link — never offer
  anything in exchange, Google catches that.
- Post an update roughly monthly. Recycle blog posts; it takes five minutes.

## 3. Bing Webmaster Tools (10 min)

Bing feeds Microsoft Copilot and, indirectly, some of ChatGPT's search. Small
traffic, disproportionate AI influence.

1. **bing.com/webmasters** → *Import from Google Search Console*. One click,
   it copies everything including verification.
2. Submit `https://vertexconsulting.mk/sitemap.xml`.
3. **Turn on IndexNow** — the code is already written and waiting:
   - Run `openssl rand -hex 16` in a terminal. Copy the output.
   - Vercel → your project → Settings → Environment Variables →
     add `INDEXNOW_KEY` = that string, for all environments.
   - Redeploy.
   - Confirm `https://vertexconsulting.mk/indexnow-key.txt` shows exactly that
     string and nothing else.

   From then on, every blog post you publish is pushed to Bing, Copilot,
   Yandex and Seznam within minutes instead of days. Fully automatic.

## 4. Validate the structured data (10 min)

1. **search.google.com/test/rich-results** → paste
   `https://vertexconsulting.mk/en/consulting/business-consulting`.
   You should see *FAQ*, *Breadcrumbs*, and *Service* detected with no errors.
2. **validator.schema.org** → paste `https://vertexconsulting.mk/en`.
   You should see `Organization`, `ProfessionalService`, `WebSite`, `Person`.
3. Warnings are usually fine. **Errors are not** — send them to me.

---

# Week 2 — proving you exist

Google trusts a business it can find in more than one place. Every listing
below must use the **identical** name, address and phone as your Business
Profile. Inconsistent details actively hurt you.

| Directory | Why |
|---|---|
| **Google Business Profile** | Covered above. The big one. |
| **Bing Places** (bingplaces.com) | Same data, feeds Copilot. Import from Google. |
| **Apple Business Connect** | Apple Maps + Siri. Free, five minutes. |
| **LinkedIn Company Page** | **Create this.** The site currently links to a placeholder, and that placeholder is being filtered out of your schema until it's real. |
| **zk.mk / najdi.mk / bizmk.mk** | Macedonian business directories. Local citations count more in a small market. |
| **Clutch.co** | Where people search for consultancies and agencies. Free profile. |
| **Facebook + Instagram** | Already linked. Make sure the address and hours match exactly. |

**When the LinkedIn page exists**, tell me — it takes a one-line change to
`src/config/site.ts` and it automatically re-enters your `sameAs` schema.

---

# Ongoing — content, which is what actually moves rankings

Structured data helps Google *understand* you. Content is what makes you
*worth ranking*. There is no substitute.

## The rule that matters most

**One page per thing people search for.** Someone searching "како да го
зголемам профитот на мојата фирма" will not land on a page titled "Business
Consulting". They land on a page that answers that exact question.

## Blog cadence

Two posts a month beats eight then nothing. Consistency is a ranking signal;
bursts are not.

Write in **Macedonian first** for local searches, English for the wider market.
Macedonian has far less competition — you can rank on page one for terms that
would be hopeless in English.

## Topics that will actually earn traffic

Each of these is a real search with commercial intent and weak competition:

- Колку чини бизнис консалтинг во Македонија? *(price questions convert best)*
- Како да ги организирам работните процеси во мала фирма
- Дали мојата фирма има потреба од CRM систем?
- Колку чини изработка на веб страна во Македонија?
- AI алатки за мали бизниси во 2026
- Како да изберам дигитална маркетинг агенција

## How to structure a post so AI engines quote it

This matters more every month. ChatGPT, Perplexity and Google's AI Overviews
extract and cite — they do not rank ten links.

1. **Answer in the first two sentences.** AI engines read the opening of a
   section to decide whether it answers the question. Do not warm up.
2. **Use question headings** — the literal question as an `H2`.
3. **Include real numbers.** "Реорганизацијата на процесите ѝ заштеди на
   фирмата 12 часа неделно" gets quoted. "Значително подобрување" does not.
   Roughly one concrete figure every 150–200 words.
4. **Add an FAQ block at the end.** Your FAQ component already emits `FAQPage`
   schema automatically — it is the most-quoted format there is.
5. **Say who you are and when.** "Според нашето искуство со над 40 македонски
   фирми од 2018" is the kind of first-hand authority both Google's E-E-A-T
   system and AI engines weight heavily.

## Backlinks, honestly

You need other Macedonian sites linking to you. There is no clever shortcut.

- Write a guest post for a Macedonian business publication.
- Get listed by the Strumica chamber of commerce or a local business association.
- Sponsor something local — sponsors get a link.
- Ask clients whose sites you built for a "изработено од Vertex" footer credit.

**Never buy links.** In a market this small, Google will notice.

---

# Monthly, 20 minutes

1. **Search Console → Performance.** Which queries show you? Where are you
   ranked 5–15? Those are the pages worth improving — a page at position 11
   moved to 8 is worth more than any new page.
2. **Search Console → Indexing.** Anything excluded that shouldn't be?
3. **Business Profile.** Reply to every review, good or bad. Post one update.
4. **AI citation check.** Ask ChatGPT, Perplexity and Google AI Mode:
   *"business consultant in Strumica Macedonia"*, *"бизнис консалтинг
   Македонија"*, *"веб дизајн Струмица"*. Note whether you appear and who does.
   This is the AI-era equivalent of checking your rank, and nobody's dashboard
   tracks it for you yet.
5. Search `site:vertexconsulting.mk` in Google. The count should climb.

---

# Expectations, plainly

| When | What |
|---|---|
| Days 1–3 | Pages start appearing in Google. Bing within hours via IndexNow. |
| Weeks 2–4 | Rankings for your own brand name. Rich results begin showing. |
| Weeks 4–8 | Business Profile verified; you enter the local map pack. This is usually where the first real calls come from. |
| Months 2–4 | Long-tail blog traffic begins if you publish consistently. |
| Months 4–6 | Competitive terms become reachable — *if* the content and links exist. |
| Months 3–6 | AI engines start citing you. Depends heavily on third-party mentions, not just your own site. |

Anyone promising faster than this in a market with real competitors is
guessing or lying.

---

# Where things live in the code

| Concern | File |
|---|---|
| Company name, address, phone, socials | `src/config/site.ts` |
| All page titles and descriptions | `messages/en.json`, `messages/mk.json` (`*.meta`) |
| Structured data / JSON-LD | `src/lib/schema.ts` |
| Which pages are in the sitemap | `src/app/sitemap.ts` |
| Crawler rules | `src/app/robots.ts` |
| LLM index files | `src/app/llms.txt/`, `src/app/llms-full.txt/` |
| IndexNow | `src/lib/indexnow.ts` |

Change the address or phone in `src/config/site.ts` and it updates the schema,
`llms.txt` and the contact page together. One edit, one place.

---

**Sources for the AEO guidance in this document:**
[IndexNow documentation](https://www.indexnow.org/documentation) ·
[Bing IndexNow setup](https://www.bing.com/indexnow/getstarted) ·
[AEO 2026 practices — Powered by Search](https://www.poweredbysearch.com/blog/aeo-llm-seo-best-practices/) ·
[AEO practical playbook — ALM Corp](https://almcorp.com/blog/answer-engine-optimization-2026/)
