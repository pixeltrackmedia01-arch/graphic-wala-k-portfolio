/**
 * Single source of truth for all site content.
 * Edit text here — no need to touch components.
 * Source of truth: Mital's resume + the two campaign PDFs.
 */

export const PROFILE = {
  name: "Mital Chikhaliya",
  title: "Performance Marketing Specialist",
  experience: "5+ Years of Experience",
  positioning: ["Meta Ads", "Google Ads", "D2C", "eCommerce"],
  location: "Ahmedabad, India",
  email: "mitalchikhaliya01@gmail.com",
  phone: "+91 8141482284",
  phoneHref: "tel:+918141482284",
  // LinkedIn URL taken from the hyperlink inside the resume PDF.
  linkedin: "https://www.linkedin.com/in/mital-chikhaliya-612428220/",
  siteUrl: "https://mitalchikhaliya.com", // update once the real domain is live
};

/**
 * Optional personal details. Leave empty ("") and the line is simply hidden.
 * Fill any of these in later and they appear in the "The Person" tab and the personal section.
 */
export const PERSONAL_EDITABLE = {
  funFact: "",
  hobbies: "",
  favouriteThing: "",
  extraNote: "",
};

/**
 * Original campaign reports (served from /public/portfolio).
 * The ?v= value is the first 8 chars of each file's SHA-256 - change it whenever a PDF is replaced
 * so browsers/CDNs never serve a stale copy.
 * d2c-campaign.pdf      = "D2C Campaign - updated.pdf"      (3 pages)
 * lead-generation.pdf   = "Lead Genration - Updated'.pdf"   (4 pages)
 */
export const PDFS = {
  d2c: "/portfolio/d2c-campaign.pdf?v=2687f8d8",
  lead: "/portfolio/lead-generation.pdf?v=c62bcfb0",
};

export const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

export const FUNNEL = [
  { key: "Capture Attention", text: "Reaching the right audience with powerful creatives, smart targeting and scroll-stopping campaigns." },
  { key: "Drive Engagement", text: "Turning audience interest into meaningful clicks through compelling messaging and strategic ad placements." },
  { key: "Generate Leads", text: "Attracting potential customers through high-converting landing pages, lead forms and focused campaigns." },
  { key: "Optimize Conversions", text: "Turning prospects into customers through retargeting, audience insights and continuous campaign optimization." },
  { key: "Maximize Revenue", text: "Transforming marketing performance into measurable business growth, stronger ROI and sustainable results." },
];

export const FOCUS_AREAS = [
  "Meta Advertising", "Google Advertising", "D2C & eCommerce Growth", "Lead Generation", "Full-Funnel Marketing",
  "Conversion Rate Optimization", "Campaign Scaling", "Budget Management", "Audience Segmentation", "Creative Testing",
  "GA4 & GTM", "Meta Pixel & CAPI", "Retargeting", "Shopify Optimization", "Team Leadership", "SEO & Marketing Automation",
];

