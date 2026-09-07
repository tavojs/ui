import type { Child } from "@tavojs/core";
import styles from "./FileTrigger.module.scss";
import { Button, type ButtonProps } from "@/components/Button";
import type { TavoEventHandler } from "@/components/shared";

export type FileTriggerProps = Omit<ButtonProps, "as" | "href" | "type" | "children" | "onChange"> & {
  children?: Child;
  accept?: string;
  multiple?: boolean;
  capture?: boolean | "user" | "environment" | string;
  name?: string;
  resetAfterSelection?: boolean;
  disabled?: boolean;
  onClick?: TavoEventHandler<MouseEvent>;
  onFilesChange?: (files: FileList, event: Event & { currentTarget: HTMLInputElement }) => void;
};

export function FileTrigger({
  children,
  accept,
  multiple = false,
  capture,
  name,
  disabled = false,
  resetAfterSelection = true,
  onFilesChange,
  onClick,
  ...buttonProps
}: FileTriggerProps) {
  return (
    <span className={styles.root}>
      <Button
        {...buttonProps}
        disabled={Boolean(disabled)}
        onClick={(event: MouseEvent) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          const owner = (event.currentTarget as HTMLButtonElement).closest(`.${styles.root}`);
          owner?.querySelector<HTMLInputElement>('input[type="file"]')?.click();
        }}
      >
        {children}
      </Button>
      <input
        className={styles.input}
        type="file"
        tabIndex={-1}
        accept={accept}
        multiple={multiple}
        capture={capture}
        name={name}
        disabled={Boolean(disabled)}
        onChange={(event: Event & { currentTarget: HTMLInputElement }) => {
          const files = event.currentTarget.files;
          if (files) onFilesChange?.(files, event);
          if (resetAfterSelection) event.currentTarget.value = "";
        }}
      />
    </span>
  );
}
