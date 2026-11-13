import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text as NativeText,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewProps,
  type ViewStyle
} from "react-native";
import { Box } from "../Box/index.js";
import { Flex } from "../Flex/index.js";
import { Stack } from "../Stack/index.js";
import { Text } from "../Text/index.js";
import type { Gap, Spacing } from "../types.js";

type ContainerProps = ViewProps & { children?: ReactNode; style?: StyleProp<ViewStyle> };
const center: ViewStyle = { alignItems: "center", justifyContent: "center" };
const row: ViewStyle = { flexDirection: "row", alignItems: "center" };

export type AppBarProps = ContainerProps & { position?: "static" | "sticky" | "fixed" | "relative" };
export function AppBar({ position = "static", style, ...props }: AppBarProps) {
  return (
    <View
      {...props}
      accessibilityRole="header"
      style={[
        row,
        { minHeight: 56, paddingHorizontal: 16 },
        position === "fixed" && { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
        style
      ]}
    />
  );
}

export type AspectRatioProps = ContainerProps & { ratio?: number | `${number}/${number}` };
export function AspectRatio({ ratio = "16/9", style, ...props }: AspectRatioProps) {
  const parts = typeof ratio === "string" ? ratio.split("/").map(Number) : [ratio, 1];
  const value = parts[1] > 0 && parts[0] > 0 ? parts[0] / parts[1] : 1;
  return <View {...props} style={[{ aspectRatio: value, overflow: "hidden" }, style]} />;
}

export type GridProps = ContainerProps & {
  columns?: number;
  minItemWidth?: number;
  spacing?: Spacing | number;
  align?: "start" | "center" | "end" | "stretch";
};
export function Grid({ columns = 2, minItemWidth, spacing = "md", align = "stretch", style, ...props }: GridProps) {
  const gap = typeof spacing === "number" ? spacing : spacing === "sm" ? 8 : spacing === "lg" ? 24 : 16;
  const [width, setWidth] = useState(0);
  const count =
    minItemWidth && width ? Math.max(1, Math.floor((width + gap) / (minItemWidth + gap))) : Math.max(1, columns);
  const children = Array.isArray(props.children) ? props.children : [props.children];
  const alignItems = align === "start" ? "flex-start" : align === "end" ? "flex-end" : align;
  return (
    <View
      {...props}
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
        props.onLayout?.(event);
      }}
      style={[{ flexDirection: "row", flexWrap: "wrap", gap, alignItems }, style]}
    >
      {children.map((child, index) => (
        <View key={index} style={{ width: width ? (width - gap * (count - 1)) / count : `${100 / count}%` }}>
          {child}
        </View>
      ))}
    </View>
  );
}

export type GridRulerProps = ContainerProps & { spacing?: Spacing | number };
export function GridRuler({ spacing = "md", style, ...props }: GridRulerProps) {
  const gap = typeof spacing === "number" ? spacing : spacing === "sm" ? 8 : spacing === "lg" ? 24 : 16;
  return (
    <View
      {...props}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          gap,
          paddingHorizontal: gap
        },
        style
      ]}
    >
      {Array.from({ length: 12 }, (_, index) => (
        <View key={index} style={{ flex: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#d1d5db" }} />
      ))}
    </View>
  );
}

export type PageProps = ContainerProps & { size?: "sm" | "md" | "lg" | "xl" | "full"; padding?: Spacing | "none" };
export function Page({ size = "xl", padding = "lg", style, ...props }: PageProps) {
  return (
    <Box {...props} center fullWidth maxWidth={size === "full" ? undefined : size} padding={padding} style={style} />
  );
}