/* Mirrors the resume's Professional Experience section (wording kept as in the resume). */
export const JOBS = [
  {
    company: "JadeBlue Lifestyle India Ltd.", place: "Ahmedabad", role: "Performance Marketing Executive", period: "May 2026 – Present", current: true,
    points: [
      "Manage end-to-end performance marketing strategies for two fashion brands, Greenfibre and JadeBlue, across Meta Ads and Google Ads.",
      "Drive ROAS improvement through structured campaign optimization, creative experimentation, audience testing and coordination with WhatsApp marketing. Improved Greenfibre ROAS from 3X to 4.5X and JadeBlue ROAS from 4X to 6X.",
      "Plan and execute D2C eCommerce campaigns focused on website traffic, customer acquisition, online sales and revenue growth, alongside brand awareness, reach, engagement and consideration campaigns.",
      "Develop omnichannel campaign strategies to support online revenue, offline store visits, retail footfall and overall brand growth.",
      "Manage advertising budgets, campaign scaling, audience segmentation and channel allocation based on ROAS, CAC, CPA, AOV and conversion performance.",
      "Analyze business performance across paid media, organic, influencer and offline retail channels to identify growth opportunities and guide marketing investments.",
      "Collaborate with merchandising teams to identify best-selling products, plan new launches and develop performance-driven creative strategies.",
      "Coordinate with UI/UX, website development and SEO teams to improve website experience, landing pages, organic visibility and checkout conversions.",
      "Align email, WhatsApp and SMS marketing activities with paid campaigns to strengthen customer acquisition, communication and retention.",
      "Monitor Shopify Analytics, GA4, Meta Pixel and CAPI to evaluate campaign performance, tracking accuracy and conversion attribution.",
      "Lead a two-member performance marketing team comprising a Campaign Executive and Reporting Analyst, ensuring campaign execution, reporting accuracy and optimization.",
    ],
  },
  {
    company: "House of Panchhi", place: "Surat", role: "Digital Marketing Executive (Performance Marketing Specialist)", period: "Sep 2023 – Apr 2026", current: false,
    points: [
      "Led end-to-end performance marketing strategy and execution for a D2C fashion brand across Meta Ads and Google Ads, focusing on customer acquisition, eCommerce sales and retargeting.",
      "Achieved up to 10X ROAS through structured full-funnel campaigns, creative A/B testing, audience segmentation and continuous campaign optimization.",
      "Managed monthly advertising budgets of up to ₹10 lakh, optimizing budget allocation, audience targeting and campaign performance to achieve revenue and ROAS targets.",
      "Planned and executed full-funnel campaigns, including creative strategy, audience segmentation, retargeting and customer re-engagement to improve conversions and repeat purchases.",
      "Developed and executed A/B testing strategies across ad creatives, formats, messaging and audiences to improve CTR, conversion rates and campaign efficiency.",
      "Led a three-member team comprising two graphic designers and one reporting analyst, managing creative direction, task allocation, campaign priorities and performance reporting.",
      "Coordinated with merchandising, UX, website development and customer care teams to improve product presentation, website experience and overall campaign effectiveness.",
      "Managed influencer marketing initiatives in collaboration with the social media team, including creator planning, campaign timelines and content delivery.",
      "Planned and coordinated brand and product photoshoots end to end, working with photographers, videographers and video editors to deliver campaign-ready content.",
      "Optimized the Shopify store, landing pages and checkout funnel to improve customer experience and conversion performance.",
      "Supervised weekly and monthly performance reporting through GA4, Looker Studio, Shopify Analytics and Google Search Console, translating insights into actionable optimization strategies.",
    ],
  },
  {
    company: "Diamond ICQ", place: "Surat", role: "Social Media & Ads Assistant → Digital Marketing Executive", period: "Jul 2021 – Sep 2023", current: false,
    points: [
      "As Digital Marketing Executive: progressed from Social Media & Ads Assistant to Digital Marketing Executive, handling paid advertising, WhatsApp lead generation and digital marketing activities.",
      "Managed Meta Ads lead-generation campaigns targeting the Hong Kong market and Google Ads Search campaigns to generate relevant traffic and qualified leads.",
      "Planned and executed WhatsApp lead-generation campaigns, driving potential customers to WhatsApp for business inquiries and lead conversion.",
      "Managed campaign planning, audience targeting, budget allocation, remarketing and segmentation to improve lead generation performance.",
      "Monitored CTR, CPC, CPL, Landing Page Views (LPV) and conversion rates to evaluate campaign effectiveness and identify optimization opportunities.",
      "Prepared campaign performance reports using Meta Ads Manager, Google Ads Dashboard, GA4 and Google Search Console to track advertising performance, website traffic and lead generation.",
      "Analyzed campaign data, audience performance and lead funnel drop-offs to identify gaps and recommend optimization strategies.",
      "Coordinated with the graphic design team to improve ad creatives and campaign messaging.",
      "Managed social media content scheduling, posting and website product updates.",
      "As Social Media & Ads Assistant: managed social media posting and content scheduling, prepared campaign performance reports for senior team members and added and updated products on the website.",
    ],
  },
];

