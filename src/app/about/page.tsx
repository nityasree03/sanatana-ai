import type { Metadata } from "next";
import Link from "next/link";
import { getRoute } from "@/lib/routes";
import { SITE, STORAGE_KEYS } from "@/lib/site";

const route = getRoute("/about");
export const metadata: Metadata = { title: "About and privacy", description: route.description };

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-24 border-t border-line pt-8"
    >
      <h2 id={`${id}-heading`} className="text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-3 leading-7">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
      <div>
        <h1 className="text-4xl sm:text-5xl">{route.title}</h1>
        <nav aria-label="On this page" className="mt-4 flex flex-wrap gap-3 text-sm">
          <a href="#what" className="text-accent underline">
            What it is
          </a>
          <a href="#companions" className="text-accent underline">
            About the companions
          </a>
          <a href="#sources" className="text-accent underline">
            Scripture and sources
          </a>
          <a href="#privacy" className="text-accent underline">
            Privacy
          </a>
          <a href="#kids" className="text-accent underline">
            Children
          </a>
          <a href="#status" className="text-accent underline">
            Project status
          </a>
        </nav>
      </div>

      <Section id="what" title="What Sanatana AI is">
        <p>
          Sanatana AI is a learning and reflection website. You can talk with four AI companions
          inspired by Krishna, Shiva, Hanuman and Parvati, explore scripture with full source
          details, and use private tools for reflection and decision-making.
        </p>
        <p>
          It supports thoughtful reflection. It does not replace teachers, family, community, or
          professional medical, legal, financial or mental-health help.
        </p>
      </Section>

      <Section id="companions" title="About the companions">
        <p>{SITE.aiDisclosure}</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            They never claim divine knowledge, predict your future or promise karmic outcomes.
          </li>
          <li>They won&apos;t tell you what you must decide. Choices stay yours.</li>
          <li>
            They won&apos;t encourage secrecy or ask you to rely on them instead of the people in
            your life.
          </li>
          <li>Their portraits are original artwork made for this project.</li>
        </ul>
      </Section>

      <Section id="sources" title="Scripture and sources">
        <p>
          AI may interpret, but it must not invent verses. Every passage shown on this site will
          carry its scripture, chapter and verse, original language, translation, translator,
          edition, source link and licence.
        </p>
        <div className="palm-leaf px-4 py-3 text-sm">
          Answers clearly separate three things: the verified passage, an interpretation of it, and
          practical reflection written by the AI.
        </div>
        <p>
          &quot;Free to read&quot; does not mean &quot;free to reuse&quot;, so only texts we have
          the right to publish are included. If a source can&apos;t be verified or legally included,
          the site says so.
        </p>
      </Section>

      <Section id="privacy" title="Privacy">
        <p>
          <strong>Right now (Phase {SITE.currentPhase}):</strong> chat messages are not sent
          anywhere and are not saved. They disappear when you close or refresh the tab.
        </p>
        <p>
          Your browser stores only two small preferences on your device: your day/night theme (
          <code className="text-sm">{STORAGE_KEYS.theme}</code>) and your last chosen companion (
          <code className="text-sm">{STORAGE_KEYS.companion}</code>). No accounts, no tracking, no
          ads.
        </p>
        <p>
          <strong>Voice:</strong> the microphone only turns on when you press it, and the site never
          records or stores audio. Speech-to-text uses your browser&apos;s built-in speech
          recognition, which may send your voice to the browser maker&apos;s speech service (for
          example Google in Chrome, Microsoft in Edge or Apple in Safari) to turn it into text. If
          you&apos;d rather not, simply type. Spoken replies use voices installed on your device,
          and they never start playing on their own.
        </p>
        <p>When later features arrive, these rules apply:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Conversation context lasts for your session only, unless you choose to save something.
          </li>
          <li>
            Saved memories and reflections stay in your browser, and you can view, edit, export or
            delete them.
          </li>
          <li>
            Your saved journal text is never sent to an AI unless you ask, with a clear notice
            first.
          </li>
          <li>
            Messages sent to the AI provider are handled on the server, and API keys are never
            exposed.
          </li>
        </ul>
      </Section>

      <Section id="kids" title="Children">
        <p>
          Sanatana Kids is designed to be used <em>with a caregiver</em>. It offers curated,
          reviewed stories and activities, not open-ended AI chat. There are no child accounts,
          tracking, ads or stored voice recordings, and no identifying information is requested.
        </p>
      </Section>

      <Section id="status" title="Project status">
        <p>
          This website is being built in phases, and each page shows an honest status label. See the
          full{" "}
          <Link href="/" className="text-accent underline">
            list of pages
          </Link>{" "}
          or the{" "}
          <a
            href={`${SITE.repoUrl}/blob/main/docs/project_status.md`}
            className="text-accent underline"
          >
            project status on GitHub
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
