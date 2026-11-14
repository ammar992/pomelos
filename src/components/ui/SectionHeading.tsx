import { cn } from "@/lib/utils";
import { segmentWords } from "@/lib/segment";
import { SplitText } from "./SplitText";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  index?: string;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
  /** id for the heading, used by the parent section's aria-labelledby. */
  id?: string;
};

export function Eyebrow({ children, index, className }: { children: React.ReactNode; index?: string; className?: string }) {
  return (
    <p className={cn("eyebrow", className)}>
      {index ? <span className="text-subtle">[{index}]</span> : <span className="h-px w-6 bg-accent" aria-hidden />}
      <span>{children}</span>
    </p>
  );
}

export function SectionHeading({ eyebrow, title, description, index, align = "left", className, as = "h2", id }: Props) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <div data-reveal="fade" className={cn(align === "center" && "flex justify-center")}>
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
      </div>
      <SplitText id={id} as={as} text={title} words={segmentWords(title)} className={cn("mt-5 font-medium text-fg", as === "h1" ? "text-h1" : "text-h2")} />
      {description ? (
        <p data-reveal className="mt-6 text-lead text-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}