/* Mirrors the resume's "Core Skills & Tools" section (five tabs; the resume's eight categories are grouped into them). */
export const SKILL_GROUPS: { no: string; title: string; hint: string; items: { name: string; desc: string }[] }[] = [
  { no: "01", title: "Paid Media", hint: "Where attention is bought — and earned.", items: [
    { name: "Meta Ads", desc: "Acquisition, conversion and re-engagement campaigns." },
    { name: "Google Ads", desc: "Search, Display, YouTube, Performance Max, Demand Gen and Shopping." },
    { name: "Search Ads", desc: "Intent-led campaigns that capture ready buyers." },
    { name: "Display Ads", desc: "Reach and remarketing across the Display Network." },
    { name: "YouTube Ads", desc: "Video-led awareness and consideration." },
    { name: "Performance Max", desc: "Goal-based Google campaigns across channels." },
    { name: "Shopping Ads", desc: "Product-led campaigns for eCommerce catalogs." },
    { name: "Demand Gen", desc: "Visual, discovery-style Google campaigns." },
    { name: "Retargeting", desc: "Bringing back visitors who almost converted." },
    { name: "Lookalike Audiences", desc: "Reaching new people who resemble existing customers." },
  ]},
  { no: "02", title: "Analytics & Tracking", hint: "If it can't be measured, it can't be scaled.", items: [
    { name: "GA4", desc: "Behaviour, funnel and conversion analysis." },
    { name: "Google Tag Manager", desc: "Clean, controllable event tracking." },
    { name: "Meta Pixel", desc: "Browser-side event tracking for Meta." },
    { name: "Meta Events Manager", desc: "Monitoring event quality and attribution." },
    { name: "Conversions API", desc: "Server-side events for more reliable measurement." },
    { name: "Looker Studio", desc: "Reporting dashboards for decisions." },
    { name: "Shopify Analytics", desc: "Store-level sales and customer behaviour." },
    { name: "Google Search Console", desc: "Organic visibility and search performance." },
    { name: "UTM Tracking", desc: "Clear campaign and source attribution." },
  ]},
  { no: "03", title: "Performance & Growth", hint: "The thinking behind every budget decision.", items: [
    { name: "Performance Strategy", desc: "Plans built around business goals." },
    { name: "Full-Funnel Marketing (TOF, MOF, BOF)", desc: "Top, middle and bottom of funnel working together." },
    { name: "Media Planning", desc: "Choosing channels and formats for each objective." },
    { name: "Budget Allocation", desc: "Allocating spend by objective and return." },
    { name: "Campaign Scaling", desc: "Increasing spend while protecting efficiency." },
    { name: "Performance Forecasting", desc: "Setting realistic targets before scaling." },
    { name: "D2C Marketing", desc: "Direct-to-consumer brand growth." },
    { name: "eCommerce Growth", desc: "Online sales growth across the funnel." },
    { name: "Customer Acquisition", desc: "Bringing in new customers efficiently." },
    { name: "ROAS Optimization", desc: "Improving return on ad spend." },
    { name: "CAC Reduction", desc: "Lowering the cost of winning a customer." },
    { name: "CRO", desc: "Turning more of the traffic into customers." },
    { name: "Landing Page Optimization", desc: "Pages built around the offer and the click." },
    { name: "Shopify Optimization", desc: "Store experience that supports conversion." },
    { name: "Checkout Funnel Optimization", desc: "Reducing drop-offs before purchase." },
    { name: "ROAS", desc: "Return on ad spend." },
    { name: "MER", desc: "Marketing efficiency ratio." },
    { name: "CAC", desc: "Customer acquisition cost." },
    { name: "CPL", desc: "Cost per lead." },
    { name: "CPA", desc: "Cost per acquisition." },
    { name: "CTR", desc: "Click-through rate." },
    { name: "CPC", desc: "Cost per click." },
    { name: "CPM", desc: "Cost per thousand impressions." },
    { name: "AOV", desc: "Average order value." },
    { name: "LTV", desc: "Customer lifetime value." },
    { name: "Conversion Rate", desc: "Share of visitors who take the desired action." },
  ]},
  { no: "04", title: "Creative & Automation", hint: "Faster testing, less manual work.", items: [
    { name: "A/B Testing", desc: "Structured tests on creatives, messaging and audiences." },
    { name: "Creative Strategy", desc: "Ideas built around audience and objective." },
    { name: "Creative Briefing", desc: "Clear briefs for designers and editors." },
    { name: "Ad Copywriting", desc: "Messaging that supports the click." },
    { name: "Audience Testing", desc: "Finding which audiences respond best." },
    { name: "Canva", desc: "Quick creative and layout iterations." },
    { name: "Photoshop", desc: "Image editing and ad creative refinement." },
    { name: "Premiere Pro", desc: "Short-form video edits for ads." },
    { name: "After Effects", desc: "Motion elements for creatives." },
    { name: "Pabbly Connect", desc: "Workflow automation between tools." },
    { name: "ChatGPT", desc: "AI-assisted ad copy, research and reporting." },
    { name: "Claude", desc: "AI-assisted ideation, analysis and writing." },
    { name: "Gemini", desc: "AI-assisted research and creative ideation." },
    { name: "AI-Assisted Workflows", desc: "Research, ad copy and reporting with less manual work." },
  ]},
  { no: "05", title: "Additional Exposure", hint: "Channels that work alongside paid media.", items: [
    { name: "SEO", desc: "Organic visibility that supports paid growth." },
    { name: "Email Marketing", desc: "Aligned with paid campaigns for acquisition and retention." },
    { name: "WhatsApp Marketing", desc: "Customer communication aligned with campaigns." },
    { name: "SMS Marketing", desc: "Direct messaging that supports retention." },
    { name: "Influencer Marketing", desc: "Creator planning, timelines and content delivery." },
    { name: "Lifecycle Marketing", desc: "Journeys that support repeat purchases." },
  ]},
];

export const PROCESS = [
  { title: "Understand", text: "Understand business goals, products, target audience and growth objectives." },
  { title: "Research", text: "Study competitors, audiences, market opportunities and campaign data." },
  { title: "Build", text: "Develop campaign structures, tracking systems, audience strategies and creative testing plans." },
  { title: "Launch", text: "Launch campaigns with clear budgets, objectives and success metrics." },
  { title: "Measure", text: "Analyze ROAS, CAC, CPL, CTR, CPC and conversion performance." },
  { title: "Optimize", text: "Identify winning campaigns, improve conversion performance and scale efficiently." },
];
