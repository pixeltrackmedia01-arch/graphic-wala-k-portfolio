import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { PROFILE } from "@/lib/content";

const display = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["opsz"] });
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const description =
  "Mital Chikhaliya is a Performance Marketing Lead in Ahmedabad with 5+ years in Meta Ads, Google Ads, D2C & eCommerce and growth marketing. Explore real campaign reports.";

export const metadata: Metadata = {
  metadataBase: new URL(PROFILE.siteUrl),
  title: "Mital Chikhaliya — Performance Marketing Lead | Meta & Google Ads",
  description,
  keywords: ["Performance Marketing", "Meta Ads", "Google Ads", "D2C", "eCommerce", "Lead Generation", "Ahmedabad", "Mital Chikhaliya"],
  authors: [{ name: PROFILE.name }],
  openGraph: {
    title: "Mital Chikhaliya — Performance Marketing Lead",
    description,
    type: "website",
    locale: "en_IN",
    images: [{ url: "/images/mital-character.webp", width: 704, height: 1527, alt: "Mital Chikhaliya illustrated portrait" }],
  },
  twitter: { card: "summary_large_image", title: "Mital Chikhaliya — Performance Marketing Lead", description },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#f4ecdf", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PROFILE.name,
  jobTitle: PROFILE.title,
  email: `mailto:${PROFILE.email}`,
  telephone: PROFILE.phone,
  address: { "@type": "PostalAddress", addressLocality: "Ahmedabad", addressCountry: "IN" },
  worksFor: { "@type": "Organization", name: "JadeBlue Lifestyle India Ltd." },
  sameAs: [PROFILE.linkedin],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
