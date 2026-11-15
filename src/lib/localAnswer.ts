import { KNOWLEDGE as K } from "./knowledge";

/*
 * Keyless resume answerer. Understands free-form English / Hindi (Devanagari) / Hinglish questions by matching them
 * to topics, then composes the reply ONLY from KNOWLEDGE (resume + approved portfolio content). Nothing is invented.
 * Used whenever the live AI service is not connected (or fails), so visitors always get a real answer.
 */
type Topic = { id: string; kw: string[]; en: () => string; hi: () => string };

const bullets = (a: string[]) => a.map((x) => `• ${x}`).join("\n");
const jobs = () => K.experience.map((e) => `• ${e.role} — ${e.company}, ${e.location} (${e.period})`).join("\n");
const cur = K.experience[0], prev1 = K.experience[1], prev2 = K.experience[2];

const TOPICS: Topic[] = [
  { id: "experience", kw: ["experience", "exp ", "years", "year", "kitna", "kitne", "saal", "sal ", "career", "work history", "worked", "jobs", "job", "companies", "company", "roles", "background", "अनुभव", "एक्सपीरियंस", "साल", "कितना", "कितने", "कंपनी", "कंपनियों", "काम किया", "करियर"],
    en: () => `Mital has ${K.profile.experienceYears} of experience in performance marketing, mainly in D2C fashion and retail:\n${jobs()}`,
    hi: () => `मित्तल को परफॉर्मेंस मार्केटिंग में ${K.profile.experienceYears} का अनुभव है, मुख्य रूप से D2C फैशन और रिटेल में:\n${jobs()}` },
  { id: "current", kw: ["current", "currently", "present", "now", "abhi", "right now", "jadeblue", "jade blue", "greenfibre", "green fibre", "अभी", "वर्तमान", "इस समय", "करंट"],
    en: () => `Currently Mital is a ${cur.role} at ${cur.company}, ${cur.location} (${cur.period}):\n${bullets(cur.points)}`,
    hi: () => `अभी मित्तल ${cur.company}, ${cur.location} में ${cur.role} हैं (${cur.period}):\n${bullets(cur.points)}` },
  { id: "previous", kw: ["previous", "past", "before", "earlier", "panchhi", "house of panchhi", "diamond", "icq", "pehle", "पहले", "पिछली", "पिछले"],
    en: () => `Before JadeBlue:\n• ${prev1.role} at ${prev1.company}, ${prev1.location} (${prev1.period})\n${bullets(prev1.points.slice(0, 4)).replace(/^/gm, "  ")}\n• ${prev2.role} at ${prev2.company}, ${prev2.location} (${prev2.period})\n${bullets(prev2.points.slice(0, 3)).replace(/^/gm, "  ")}`,
    hi: () => `JadeBlue से पहले:\n• ${prev1.company}, ${prev1.location} — ${prev1.role} (${prev1.period})\n• ${prev2.company}, ${prev2.location} — ${prev2.role} (${prev2.period})\nविवरण के लिए हर रोल की जिम्मेदारियाँ पोर्टफोलियो के Experience सेक्शन में हैं।` },
  { id: "tools", kw: ["tool", "tools", "software", "softwares", "skill", "skills", "know", "knows", "use", "uses", "technology", "stack", "platform", "platforms", "proficient", "expert", "आता", "आती", "आते", "टूल", "टूल्स", "स्किल", "स्किल्स", "यूज़", "यूज", "सॉफ्टवेयर", "जानती", "जानता", "कौन से"],
    en: () => `Mital's toolkit:\n• Paid media: ${K.skills.paidMedia}\n• Tracking & analytics: ${K.skills.trackingAnalytics}\n• Conversion: ${K.skills.conversion}\n• Creative & other: ${K.skills.creativeAndOther}\n• AI & automation: ${K.skills.aiAndAutomation}\n• Strategy: ${K.skills.strategy}`,
    hi: () => `मित्तल के टूल्स और स्किल्स:\n• पेड मीडिया: ${K.skills.paidMedia}\n• ट्रैकिंग और एनालिटिक्स: ${K.skills.trackingAnalytics}\n• कन्वर्ज़न: ${K.skills.conversion}\n• क्रिएटिव और अन्य: ${K.skills.creativeAndOther}\n• AI और ऑटोमेशन: ${K.skills.aiAndAutomation}` },
  { id: "ads", kw: ["meta", "facebook", "instagram", "google ads", "adwords", "youtube", "search ads", "display", "shopping", "demand gen", "ads", "advertising", "paid", "campaign", "campaigns", "ppc", "retargeting", "lookalike", "एड्स", "विज्ञापन", "कैंपेन", "मेटा", "गूगल"],
    en: () => `Paid media: ${K.skills.paidMedia}.\nShe plans and optimizes full-funnel campaigns (TOF · MOF · BOF), manages budgets up to ₹50L/month, and scales using ROAS, CTR, CPC, CPA, AOV and conversion-rate analysis.`,
    hi: () => `पेड मीडिया: ${K.skills.paidMedia}।\nवे फुल-फ़नल कैंपेन (TOF · MOF · BOF) प्लान और ऑप्टिमाइज़ करती हैं और ₹50L/माह तक का बजट संभालती हैं।` },
  { id: "tracking", kw: ["ga4", "analytics", "gtm", "tag manager", "pixel", "capi", "conversion api", "events manager", "tracking", "attribution", "looker", "search console", "reporting", "report", "dashboard", "data", "track", "एनालिटिक्स", "ट्रैकिंग", "रिपोर्ट", "पिक्सल"],
    en: () => `Tracking & analytics: ${K.skills.trackingAnalytics}.\nMetrics she owns: ${K.skills.metricsOwned}. She maintains tracking and attribution across GA4, Meta Pixel, Events Manager, CAPI and Shopify Analytics, and reports using Looker Studio.`,
    hi: () => `ट्रैकिंग और एनालिटिक्स: ${K.skills.trackingAnalytics}।\nमेट्रिक्स जिन्हें वे संभालती हैं: ${K.skills.metricsOwned}।` },
  { id: "ecom", kw: ["d2c", "ecommerce", "e-commerce", "shopify", "fashion", "retail", "store", "online sales", "cro", "landing page", "checkout", "conversion", "sales", "ई-कॉमर्स", "शॉपिफाई", "फैशन", "रिटेल"],
    en: () => `D2C & eCommerce: Mital led Meta and Google Ads for a D2C fashion brand at House of Panchhi (acquisition, conversion, re-engagement), optimized the Shopify store, landing pages and checkout funnel to lift conversion rates, and now owns performance marketing for Greenfibre and JadeBlue — growing online and offline revenue, store visits and ROAS.`,
    hi: () => `D2C और eCommerce: मित्तल ने House of Panchhi में D2C फैशन ब्रांड के लिए Meta और Google Ads लीड किए, Shopify स्टोर, लैंडिंग पेज और चेकआउट फ़नल ऑप्टिमाइज़ किया, और अब Greenfibre और JadeBlue की परफॉर्मेंस मार्केटिंग संभालती हैं।` },
  { id: "leadgen", kw: ["lead", "leads", "lead generation", "leadgen", "cpl", "enquiries", "inquiries", "लीड", "लीड्स"],
    en: () => `Lead generation: at Diamond ICQ (Jul 2021 – Sep 2023) Mital executed and optimized Meta Ads for lead-generation businesses, tracked CTR, CPC, CPL, LPV and conversion rates, and improved lead quality. Overall she has reduced CAC/CPL by 20–30%. A Lead Generation campaign portfolio (original PDF of dashboard screenshots across industries) is on the website under Campaign Portfolio.`,
    hi: () => `लीड जनरेशन: Diamond ICQ में मित्तल ने लीड-जनरेशन बिज़नेस के लिए Meta Ads चलाए और ऑप्टिमाइज़ किए, और लीड क्वालिटी सुधारी। कुल मिलाकर CAC/CPL में 20–30% कमी लाई हैं। Campaign Portfolio में Lead Generation PDF उपलब्ध है।` },
  { id: "results", kw: ["achievement", "achievements", "result", "results", "roas", "budget", "budgets", "cac", "performance", "highlight", "highlights", "success", "impact", "numbers", "kitna budget", "उपलब्धि", "उपलब्धियां", "रिज़ल्ट", "रिजल्ट", "बजट", "नतीजे"],
    en: () => `Career highlights:\n${bullets(K.achievements)}\n\nNote: ${K.achievementsNote}`,
    hi: () => `करियर की मुख्य उपलब्धियाँ:\n${bullets(K.achievements)}\n\n(ये अलग-अलग रोल्स की कुल उपलब्धियाँ हैं, किसी एक कैंपेन का नतीजा नहीं।)` },
  { id: "creative", kw: ["canva", "photoshop", "premiere", "after effects", "design", "creative", "creatives", "video", "editing", "pabbly", "keyword planner", "क्रिएटिव", "डिज़ाइन", "फोटोशॉप", "कैनवा"],
    en: () => `Creative & other tools: ${K.skills.creativeAndOther}.\nShe runs continuous A/B tests on creatives, messaging and audiences, coordinates designers, video editors, content creators and photographers, and has lifted CTR/engagement 1–1.5X through data-driven creative testing.`,
    hi: () => `क्रिएटिव और अन्य टूल्स: ${K.skills.creativeAndOther}।\nवे क्रिएटिव, मैसेजिंग और ऑडियंस पर लगातार A/B टेस्ट चलाती हैं।` },
  { id: "seo", kw: ["seo", "organic", "keyword", "keywords", "search engine", "on-page", "एसईओ", "ऑर्गेनिक"],
    en: () => `SEO: ${K.skills.seo}.`, hi: () => `SEO: ${K.skills.seo}।` },
  { id: "ai", kw: ["ai", "chatgpt", "claude", "gemini", "automation", "artificial", "llm", "एआई", "ऑटोमेशन", "चैटजीपीटी"],
    en: () => `AI & automation: ${K.skills.aiAndAutomation}.`, hi: () => `AI और ऑटोमेशन: ${K.skills.aiAndAutomation}।` },
  { id: "lifecycle", kw: ["email", "whatsapp", "sms", "lifecycle", "crm", "team", "lead a team", "manage team", "manages", "mentor", "ईमेल", "व्हाट्सएप", "टीम"],
    en: () => `Lifecycle & team: ${K.skills.lifecycle}. She also coordinates designers, video editors, content creators, photographers and web developers on campaigns.`,
    hi: () => `लाइफ़साइकल और टीम: मित्तल एक टीम मेंबर को गाइड करती हैं जो ईमेल, WhatsApp और SMS मार्केटिंग चलाते हैं; वे प्राथमिकताएँ तय करती हैं और नतीजों को ऐड कैंपेन के साथ जोड़ती हैं।` },
  { id: "education", kw: ["education", "degree", "college", "university", "study", "studied", "qualification", "bba", "graduate", "graduation", "शिक्षा", "पढ़ाई", "डिग्री", "कॉलेज", "यूनिवर्सिटी"],
    en: () => `Education: ${K.education}.`, hi: () => `शिक्षा: ${K.education}।` },
  { id: "languages", kw: ["language", "languages", "speak", "gujarati", "hindi", "english", "भाषा", "भाषाएं", "बोलती"],
    en: () => `Languages: ${K.languages}.`, hi: () => `भाषाएँ: ${K.languages}।` },
  { id: "contact", kw: ["contact", "email id", "mail", "phone", "number", "call", "reach", "hire", "hiring", "connect", "linkedin", "whatsapp number", "संपर्क", "फोन", "नंबर", "ईमेल", "कॉन्टैक्ट", "लिंक्डइन"],
    en: () => `You can reach Mital here:\n• Email: ${K.profile.email}\n• Phone: ${K.profile.phone}\n• LinkedIn: ${K.profile.linkedin}\n• Location: ${K.profile.location}\nOr use the “Contact Mital” button in this chat.`,
    hi: () => `मित्तल से संपर्क करें:\n• ईमेल: ${K.profile.email}\n• फोन: ${K.profile.phone}\n• LinkedIn: ${K.profile.linkedin}\n• स्थान: ${K.profile.location}\nया इस चैट में “Contact Mital” बटन इस्तेमाल करें।` },
  { id: "location", kw: ["where", "location", "based", "city", "live", "lives", "ahmedabad", "कहाँ", "कहां", "शहर", "रहती", "अहमदाबाद"],
    en: () => `Mital is based in ${K.profile.location}.`, hi: () => `मित्तल ${K.profile.location} में रहती हैं।` },
  { id: "portfolio", kw: ["portfolio", "case study", "case studies", "pdf", "samples", "proof", "screenshots", "campaign portfolio", "पोर्टफोलियो", "केस स्टडी", "सैंपल"],
    en: () => `Campaign Portfolio on this site has two original PDFs of reporting screenshots from actual ad dashboards:\n• ${K.portfolio.d2c}\n• ${K.portfolio.leadGeneration}\nNo client names or campaign-level figures are published.`,
    hi: () => `इस साइट के Campaign Portfolio में असली एड डैशबोर्ड के रिपोर्टिंग स्क्रीनशॉट की दो PDF हैं: D2C Sales और Lead Generation। क्लाइंट नाम या कैंपेन-स्तर के आँकड़े प्रकाशित नहीं हैं।` },
  { id: "about", kw: ["who", "about", "introduce", "introduction", "tell me about", "summary", "profile", "mital", "कौन", "बारे", "परिचय", "मित्तल", "इंट्रोड्यूस"],
    en: () => `${K.profile.name} — ${K.profile.headline}, based in ${K.profile.location}.\n${K.summary}`,
    hi: () => `${K.profile.name} — ${K.profile.title}, ${K.profile.location}।\n5+ वर्षों के अनुभव के साथ वे D2C फैशन और रिटेल में Meta और Google Ads (₹50L/माह तक के बजट), फुल-फ़नल स्ट्रैटेजी, CRO और ट्रैकिंग (GA4, GTM, Pixel, CAPI) संभालती हैं।` },
];

