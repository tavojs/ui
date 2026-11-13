import { Flex, type FlexProps } from "../Flex/index.js";
import { stackDirection } from "./Stack.styles.js";

export type StackProps = Omit<FlexProps, "direction">;

export function Stack(props: StackProps) {
  return <Flex direction={stackDirection} {...props} />;
}
