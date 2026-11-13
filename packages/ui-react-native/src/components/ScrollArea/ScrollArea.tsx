import { ScrollView } from "react-native";
import { scrollAreaContentInsetAdjustmentBehavior } from "./ScrollArea.styles.js";

export type ScrollAreaProps = React.ComponentProps<typeof ScrollView>;

export function ScrollArea({ children, style, ...props }: ScrollAreaProps) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior={props.contentInsetAdjustmentBehavior ?? scrollAreaContentInsetAdjustmentBehavior}
      {...props}
      style={style}
    >
      {children}
    </ScrollView>
  );
}