const GREET = ["hi", "hello", "hey", "hii", "namaste", "namaskar", "नमस्ते", "हेलो", "हाय", "हैलो"];
const THANKS = ["thanks", "thank you", "thx", "shukriya", "dhanyavad", "धन्यवाद", "शुक्रिया", "थैंक"];
const PRIVATE = ["salary", "ctc", "package", "age", "married", "marital", "husband", "boyfriend", "address", "home", "religion", "caste", "notice period", "expected", "सैलरी", "वेतन", "उम्र", "शादी", "पता", "नोटिस"];

const KNOWN_TOOLS: [string, string][] = [
  ["meta ads", "Paid media"], ["google ads", "Paid media"], ["youtube", "Paid media"], ["shopping ads", "Paid media"], ["demand gen", "Paid media"],
  ["ga4", "Tracking & analytics"], ["gtm", "Tracking & analytics"], ["tag manager", "Tracking & analytics"], ["meta pixel", "Tracking & analytics"], ["pixel", "Tracking & analytics"], ["capi", "Tracking & analytics"],
  ["events manager", "Tracking & analytics"], ["search console", "Tracking & analytics"], ["looker", "Tracking & analytics"], ["shopify", "Conversion / Tracking"],
  ["canva", "Creative & other"], ["photoshop", "Creative & other"], ["premiere", "Creative & other"], ["after effects", "Creative & other"], ["pabbly", "Creative & other"], ["keyword planner", "Creative & other"],
  ["chatgpt", "AI & automation"], ["claude", "AI & automation"], ["gemini", "AI & automation"],
];

