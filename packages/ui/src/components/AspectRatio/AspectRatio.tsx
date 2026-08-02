import styles from "./AspectRatio.module.scss";
import { cx, isResponsiveValue, responsiveVars, styleObject, sxClassName, type BaseProps, type ResponsiveValue } from "@/components/shared";

type Ratio = number | `${number}/${number}`;

export type AspectRatioProps = BaseProps & {
  ratio?: ResponsiveValue<Ratio>;
};

function resolveRatio(ratio: Ratio | undefined): string {
  if (typeof ratio === "number" && Number.isFinite(ratio) && ratio > 0) {
    return `${ratio}`;
  }
  if (typeof ratio === "string") {
    return ratio;
  }
  return "16/9";
}

export function AspectRatio({ children, className = "", ratio = "16/9", style, ...props }: AspectRatioProps) {
  const staticRatio = isResponsiveValue(ratio) ? undefined : resolveRatio(ratio);
  return (
    <div
      className={sxClassName(props, cx(styles.root, className))}
      style={{
        ...styleObject(style),
        ...responsiveVars(ratio, "--tui-aspect-ratio", resolveRatio),
        ...(staticRatio ? { aspectRatio: staticRatio } : {})
      }}
      {...props}
    >
      {children}
    </div>
  );
}
