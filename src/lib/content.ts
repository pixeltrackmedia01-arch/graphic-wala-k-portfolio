/**
 * Single source of truth for all site content.
 * Edit text here — no need to touch components.
 * Source of truth: Mital's resume + the two campaign PDFs.
 */

export const PROFILE = {
  name: "Mital Chikhaliya",
  title: "Performance Marketing Lead",
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

/** Original campaign reports (served from /public/portfolio). */
export const PDFS = {
  d2c: "/portfolio/d2c-campaign.pdf",
  lead: "/portfolio/lead-generation.pdf",
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
  { key: "Attention", text: "Attracting the right audience through targeted advertising and creative strategy." },
  { key: "Click", text: "Turning attention into meaningful clicks through relevant messaging and offers." },
  { key: "Lead", text: "Capturing potential customers through lead forms, landing pages and conversion-focused campaigns." },
  { key: "Conversion", text: "Improving lead quality through retargeting, audience segmentation and conversion optimization." },
  { key: "Revenue", text: "Turning qualified opportunities into measurable business results." },
];

export const FOCUS_AREAS = [
  "Meta Advertising", "Google Advertising", "D2C & eCommerce Growth", "Lead Generation", "Full-Funnel Marketing",
  "Conversion Rate Optimization", "Campaign Scaling", "Budget Management", "Audience Research", "Creative Testing",
  "GA4 & GTM", "Meta Pixel & CAPI", "Retargeting", "Shopify Optimization", "SEO & Marketing Automation",
];

export const JOBS = [
  {
    company: "JadeBlue Lifestyle India Ltd.", place: "Ahmedabad", role: "Performance Marketing Executive", period: "May 2026 – Present", current: true,
    points: [
      "Own performance marketing for Greenfibre and JadeBlue.",
      "Drive customer acquisition and online sales through Meta and Google Ads.",
      "Plan and optimize full-funnel eCommerce and omnichannel campaigns.",
      "Focus on online revenue, offline revenue, store visits and ROAS.",
      "Manage advertising budgets and scaling decisions.",
      "Coordinate with creative, content, merchandising and web teams.",
      "Maintain tracking and attribution through GA4, Meta Pixel, Events Manager, CAPI and Shopify Analytics.",
    ],
  },
  {
    company: "House of Panchhi", place: "Surat", role: "Digital Marketing Executive / Performance Marketing Lead", period: "September 2023 – April 2026", current: false,
    points: [
      "Led performance marketing strategy across Meta and Google Ads for a D2C fashion brand.",
      "Managed acquisition, conversion and re-engagement campaigns.",
      "Optimized the Shopify store, landing pages and checkout funnel.",
      "Built retargeting journeys that recovered funnel drop-offs and increased repeat purchases.",
      "Managed budgets with a focus on ROAS, CAC and revenue growth.",
      "Ran A/B tests across creatives, messaging and audiences.",
      "Coordinated designers, video editors, content creators, photographers and web developers.",
      "Analyzed performance using GA4, Looker Studio, Shopify Analytics and Google Search Console.",
    ],
  },
  {
    company: "Diamond ICQ", place: "Surat", role: "Social Media & Ads Assistant → Digital Marketing Executive", period: "July 2021 – September 2023", current: false,
    points: [
      "Executed and optimized Meta Ads campaigns for lead generation.",
      "Supported Google Ads Search optimization.",
      "Assisted with campaign planning, audience targeting and budget allocation.",
      "Worked on remarketing and audience segmentation.",
      "Monitored CTR, CPC, CPL, landing page views and conversions.",
      "Prepared campaign performance reports.",
      "Coordinated with design and content teams.",
    ],
  },
];

export const SKILL_GROUPS: { no: string; title: string; hint: string; items: { name: string; desc: string }[] }[] = [
  { no: "01", title: "Paid Media", hint: "Where attention is bought — and earned.", items: [
    { name: "Meta Ads", desc: "Acquisition, conversion and re-engagement campaigns." },
    { name: "Google Ads", desc: "Search, Display, YouTube, Demand Gen and Shopping." },
    { name: "Google Search Ads", desc: "Intent-led campaigns that capture ready buyers." },
    { name: "Display Ads", desc: "Reach and remarketing across the Display Network." },
    { name: "YouTube Ads", desc: "Video-led awareness and consideration." },
    { name: "Demand Gen", desc: "Visual, discovery-style Google campaigns." },
    { name: "Shopping Ads", desc: "Product-led campaigns for eCommerce catalogs." },
    { name: "Retargeting", desc: "Bringing back visitors who almost converted." },
  ]},
  { no: "02", title: "Analytics & Tracking", hint: "If it can't be measured, it can't be scaled.", items: [
    { name: "GA4", desc: "Behaviour, funnel and conversion analysis." },
    { name: "Google Tag Manager", desc: "Clean, controllable event tracking." },
    { name: "Meta Pixel", desc: "Browser-side event tracking for Meta." },
    { name: "Meta Events Manager", desc: "Monitoring event quality and attribution." },
    { name: "Conversion API", desc: "Server-side events for more reliable measurement." },
    { name: "Looker Studio", desc: "Reporting dashboards for decisions." },
    { name: "Shopify Analytics", desc: "Store-level sales and customer behaviour." },
    { name: "Google Search Console", desc: "Organic visibility and search performance." },
  ]},
  { no: "03", title: "Performance & Growth", hint: "The thinking behind every budget decision.", items: [
    { name: "Full-Funnel Strategy", desc: "Top, middle and bottom of funnel working together." },
    { name: "Budget Planning", desc: "Allocating spend by objective and return." },
    { name: "Campaign Scaling", desc: "Increasing spend while protecting efficiency." },
    { name: "Audience Research", desc: "Understanding who to reach and why." },
    { name: "A/B Testing", desc: "Structured tests on creatives, messaging and audiences." },
    { name: "CRO", desc: "Turning more of the traffic into customers." },
    { name: "Landing Page Optimization", desc: "Pages built around the offer and the click." },
    { name: "Retargeting", desc: "Lifecycle journeys that recover funnel drop-offs." },
  ]},
  { no: "04", title: "Creative & Automation", hint: "Faster testing, less manual work.", items: [
    { name: "Canva", desc: "Quick creative and layout iterations." },
    { name: "Photoshop", desc: "Image editing and ad creative refinement." },
    { name: "Premiere Pro", desc: "Short-form video edits for ads." },
    { name: "After Effects", desc: "Motion elements for creatives." },
    { name: "Pabbly Connect", desc: "Workflow automation between tools." },
    { name: "ChatGPT", desc: "AI-assisted ad copy, research and reporting." },
    { name: "Claude", desc: "AI-assisted ideation, analysis and writing." },
    { name: "Gemini", desc: "AI-assisted research and creative ideation." },
  ]},
  { no: "05", title: "SEO & Research", hint: "Organic insight that supports paid growth.", items: [
    { name: "Keyword Research", desc: "Finding the language buyers actually use." },
    { name: "On-Page SEO", desc: "Aligning pages with search intent." },
    { name: "Organic Traffic Analysis", desc: "Reading what search is already delivering." },
    { name: "Google Keyword Planner", desc: "Demand and volume research for campaigns." },
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
