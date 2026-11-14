import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Funnel } from "@/components/Funnel";
import { About } from "@/components/About";
import { Work } from "@/components/Work";
import { Journey } from "@/components/Journey";
import { Skills } from "@/components/Skills";
import { Process } from "@/components/Process";
import { Personal } from "@/components/Personal";
import { Contact } from "@/components/Contact";
import { ChatLoader } from "@/components/ChatLoader";

export default function Page() {
  return (
    <>
      <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-cream">Skip to content</a>
      <Nav />
      <main>
        <Hero />
        <Funnel />
        <About />
        <Work />
        <Journey />
        <Skills />
        <Process />
        <Personal />
        <Contact />
      </main>
      <ChatLoader />
    </>
  );
}
