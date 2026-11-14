import { getMessages, getTranslations } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { fill, pad2 } from "@/lib/utils";
import { PageHero } from "@/components/sections/PageHero";

type Doc = "privacy" | "terms" | "cookies";

const slug = (i: number) => `section-${i + 1}`;

export async function LegalPage({ doc }: { doc: Doc }) {
  const { legal } = await getMessages();
  const tm = await getTranslations("meta");
  const tc = await getTranslations("common");
  const content = legal[doc];
  const vars = { company: siteConfig.name, email: siteConfig.email };

  return (
    <>
      <PageHero eyebrow={tm("siteTagline")} title={content.title} description={fill(content.intro, vars)} compact />
      <section className="relative pb-24 sm:pb-32">
        <div className="container-x grid gap-12 border-t border-line pt-12 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <p className="font-label text-xs tracking-widest text-subtle uppercase">{legal.toc}</p>
              <ol className="mt-4 space-y-2 text-sm">
                {content.sections.map((s, i) => (
                  <li key={s.title}>
                    <a href={`#${slug(i)}`} className="flex gap-3 text-muted transition-colors hover:text-accent">
                      <span className="font-label text-xs text-subtle">{pad2(i + 1)}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
          <article className="prose-legal max-w-3xl lg:col-span-9">
            <div className="flex items-start gap-3 rounded-xl border border-dashed border-amber/40 bg-amber/[0.05] p-4 text-sm text-amber/90">
              <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{legal.notice}</span>
            </div>
            <p className="!mt-6 font-label text-xs text-subtle">{tc("lastUpdated", { date: legal.updated })}</p>
            {content.sections.map((s, i) => (
              <section key={s.title} id={slug(i)} className="scroll-mt-28">
                <h2>
                  <span className="mr-3 font-label text-sm text-accent">{pad2(i + 1)}</span>
                  {s.title}
                </h2>
                {s.body.map((p) => (
                  <p key={p}>{fill(p, vars)}</p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