export type SectionProps = ContainerProps & {
  eyebrow?: ReactNode;
  title?: ReactNode;
  titleSize?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  description?: ReactNode;
  actions?: ReactNode;
  spacing?: Spacing;
};
export function Section({
  eyebrow,
  title,
  titleSize = "h2",
  description,
  actions,
  spacing = "md",
  children,
  style,
  ...props
}: SectionProps) {
  return (
    <Stack {...props} gap={spacing} style={style}>
      {(eyebrow || title || description || actions) && (
        <View>
          {eyebrow && (
            <Text variant="hint" color="muted">
              {eyebrow}
            </Text>
          )}
          <View style={[row, { justifyContent: "space-between" }]}>
            {title && <Text variant={titleSize}>{title}</Text>}
            {actions}
          </View>
          {description && <Text color="muted">{description}</Text>}
        </View>
      )}
      {children}
    </Stack>
  );
}

export type ShellProps = ContainerProps & { sidebar?: ReactNode; header?: ReactNode; rail?: "left" | "right" };
export function Shell({ sidebar, header, rail = "left", children, style, ...props }: ShellProps) {
  return (
    <View {...props} style={[{ flex: 1 }, style]}>
      {header}
      <View style={{ flex: 1, flexDirection: "row" }}>
        {rail === "left" && sidebar}
        <View style={{ flex: 1 }}>{children}</View>
        {rail === "right" && sidebar}
      </View>
    </View>
  );
}

export type SidebarProps = ContainerProps & { padding?: Spacing | "none" };
export function Sidebar({ padding = "md", style, ...props }: SidebarProps) {
  return <Box {...props} padding={padding} style={[{ width: 240 }, style]} />;
}

export type SplitPaneProps = ContainerProps & {
  aside?: ReactNode;
  side?: "left" | "right";
  ratio?: "third" | "half" | "golden" | number;
  gap?: Gap | number;
};
function SplitPaneBase({
  aside,
  side = "left",
  ratio = "third",
  gap = "md",
  children,
  style,
  ...props
}: SplitPaneProps) {
  const g = typeof gap === "number" ? gap : gap === "none" ? 0 : gap === "sm" ? 8 : gap === "lg" ? 24 : 16;
  const fraction = typeof ratio === "number" ? ratio : ratio === "half" ? 0.5 : ratio === "golden" ? 0.382 : 0.36;
  const asideFlex = Math.max(0.05, Math.min(0.95, fraction));
  const asideView = <View style={{ flex: asideFlex }}>{aside}</View>;
  return (
    <View {...props} style={[{ flexDirection: "row", gap: g }, style]}>
      {aside === undefined ? (
        children
      ) : (
        <>
          {side === "left" && asideView}
          <View style={{ flex: 1 - asideFlex }}>{children}</View>
          {side === "right" && asideView}
        </>
      )}
    </View>
  );
}
export type SplitPaneRegionProps = ContainerProps;
export function SplitPaneAside({ style, ...props }: SplitPaneRegionProps) {
  return <View {...props} style={[{ flex: 1 }, style]} />;
}
export function SplitPaneMain({ style, ...props }: SplitPaneRegionProps) {
  return <View {...props} style={[{ flex: 2 }, style]} />;
}
export const SplitPaneRoot = SplitPaneBase;
export const SplitPane = Object.assign(SplitPaneBase, {
  Root: SplitPaneRoot,
  Aside: SplitPaneAside,
  Main: SplitPaneMain
});

export type ToolbarProps = ContainerProps & {
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  gap?: Gap | number;
  wrap?: boolean;
  title?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
};
export function Toolbar({
  align = "center",
  justify = "between",
  gap = "md",
  wrap = false,
  title,
  filters,
  actions,
  children,
  style,
  ...props
}: ToolbarProps) {
  return (
    <Flex {...props} align={align} justify={justify} gap={gap} wrap={wrap} style={style}>
      {title && <Text variant="h4">{title}</Text>}
      {filters}
      {children}
      {actions}
    </Flex>
  );
}

export type OverlayProps = ContainerProps & {
  open?: boolean;
  scrim?: "none" | "soft" | "strong";
  center?: boolean;
  onClose?: () => void;
};
export function Overlay({
  open = false,
  scrim = "soft",
  center: centered = false,
  onClose,
  children,
  style,
  ...props
}: OverlayProps) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View
        {...props}
        style={[
          { flex: 1, backgroundColor: scrim === "none" ? "transparent" : scrim === "strong" ? "#0009" : "#0006" },
          centered && center,
          style
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close overlay"
          onPress={onClose}
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
        />
        {children}
      </View>
    </Modal>
  );
}

