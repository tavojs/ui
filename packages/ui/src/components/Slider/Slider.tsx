import styles from "./Slider.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";

export type SliderProps = BaseProps & {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
};

export function Slider({ className = "", min = 0, max = 100, step = 1, ...props }: SliderProps) {
  return <input type="range" className={sxClassName(props, cx(styles.slider, className))} min={min} max={max} step={step} {...props} />;
}
