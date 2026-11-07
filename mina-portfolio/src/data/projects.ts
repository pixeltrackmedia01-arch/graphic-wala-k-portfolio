const img = (id: string) =>
  `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_${id}.png&w=1280&q=85`;

export interface Project {
  name: string;
  category: string;
  role: string;
  summary: string;
  col1: [string, string];
  col2: string;
}

export const PROJECTS: Project[] = [
  {
    name: 'JadeBlue Lifestyle',
    category: 'May 2026 – Present',
    role: 'Performance Marketing Executive · Ahmedabad',
    summary: 'End-to-end Meta and Google Ads for Greenfibre and JadeBlue, growing online and offline revenue, store visits and ROAS.',
    col1: [img('20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db'), img('20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8')],
    col2: img('20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327'),
  },
  {
    name: 'House of Panchhi',
    category: 'Sep 2023 – Apr 2026',
    role: 'Digital Marketing Executive (Performance Marketing Lead) · Surat',
    summary: 'Led Meta and Google Ads for a D2C fashion brand: Shopify and checkout CRO, retargeting journeys and up to 10X ROAS.',
    col1: [img('20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f'), img('20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1')],
    col2: img('20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea'),
  },
  {
    name: 'Diamond ICQ',
    category: 'Jul 2021 – Sep 2023',
    role: 'Social Media & Ads Assistant → Digital Marketing Executive · Surat',
    summary: 'Ran Meta lead-generation campaigns and supported Google Search, turning CTR, CPC, CPL and LPV gaps into better lead quality.',
    col1: [img('20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f'), img('20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b')],
    col2: img('20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee'),
  },
];
