import { TextInput, type TextInputProps } from "../TextInput/index.js";
import { styles } from "./Textarea.styles.js";

export function Textarea(props: TextInputProps) {
  return <TextInput multiline textAlignVertical="top" {...props} style={[styles.root, props.style]} />;
}