export type PortalProps = ContainerProps & { disabled?: boolean };
export function Portal({ disabled = false, children, style, ...props }: PortalProps) {
  if (disabled)
    return (
      <View {...props} style={style}>
        {children}
      </View>
    );
  return (
    <Modal visible transparent onRequestClose={() => {}}>
      <View {...props} style={[{ flex: 1 }, style]}>
        {children}
      </View>
    </Modal>
  );
}

export type FocusTrapProps = ContainerProps & { active?: boolean };
export function FocusTrap({ active = true, style, ...props }: FocusTrapProps) {
  return <View {...props} accessibilityViewIsModal={active} style={style} />;
}

export type ResizableProps = ContainerProps & {
  orientation?: "horizontal" | "vertical";
  direction?: "horizontal" | "vertical";
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onValueInput?: (value: number) => void;
  onValueChange?: (value: number) => void;
  onResizeStart?: (value: number) => void;
  onResizeCancel?: (value: number) => void;
};
function ResizableBase({
  orientation,
  direction,
  value,
  defaultValue = 50,
  min = 10,
  max = 90,
  step = 1,
  disabled = false,
  onValueInput,
  onValueChange,
  onResizeStart,
  onResizeCancel,
  children,
  style,
  ...props
}: ResizableProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const axis = orientation ?? direction ?? "horizontal";
  const [length, setLength] = useState(1);
  const start = useRef(current);
  const latest = useRef(current);
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: () => {
          start.current = current;
          latest.current = current;
          onResizeStart?.(current);
        },
        onPanResponderMove: (_, gesture) => {
          const delta = axis === "horizontal" ? gesture.dx : gesture.dy;
          const interval = step > 0 ? step : 1;
          const next = Math.max(
            min,
            Math.min(max, Math.round((start.current + (delta / length) * 100) / interval) * interval)
          );
          latest.current = next;
          if (value === undefined) setInternal(next);
          onValueInput?.(next);
        },
        onPanResponderRelease: () => onValueChange?.(latest.current),
        onPanResponderTerminate: () => onResizeCancel?.(start.current)
      }),
    [axis, current, disabled, length, max, min, onResizeCancel, onResizeStart, onValueChange, onValueInput, step, value]
  );
  const parts = Array.isArray(children) ? children : [children];
  return (
    <View
      {...props}
      onLayout={(event: LayoutChangeEvent) => {
        setLength(axis === "horizontal" ? event.nativeEvent.layout.width : event.nativeEvent.layout.height);
        props.onLayout?.(event);
      }}
      style={[{ flexDirection: axis === "horizontal" ? "row" : "column" }, style]}
    >
      <View style={{ flex: current }}>{parts[0]}</View>
      <View
        {...responder.panHandlers}
        accessibilityRole="adjustable"
        accessibilityValue={{ min, max, now: current }}
        style={[
          center,
          { width: axis === "horizontal" ? 20 : undefined, height: axis === "vertical" ? 20 : undefined }
        ]}
      >
        <View
          style={{
            backgroundColor: "#9ca3af",
            width: axis === "horizontal" ? 2 : 24,
            height: axis === "horizontal" ? 24 : 2
          }}
        />
      </View>
      <View style={{ flex: 100 - current }}>{parts[1]}</View>
    </View>
  );
}
export const ResizablePanel = View;
export const ResizableHandle = View;
export const ResizableRoot = ResizableBase;
export const Resizable = Object.assign(ResizableBase, {
  Root: ResizableRoot,
  Panel: ResizablePanel,
  Handle: ResizableHandle
});

export type VisuallyHiddenProps = ContainerProps & { focusable?: boolean };
export function VisuallyHidden({ focusable = false, style, ...props }: VisuallyHiddenProps) {
  return (
    <View
      {...props}
      focusable={focusable}
      style={[{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }, style]}
    />
  );
}
