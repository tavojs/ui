import { Flex, type FlexProps } from "../Flex/index.js";
import { inlineDefaultAlign, inlineDirection } from "./Inline.styles.js";

export type InlineProps = Omit<FlexProps, "direction">;

export function Inline(props: InlineProps) {
  return <Flex direction={inlineDirection} align={props.align ?? inlineDefaultAlign} {...props} />;
}
