import type { BaseProps } from "@/components/shared";

export type PortalProps = BaseProps & {
  disabled?: boolean;
};

export function Portal({ children }: PortalProps) {
  return <>{children}</>;
}
