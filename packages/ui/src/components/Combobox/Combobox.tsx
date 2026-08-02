import styles from "./Combobox.module.scss";
import inputStyles from "../TextInput/TextInput.module.scss";
import { cx, sxClassName, type BaseProps, type Size } from "@/components/shared";

export type ComboboxOption = {
  label: string;
  value: string;
};

export type ComboboxProps = BaseProps & {
  name?: string;
  options: ComboboxOption[];
  size?: Size;
  listId?: string;
};

export function Combobox({ name, options, size = "md", listId, className = "", ...props }: ComboboxProps) {
  const id = listId ?? `${name ?? "combobox"}-options`;

  return (
    <>
      <input className={sxClassName(props, cx(inputStyles.input, inputStyles[`size-${size}`], styles.input, className))} list={id} name={name} role="combobox" {...props} />
      <datalist id={id}>
        {options.map((option) => (
          <option value={option.value} label={option.label} />
        ))}
      </datalist>
    </>
  );
}
