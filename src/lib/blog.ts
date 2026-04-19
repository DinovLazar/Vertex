import type { Locale } from '@/i18n/routing'

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  authorRole: string
  publishedAt: string
  readTime: number
  division: 'consulting' | 'marketing' | 'shared'
  tags: string[]
}

type BlogPostRecord = Record<Locale, BlogPost>

/**
 * Locale-keyed blog posts. Slugs are locale-neutral (the same URL segment on
 * `/en/blog/[slug]` and `/mk/blog/[slug]`), but every human-facing field —
 * title, excerpt, body, authorRole, tags — is translated per locale.
 * `publishedAt` and `readTime` are language-invariant.
 *
 * Phase 13 swaps this mock for Sanity CMS. Function signatures must stay
 * intact so consumers don't need changes.
 */
const mockPostsBySlug: Record<string, BlogPostRecord> = {
  'five-signs-your-business-needs-a-workflow-overhaul': {
    en: {
      slug: 'five-signs-your-business-needs-a-workflow-overhaul',
      title: 'Five signs your business needs a workflow overhaul',
      excerpt:
        'If your team is always busy but results are flat, the problem is probably your processes — not your people. Here are five clear warning signs.',
      content: `Most small businesses do not have broken workflows. They have workflows that were never designed in the first place. Tasks get done through habit, tribal knowledge, and constant interruptions from the owner. That works when you have three people — it collapses when you have ten.

Here are five clear signs that your business needs a workflow restructuring intervention.

## 1. The owner is involved in every decision

If nothing moves without you personally approving it, your workflows are broken. Healthy businesses delegate decisions based on clear criteria — not based on the owner's mood that day. When every small decision requires your input, you are the bottleneck preventing growth.

## 2. Your team is always busy but results are flat

Busy is not the same as productive. If your team is working long hours, handling constant urgency, and nothing is actually getting better — the work is not structured correctly. Good workflows produce compound results. Bad workflows produce exhaustion.

## 3. Nothing is documented

Ask yourself: if a key team member left tomorrow, could someone new replicate their work? If the answer is no, your business runs on memory instead of systems. Memory breaks, systems do not.

## 4. The same mistakes happen repeatedly

Recurring errors are a system problem, not a people problem. When the same issue keeps happening — missed deadlines, quality problems, lost information — no amount of training or firing individuals will fix it. The workflow itself is flawed.

## 5. New hires take forever to become productive

Onboarding reveals your workflow quality. If new people take months to figure out what they are supposed to do, your processes are not documented, your roles are unclear, and your institutional knowledge is trapped in individual heads.

## What to do next

If three or more of these signs sound familiar, it is time to get outside help. A structured workflow audit can identify the worst problems within two weeks, and a restructuring engagement typically delivers measurable improvements within 60 to 90 days.

At Vertex Consulting, we specialize in exactly this kind of work — see our [Workflow Restructuring service](/consulting/workflow-restructuring) for details.`,
      author: 'Goran Dinov',
      authorRole: 'Owner & Director, Vertex Consulting',
      publishedAt: '2026-03-15',
      readTime: 6,
      division: 'consulting',
      tags: ['workflow', 'operations', 'consulting'],
    },
    mk: {
      slug: 'five-signs-your-business-needs-a-workflow-overhaul',
      title: 'Пет знаци дека на вашиот бизнис му треба преуредување на процесите',
      excerpt:
        'Ако вашиот тим е секогаш зафатен, но резултатите стагнираат, проблемот веројатно е во процесите — не во луѓето. Еве пет јасни предупредувачки знаци.',
      content: `Повеќето мали бизниси немаат расипани процеси. Имаат процеси што никогаш не биле дизајнирани на прво место. Задачите се завршуваат преку навики, племенско знаење и постојани прекини од сопственикот. Тоа работи кога имате тројца луѓе — пропаѓа кога имате десет.

Еве пет јасни знаци дека на вашиот бизнис му треба интервенција за преуредување на процесите.

## 1. Сопственикот е вклучен во секоја одлука

Ако ништо не се движи без ваше лично одобрение, процесите ви се расипани. Здравите бизниси ги делегираат одлуките врз основа на јасни критериуми — не врз основа на расположението на сопственикот тој ден. Кога секоја мала одлука бара ваш влог, вие сте тесното грло што го спречува растот.

## 2. Тимот е секогаш зафатен, но резултатите стагнираат

Зафатено не е исто што и продуктивно. Ако тимот работи долги часови, се справува со постојана итност, а ништо всушност не се подобрува — работата не е правилно структурирана. Добрите процеси даваат сложени резултати. Лошите процеси даваат исцрпеност.

## 3. Ништо не е документирано

Прашајте се: ако клучен член на тимот утре замине, дали некој нов може да ја репродуцира неговата работа? Ако одговорот е не — бизнисот ви функционира на меморија наместо на системи. Меморијата пропаѓа, системите не.

## 4. Истите грешки се повторуваат

Повторливите грешки се системски проблем, не проблем со луѓе. Кога истата работа постојано се случува — пропуштени рокови, проблеми со квалитет, изгубени информации — ниту обуката ниту отпуштањето поединци нема да го поправат тоа. Самиот процес е неисправен.

## 5. На новите вработени им треба цела вечност да станат продуктивни

Воведувањето во работата го открива квалитетот на процесите. Ако на новите луѓе им требаат месеци да сфатат што треба да работат, процесите не ви се документирани, улогите ви се нејасни, а институционалното знаење ви е заробено во поединечни глави.

## Што да направите следно

Ако три или повеќе од овие знаци ви звучат познато, време е за надворешна помош. Структурирана ревизија на процесите може да ги идентификува најлошите проблеми во рок од две недели, а ангажманот за преуредување типично носи мерливи подобрувања во рок од 60 до 90 дена.

Во Vertex Consulting сме специјализирани токму за овој вид работа — видете ја нашата [услуга Преструктуирање на процеси](/consulting/workflow-restructuring) за детали.`,
      author: 'Goran Dinov',
      authorRole: 'Сопственик и директор, Vertex Consulting',
      publishedAt: '2026-03-15',
      readTime: 6,
      division: 'consulting',
      tags: ['процеси', 'операции', 'консалтинг'],
    },
  },
  'why-your-business-website-is-probably-costing-you-customers': {
    en: {
      slug: 'why-your-business-website-is-probably-costing-you-customers',
      title: 'Why your business website is probably costing you customers',
      excerpt:
        'Most business websites in Macedonia are slow, outdated, and mobile-hostile — and their owners have no idea how much business it is costing them.',
      content: `A business website is either earning you customers or costing you customers. There is no neutral state. In 2026, the bar for what qualifies as a "good" website has risen dramatically — and most Macedonian business sites have not kept up.

## The mobile-first reality

Over 70 percent of web traffic now comes from mobile devices. If your website does not work well on a phone — slow to load, awkward to navigate, text too small to read — you are losing the majority of potential customers before they even see what you offer.

Check your own site right now. Open it on your phone. How long does it take to load? Can you easily tap the buttons? Does the text fit without horizontal scrolling? If any answer is "no," you have a problem.

## Speed is money

Google has reported that sites taking longer than 3 seconds to load lose 53 percent of mobile visitors. That is not a minor issue — it means most of the money you spend on marketing goes to people who will never actually see your business because the site gives up before rendering.

Modern websites built with frameworks like Next.js load in under 2 seconds even on slow connections. The technology exists. Most Macedonian businesses just have not updated yet.

## SEO is a technology problem too

Search engine rankings are heavily influenced by technical factors: site speed, mobile optimization, proper HTML structure, and structured data. An older website, even with great content, cannot compete against a technically modern site. You can write better content than your competitors and still lose because your site loads slowly.

## The conversion problem

Beyond speed and SEO, older websites simply do not know how to convert visitors into leads. Modern sites have clear calls-to-action, strategic positioning of contact forms, and optimized user flows. Your old site probably has none of this — resulting in visitors who came from Google, looked around, and left without ever contacting you.

## What a modern rebuild delivers

A properly rebuilt website using 2026 technology delivers: sub-2-second load times on any device, Lighthouse performance scores above 90, full SEO optimization baked into the code, mobile-first design that actually works on phones, clear conversion paths that turn visitors into leads, and a content management system so you can update text yourself.

The cost is usually less than a single month of ineffective Google Ads.

## Getting started

If you are ready to stop losing customers to a bad website, [our Web Design service](/marketing/web-design) is where to start. We build modern, fast, conversion-focused sites for Macedonian businesses.`,
      author: 'Lazar',
      authorRole: 'Web Development & AI, Vertex Marketing',
      publishedAt: '2026-03-22',
      readTime: 7,
      division: 'marketing',
      tags: ['web design', 'marketing', 'performance'],
    },
    mk: {
      slug: 'why-your-business-website-is-probably-costing-you-customers',
      title: 'Зошто вашата бизнис веб страница веројатно ве чини клиенти',
      excerpt:
        'Повеќето бизнис веб страници во Македонија се бавни, застарени и непријателски кон мобилни уреди — а сопствениците немаат поим колку бизнис ги чини тоа.',
      content: `Бизнис веб страницата или ви носи клиенти, или ве чини клиенти. Нема неутрална состојба. Во 2026, летвата за она што се квалификува како "добра" веб страница драматично се подигна — а повеќето македонски бизнис страници не го следат чекорот.

## Реалноста на mobile-first

Повеќе од 70 проценти од веб сообраќајот сега доаѓа од мобилни уреди. Ако страницата не работи добро на телефон — се вчитува бавно, се навигира незгодно, текстот е премал за читање — ги губите мнозинството потенцијални клиенти пред воопшто да видат што нудите.

Проверете ја сопствената страница токму сега. Отворете ја на телефон. Колку трае да се вчита? Можете ли лесно да ги допрете копчињата? Текстот се собира без хоризонтално скролање? Ако било кој одговор е "не", имате проблем.

## Брзината е пари

Google известил дека страниците на кои им треба повеќе од 3 секунди да се вчитаат губат 53 проценти од мобилните посетители. Тоа не е мал проблем — тоа значи дека повеќето пари што ги трошите на маркетинг одат кај луѓе што никогаш нема вистински да го видат бизнисот бидејќи страницата се откажува пред да рендерира.

Модерни веб страници изградени со рамки како Next.js се вчитуваат за помалку од 2 секунди дури и на бавни врски. Технологијата постои. Повеќето македонски бизниси едноставно не се ажурирале.

## SEO исто така е технолошки проблем

Ранг на пребарувачите силно зависи од технички фактори: брзина на страницата, мобилна оптимизација, правилна HTML структура и структурирани податоци. Постара веб страница, дури и со одлична содржина, не може да се натпреварува со технички модерна страница. Можете да напишете подобра содржина од конкурентите и сепак да изгубите затоа што вашата страница се вчитува бавно.

## Проблемот со конверзија

Покрај брзината и SEO, постарите веб страници едноставно не знаат како да ги претворат посетителите во леадови. Модерните страници имаат јасни повици на акција, стратешко позиционирање на контакт форми и оптимизирани кориснички патеки. Старата страница веројатно ништо од ова нема — што резултира со посетители што дошле од Google, погледнале и заминале без никогаш да контактираат.

## Што носи модерна повторна изработка

Правилно повторно изградена страница со технологија од 2026 носи: време на вчитување под 2 секунди на било кој уред, Lighthouse резултати над 90, целосна SEO оптимизација вградена во кодот, mobile-first дизајн што навистина работи на телефони, јасни патеки за конверзија што ги претвораат посетителите во леадови, и систем за управување со содржина за сами да можете да ажурирате текст.

Цената е обично помала од еден месец неефикасни Google реклами.

## Како да започнете

Ако сте подготвени да престанете да губите клиенти поради лоша веб страница, [нашата услуга Веб дизајн](/marketing/web-design) е местото каде да започнете. Градиме модерни, брзи, конверзиски фокусирани страници за македонски бизниси.`,
      author: 'Lazar',
      authorRole: 'Веб развој и AI, Vertex Marketing',
      publishedAt: '2026-03-22',
      readTime: 7,
      division: 'marketing',
      tags: ['веб дизајн', 'маркетинг', 'перформанси'],
    },
  },
  'the-practical-guide-to-ai-tools-for-small-business-2026': {
    en: {
      slug: 'the-practical-guide-to-ai-tools-for-small-business-2026',
      title: 'The practical guide to AI tools for small business in 2026',
      excerpt:
        'Cut through the AI hype. Here is what actually works for small and mid-size Macedonian businesses — and what is still not worth the effort.',
      content: `AI is having a moment — again — and business owners are being bombarded with sales pitches for AI tools. Most of them will not help you. A few will genuinely change how your business operates. Here is how to tell the difference.

## What AI is genuinely good at right now

In 2026, there are a handful of AI use cases that have matured enough to deliver real business value reliably. These are worth investing in:

**Document processing** — extracting data from invoices, contracts, and forms is now highly accurate. If your business handles paperwork, AI can automate 80 percent of the manual data entry work.

**Customer communication** — AI-powered chat assistants can handle routine customer questions 24/7 with surprisingly good accuracy. This is especially valuable for businesses that receive the same 20 questions hundreds of times.

**Content drafting** — for reports, emails, social posts, and documentation, AI drafts are now good enough that editing them is faster than writing from scratch.

**Internal knowledge search** — making your company's accumulated knowledge searchable and accessible through AI. Teams stop asking "where is that document?" and start getting direct answers.

## What AI is still bad at

Despite marketing claims, AI still struggles with:

- Work that requires deep contextual judgment about your specific business
- Creative direction that requires human taste and brand understanding
- Tasks where accuracy matters but the AI cannot verify its own work
- Complex multi-step processes without human checkpoints

If anyone sells you a fully autonomous AI solution for any of the above, walk away.

## The Macedonian context

Macedonia has a real opportunity right now. AI adoption is earlier here than in Western Europe, which means first-movers get a genuine competitive advantage. At the same time, the best AI tools work well in English and have improving but imperfect support for Macedonian.

For most Macedonian businesses, we recommend starting with English-language AI tools for internal work (document processing, analysis, drafting) and being more cautious about customer-facing Macedonian-language AI deployments until the models improve further.

## Starting small

The mistake most businesses make is trying to implement too much AI at once. The right approach is to pick one high-impact use case, implement it well, integrate it into your workflow, and only then consider the next opportunity.

At Vertex Consulting, our [AI Consulting service](/consulting/ai-consulting) helps businesses identify the right starting point and implement AI tools that actually deliver value. For more complex custom AI applications, our [AI Development](/marketing/ai-development) team builds tailored solutions from scratch.`,
      author: 'Goran Dinov',
      authorRole: 'Owner & Director, Vertex Consulting',
      publishedAt: '2026-04-05',
      readTime: 8,
      division: 'shared',
      tags: ['AI', 'technology', 'strategy'],
    },
    mk: {
      slug: 'the-practical-guide-to-ai-tools-for-small-business-2026',
      title: 'Практичен водич за AI алатки за мал бизнис во 2026',
      excerpt:
        'Пробијте го AI шумот. Еве што навистина работи за мали и средни македонски бизниси — и што сѐ уште не вреди за напор.',
      content: `AI има момент — повторно — а сопствениците на бизниси се бомбардирани со продажни понуди за AI алатки. Повеќето нема да ви помогнат. Неколку навистина ќе променат како функционира бизнисот. Еве како да ја препознаете разликата.

## Во што AI е навистина добар моментално

Во 2026, има неколку AI случаи на употреба што созреале доволно за да носат вистинска бизнис вредност веродостојно. Овие вредат за инвестиција:

**Обработка на документи** — извлекувањето податоци од фактури, договори и формулари сега е многу точно. Ако бизнисот се справува со документација, AI може да автоматизира 80 проценти од рачниот внес на податоци.

**Комуникација со клиенти** — AI-напојувани чет асистенти можат да се справат со рутински прашања од клиенти 24/7 со изненадувачки добра точност. Ова е особено вредно за бизниси што примаат ист сет од 20 прашања стотици пати.

**Пишување содржина** — за извештаи, е-мејлови, објави на социјални медиуми и документација, AI нацртите сега се доволно добри што уредувањето е побрзо од пишување од нула.

**Пребарување на внатрешно знаење** — правење на акумулираното знаење на компанијата пребарливо и достапно преку AI. Тимовите престануваат да прашуваат "каде е оној документ?" и почнуваат да добиваат директни одговори.

## Во што AI сѐ уште не е добар

И покрај маркетинг тврдењата, AI сѐ уште се бори со:

- Работа што бара длабока контекстуална проценка за вашиот специфичен бизнис
- Креативна насока што бара човечки вкус и разбирање на брендот
- Задачи каде што точноста е важна, но AI не може самиот да ја провери својата работа
- Комплексни повеќестепени процеси без човечки проверки

Ако некој ви продава целосно автономно AI решение за било што од горенаведеното — одете си.

## Македонскиот контекст

Македонија има вистинска можност токму сега. Усвојувањето на AI е порано овде отколку во Западна Европа, што значи дека оние што прво се движат добиваат вистинска конкурентска предност. Во исто време, најдобрите AI алатки функционираат добро на англиски и имаат подобрувачка но несовршена поддршка за македонски.

За повеќето македонски бизниси препорачуваме да се почне со AI алатки на англиски за внатрешна работа (обработка на документи, анализа, пишување) и да се биде повнимателен за AI распоредувања на македонски наменети за клиенти додека моделите не се подобрат уште.

## Започнете малку

Грешката што повеќето бизниси ја прават е да се обидат да имплементираат премногу AI одеднаш. Вистинскиот пристап е да се избере еден случај со големо влијание, да се имплементира добро, да се интегрира во процесот, и дури потоа да се разгледа следната можност.

Во Vertex Consulting, нашата [услуга AI консалтинг](/consulting/ai-consulting) им помага на бизнисите да ја идентификуваат вистинската почетна точка и да спроведат AI алатки што навистина носат вредност. За покомплексни прилагодени AI апликации, нашиот тим за [AI развој](/marketing/ai-development) гради прилагодени решенија од нула.`,
      author: 'Goran Dinov',
      authorRole: 'Сопственик и директор, Vertex Consulting',
      publishedAt: '2026-04-05',
      readTime: 8,
      division: 'shared',
      tags: ['AI', 'технологија', 'стратегија'],
    },
  },
}

/** Returns every slug once (shared across locales). Used by `generateStaticParams`. */
export function getAllSlugs(): string[] {
  return Object.keys(mockPostsBySlug)
}

/** Returns all posts for the given locale, sorted newest-first. */
export function getAllPosts(locale: Locale): BlogPost[] {
  return Object.values(mockPostsBySlug)
    .map((record) => record[locale])
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export function getPostBySlug(slug: string, locale: Locale): BlogPost | null {
  return mockPostsBySlug[slug]?.[locale] ?? null
}

export function getPostsByDivision(
  division: 'consulting' | 'marketing' | 'shared' | 'all',
  locale: Locale
): BlogPost[] {
  const posts = getAllPosts(locale)
  if (division === 'all') return posts
  return posts.filter((p) => p.division === division)
}

export function getRelatedPosts(slug: string, locale: Locale, limit: number = 2): BlogPost[] {
  const current = getPostBySlug(slug, locale)
  if (!current) return []
  return getAllPosts(locale)
    .filter((p) => p.slug !== slug && p.division === current.division)
    .slice(0, limit)
}