const has = (q: string, k: string) => (/^[\x20-\x7e]+$/.test(k) && !k.includes(" ") ? new RegExp(`(^|[^a-z0-9])${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(q) : q.includes(k));

export function answerLocally(raw: string): { text: string; matched: boolean } {
  const q = " " + raw.toLowerCase().replace(/\s+/g, " ").trim() + " ";
  const hindi = /[ऀ-ॿ]/.test(raw);
  const pick = (t: Topic) => (hindi ? t.hi() : t.en());

  if (PRIVATE.some((k) => has(q, k)) && !has(q, "contact"))
    return { matched: false, text: hindi ? "यह जानकारी मित्तल के पोर्टफोलियो में प्रकाशित नहीं है। कृपया “Contact Mital” से सीधे पूछ लें।" : "That detail isn't published in Mital's portfolio, so I can't share it. Please use “Contact Mital” to ask her directly." };

  // a specific tool asked about ("does she know Photoshop?") -> confirm exactly where it is listed
  const tools = KNOWN_TOOLS.filter(([t]) => has(q, t));
  if (tools.length && !/\b(all|list|every|which|what)\b/.test(q) && !hindi && (/\b(know|knows|use|uses|familiar|proficient|does|do|can|has|have|is|hai)\b/.test(q) || q.trim().split(" ").length <= 3) && !/\b(kaise|how)\b/.test(q)) {
    const names = [...new Set(tools.map(([t]) => t))];
    const display = names.map((n) => n.replace(/\b\w/g, (c) => c.toUpperCase()).replace("Ga4", "GA4").replace("Gtm", "GTM").replace("Capi", "CAPI"));
    const cats = [...new Set(tools.map(([, c]) => c))].join(", ");
    return { matched: true, text: `Yes — ${display.join(", ")} ${display.length > 1 ? "are" : "is"} listed among Mital's skills (${cats}).\nFull toolkit: GA4, GTM, Meta Pixel, CAPI, Looker Studio, Shopify Analytics, Search Console, Canva, Photoshop, Premiere Pro, After Effects, Pabbly Connect, Google Keyword Planner, plus AI tools (ChatGPT, Claude, Gemini).` };
  }

  // "does she know <something that is not in the resume>" -> say so honestly instead of listing unrelated skills
  const ask = q.match(/\b(?:know|knows|use|uses|familiar with|proficient in|experience (?:in|with)|worked (?:on|with)|expert in)\s+(?:the\s+|any\s+|in\s+|with\s+)?([a-z0-9+#.\-]{2,})/);
  if (ask && !hindi) {
    const w = ask[1], generic = ["tools", "tool", "software", "softwares", "skills", "skill", "platforms", "platform", "marketing", "ads", "her", "him", "mital", "all", "what", "which", "about", "how", "much", "anything"];
    if (!generic.includes(w) && !KNOWN_TOOLS.some(([t]) => t.includes(w)) && !JSON.stringify(K).toLowerCase().includes(w))
      return { matched: false, text: `“${w}” isn't listed in Mital's current portfolio, so I can't confirm it. Her listed toolkit: Meta Ads, Google Ads, GA4, GTM, Meta Pixel, CAPI, Looker Studio, Shopify Analytics, Search Console, Canva, Photoshop, Premiere Pro, After Effects, Pabbly Connect, Google Keyword Planner and AI tools (ChatGPT, Claude, Gemini). You can ask her directly via “Contact Mital”.` };
  }

  const first = q.trim().split(" ")[0];
  if (q.trim().split(" ").length <= 3 && GREET.some((g) => first === g || q.includes(` ${g} `)))
    return { matched: true, text: hindi ? "नमस्ते! मैं मित्तल के अनुभव, स्किल्स, टूल्स, उपलब्धियों या संपर्क के बारे में बता सकता हूँ। आप क्या जानना चाहेंगे?" : "Hi! I can tell you about Mital's experience, skills and tools, achievements or how to contact her. What would you like to know?" };
  if (THANKS.some((t) => q.includes(t))) return { matched: true, text: hindi ? "आपका स्वागत है! कुछ और पूछना हो तो बताइए।" : "You're welcome! Ask me anything else about Mital's background." };

  const scored = TOPICS.map((t) => ({ t, s: t.kw.reduce((n, k) => n + (has(q, k) ? (t.id === "tools" ? 1 : 2) : 0), 0) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  if (!scored.length)
    return { matched: false, text: hindi ? "यह जानकारी मित्तल के मौजूदा पोर्टफोलियो में शामिल नहीं है। आप अनुभव, टूल्स, उपलब्धियाँ या संपर्क के बारे में पूछ सकते हैं, या “Contact Mital” इस्तेमाल करें।" : "I couldn't find that in Mital's current portfolio. You can ask about her experience, tools and skills, achievements, education or contact details — or use “Contact Mital” to ask her directly." };

  const top = scored[0];
  const out = [pick(top.t)];
  if (scored[1] && scored[1].s >= top.s * 0.75 && scored[1].t.id !== top.t.id) out.push(pick(scored[1].t));
  return { matched: true, text: out.join("\n\n") };
}
