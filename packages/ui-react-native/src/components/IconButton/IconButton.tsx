import { type ReactNode } from "react";
import { Button, type ButtonProps } from "../Button/index.js";
import { useNativeTheme } from "../hooks.js";
import { createIconButtonStyles, styles as iconButtonStyles } from "./IconButton.styles.js";

export type IconButtonProps = Omit<ButtonProps, "children"> & {
  icon?: ReactNode;
  label: string;
};

export function IconButton({ icon, label, size = "md", style, ...props }: IconButtonProps) {
  const theme = useNativeTheme();

  return (
    <Button
      {...props}
      size={size}
      accessibilityLabel={label}
      style={[iconButtonStyles.root, createIconButtonStyles(theme, size), style]}
    >
      {icon}
    </Button>
  );
}
