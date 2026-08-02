import type { Child, VNode } from "@tavojs/core";
import styles from "./RadioGroup.module.scss";
import { cv, cx, sxClassName, type BaseProps } from "@/components/shared";
import { Radio } from "@/components/Radio";

export type RadioGroupProps = BaseProps & {
  name: string;
  orientation?: "horizontal" | "vertical";
};

function isVNode(value: Child): value is VNode {
  return typeof value === "object" && value !== null && "type" in value && "props" in value;
}

function withRadioName(child: Child, name: string): Child {
  if (Array.isArray(child)) {
    return child.map((item) => withRadioName(item, name));
  }

  if (!isVNode(child)) {
    return child;
  }

  const nextChildren = child.props.children.map((item) => withRadioName(item, name));
  const nextProps = child.type === Radio && child.props.name === undefined
    ? { ...child.props, name, children: nextChildren }
    : { ...child.props, children: nextChildren };

  return {
    ...child,
    props: nextProps
  };
}

export function RadioGroup({ children, className = "", name, orientation = "vertical", ...props }: RadioGroupProps) {
  return (
    <fieldset className={sxClassName(props, cx(styles.group, cv(styles, "orientation", orientation, "vertical"), className))} name={name} {...props}>
      {withRadioName(children, name)}
    </fieldset>
  );
}
