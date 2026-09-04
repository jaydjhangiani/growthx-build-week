import Image from "next/image";

type ReleafLogoProps = {
  className?: string;
  priority?: boolean;
};

export function ReleafLogo({
  className = "",
  priority = false,
}: ReleafLogoProps) {
  return (
    <Image
      className={`releaf-logo ${className}`.trim()}
      src="/releaf-logo.jpg"
      alt="Releaf"
      width={800}
      height={800}
      priority={priority}
    />
  );
}
