import Image from "next/image";

import logoSrc from "@/public/svnord-logo.png";

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function ClubLogo({ size = 40, className, priority }: Props) {
  return (
    <Image
      src={logoSrc}
      alt="Wappen SV Nord München-Lerchenau"
      width={size}
      height={size}
      priority={priority}
      className={className}
      style={{ width: size, height: "auto" }}
    />
  );
}
