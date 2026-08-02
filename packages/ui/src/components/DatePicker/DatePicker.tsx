import styles from "./DatePicker.module.scss";
import { Calendar } from "@/components/Calendar";
import { Popover } from "@/components/Popover";
import { cx, sxClassName, type BaseProps, type Size } from "@/components/shared";
import { TextInput } from "@/components/TextInput";

export type DatePickerProps = BaseProps & {
  name?: string;
  value?: string;
  min?: string;
  max?: string;
  size?: Size;
  year?: number;
  month?: number;
  open?: boolean;
  renderCalendarWhenClosed?: boolean;
  onValueChange?: (value: string) => void;
};

export function DatePicker({
  className = "",
  name,
  value,
  min,
  max,
  size = "md",
  year,
  month,
  open = false,
  renderCalendarWhenClosed = true,
  onValueChange,
  ...props
}: DatePickerProps) {
  const shouldRenderCalendar = open || renderCalendarWhenClosed;

  return (
    <Popover className={sxClassName(props, cx(styles.root, className))} open={open} {...props}>
      <Popover.Trigger>
        <TextInput
          type="date"
          name={name}
          value={value}
          min={min}
          max={max}
          size={size}
          onChange={onValueChange ? (event) => onValueChange(event.currentTarget.value) : undefined}
        />
      </Popover.Trigger>
      {shouldRenderCalendar ? (
        <Popover.Content className={styles.content}>
          <Calendar
            selected={value}
            min={min}
            max={max}
            year={year}
            month={month}
            onSelect={onValueChange}
          />
        </Popover.Content>
      ) : null}
    </Popover>
  );
}
