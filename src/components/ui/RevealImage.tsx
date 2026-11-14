import Image from "next/image";
import { images, type ImageKey } from "@/config/images";
import { cn } from "@/lib/utils";

type Props = {
  image: ImageKey;
  alt: string;
  className?: string;
  /** Above-the-fold images animate with CSS and load eagerly; others reveal on scroll. */
  priority?: boolean;
  sizes?: string;
  /** Optional colour treatment overlay to keep the dark navy art direction consistent. */
  tint?: boolean;
  parallax?: boolean;
};

/**
 * Responsive photo with a clip-path "wipe" reveal and a subtle navy tint so all
 * photography shares one treatment. next/image serves AVIF/WebP at the right size.
 */
export function RevealImage({ image, alt, className, priority, sizes = "(min-width: 1024px) 50vw, 100vw", tint = true, parallax }: Props) {
  const img = images[image];
  return (
    <div
      className={cn("relative overflow-hidden", priority && "img-clip-in", className)}
      data-reveal={priority ? undefined : "clip"}
    >
      <div className={cn("absolute inset-0", parallax && "-top-[8%] -bottom-[8%]")} data-parallax={parallax ? "0.08" : undefined}>
        <Image
          src={img.src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          quality={72}
          className="object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </div>
      {tint && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(10_17_32/0.05)_0%,rgb(10_17_32/0.55)_100%)] mix-blend-normal"
        />
      )}
    </div>
  );
}
