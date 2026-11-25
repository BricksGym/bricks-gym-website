import Image from "next/image";

/**
 * The Bricks Gym logo.
 *   /public/brand/bricks-gym-logo.png        red, for light backgrounds
 *   /public/brand/bricks-gym-logo-white.png  white, for dark backgrounds
 * To change the logo, replace those files (keep the same names).
 */
export function Logo({
  className = "",
  variant = "color",
  priority = false,
}: {
  className?: string;
  variant?: "color" | "white";
  priority?: boolean;
}) {
  return (
    <Image
      src={variant === "white" ? "/brand/bricks-gym-logo-white.png" : "/brand/bricks-gym-logo.png"}
      alt="Bricks Gym"
      width={2172}
      height={724}
      priority={priority}
      sizes="(max-width: 640px) 60vw, 400px"
      className={`h-auto ${className}`}
    />
  );
}
