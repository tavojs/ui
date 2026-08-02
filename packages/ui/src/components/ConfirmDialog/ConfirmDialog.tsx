import type { Child } from "@tavojs/core";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { Inline } from "@/components/Inline";
import { Stack } from "@/components/Stack";
import { Text } from "@/components/Text";
import type { BaseProps } from "@/components/shared";

export type ConfirmDialogProps = BaseProps & {
  open?: boolean;
  title?: Child;
  description?: Child;
  confirmLabel?: Child;
  cancelLabel?: Child;
  tone?: "primary" | "danger";
  onConfirm?: () => void;
  onCancel?: () => void;
};

export function ConfirmDialog({
  children,
  open = false,
  title = "Confirm action",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
  ...props
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} title={title} onClose={onCancel} {...props}>
      <Stack>
        {description ? <Text color="muted">{description}</Text> : null}
        {children}
        <Inline>
          <Button tone={tone} onClick={onConfirm}>{confirmLabel}</Button>
          <Button variant="ghost" tone="neutral" onClick={onCancel}>{cancelLabel}</Button>
        </Inline>
      </Stack>
    </Dialog>
  );
}
