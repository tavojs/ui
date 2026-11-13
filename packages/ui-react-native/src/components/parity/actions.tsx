import { createContext, useContext, useState, type ReactNode } from "react";
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle
} from "react-native";
import { Button } from "../Button/index.js";
import { Stack } from "../Stack/index.js";
import { Text } from "../Text/index.js";
import type { Tone } from "../types.js";

type ContainerProps = ViewProps & { children?: ReactNode; style?: StyleProp<ViewStyle> };
type DisclosureContextValue = { open: boolean; setOpen: (open: boolean) => void };
const DisclosureContext = createContext<DisclosureContextValue>({ open: false, setOpen: () => {} });
function useDisclosure(value?: boolean, initial = false, onChange?: (open: boolean) => void): DisclosureContextValue {
  const [internal, setInternal] = useState(initial);
  return {
    open: value ?? internal,
    setOpen: (next) => {
      if (value === undefined) setInternal(next);
      onChange?.(next);
    }
  };
}
function DisclosureTrigger({ children, label, style, ...props }: ContainerProps & { label?: string }) {
  const state = useContext(DisclosureContext);
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ expanded: state.open }}
      onPress={() => state.setOpen(!state.open)}
      style={style}
    >
      <Text>{children}</Text>
    </Pressable>
  );
}
function DisclosureContent({ children, style, ...props }: ContainerProps) {
  const state = useContext(DisclosureContext);
  return state.open ? (
    <View {...props} style={style}>
      {children}
    </View>
  ) : null;
}
function FloatingContent({ children, style, ...props }: ContainerProps) {
  const state = useContext(DisclosureContext);
  return state.open ? (
    <View
      {...props}
      accessibilityViewIsModal
      style={[
        {
          position: "absolute",
          top: "100%",
          left: 0,
          zIndex: 20,
          minWidth: 180,
          padding: 8,
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 8,
          backgroundColor: "#fff",
          elevation: 6
        },
        style
      ]}
    >
      {children}
    </View>
  ) : null;
}

export type CollapsibleProps = ContainerProps & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason: "trigger" | "programmatic") => void;
  showArrow?: boolean;
  centerTrigger?: boolean;
};
function CollapsibleBase({
  open,
  defaultOpen = false,
  onOpenChange,
  showArrow,
  centerTrigger,
  style,
  ...props
}: CollapsibleProps) {
  const disclosure = useDisclosure(open, defaultOpen, (next) => onOpenChange?.(next, "trigger"));
  return (
    <DisclosureContext.Provider value={disclosure}>
      <View {...props} style={style} />
    </DisclosureContext.Provider>
  );
}
export const CollapsibleTrigger = DisclosureTrigger;
export const CollapsibleContent = DisclosureContent;
export const CollapsibleRoot = CollapsibleBase;
export const Collapsible = Object.assign(CollapsibleBase, {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent
});

export type CommandMenuItem = {
  label: string;
  description?: string;
  shortcut?: string;
  href?: string;
  disabled?: boolean;
  onSelect?: () => void;
};
export type CommandMenuProps = ContainerProps & { items: CommandMenuItem[]; placeholder?: string };
export function CommandMenu({ items, placeholder = "Search commands", style, ...props }: CommandMenuProps) {
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) =>
    `${item.label} ${item.description ?? ""}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <View {...props} style={[{ gap: 8 }, style]}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        accessibilityLabel={placeholder}
        style={{ borderWidth: 1, borderColor: "#9ca3af", padding: 8, borderRadius: 8 }}
      />
      <ScrollView keyboardShouldPersistTaps="handled">
        {filtered.map((item, index) => (
          <Pressable
            key={index}
            disabled={item.disabled}
            accessibilityRole="button"
            accessibilityState={{ disabled: item.disabled }}
            onPress={() => {
              item.onSelect?.();
              if (item.href) void Linking.openURL(item.href);
            }}
            style={{ padding: 10, opacity: item.disabled ? 0.5 : 1 }}
          >
            <Text color="heading">{item.label}</Text>
            {item.description && (
              <Text variant="hint" color="muted">
                {item.description}
              </Text>
            )}
            {item.shortcut && <Text variant="hint">{item.shortcut}</Text>}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export type DialogProps = ContainerProps & {
  open?: boolean;
  title?: ReactNode;
  onClose?: () => void;
  fullScreen?: boolean;
  closeLabel?: string;
  labelledBy?: string;
  describedBy?: string;
};
export function Dialog({
  open = false,
  title,
  onClose,
  fullScreen = false,
  closeLabel = "Close",
  labelledBy,
  describedBy,
  children,
  style,
  ...props
}: DialogProps) {
  return (
    <Modal visible={open} transparent={!fullScreen} animationType="fade" onRequestClose={onClose}>
      <View
        style={[
          {
            flex: 1,
            justifyContent: "center",
            backgroundColor: fullScreen ? "#fff" : "#0007",
            padding: fullScreen ? 0 : 24
          }
        ]}
      >
        <View
          {...props}
          accessibilityViewIsModal
          style={[
            { backgroundColor: "white", borderRadius: fullScreen ? 0 : 12, padding: 20, maxHeight: "90%" },
            fullScreen && { flex: 1 },
            style
          ]}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            {title && <Text variant="h4">{title}</Text>}
            <Button variant="ghost" accessibilityLabel={closeLabel} onPress={onClose}>
              ×
            </Button>
          </View>
          <ScrollView>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export type ConfirmDialogProps = DialogProps & {
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  onConfirm?: () => void;
  onCancel?: () => void;
};
export function ConfirmDialog({
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  onConfirm,
  onCancel,
  onClose,
  children,
  ...props
}: ConfirmDialogProps) {
  return (
    <Dialog {...props} onClose={onCancel ?? onClose}>
      <Stack gap="md">
        {description && <Text>{description}</Text>}
        {children}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" onPress={onCancel ?? onClose}>
            {cancelLabel}
          </Button>
          <Button tone={tone} onPress={onConfirm}>
            {confirmLabel}
          </Button>
        </View>
      </Stack>
    </Dialog>
  );
}

export type DropdownMenuProps = ContainerProps & {
  open?: boolean;
  defaultOpen?: boolean;
  align?: "start" | "end";
  onClose?: () => void;
  onOpenChange?: (open: boolean, reason: "trigger" | "select") => void;
  showArrow?: boolean;
};
function DropdownMenuBase({
  open,
  defaultOpen = false,
  align,
  showArrow,
  onClose,
  onOpenChange,
  style,
  ...props
}: DropdownMenuProps) {
  const disclosure = useDisclosure(open, defaultOpen, (next) => {
    onOpenChange?.(next, "trigger");
    if (!next) onClose?.();
  });
  return (
    <DisclosureContext.Provider value={disclosure}>
      <View {...props} style={style} />
    </DisclosureContext.Provider>
  );
}
export const DropdownMenuTrigger = DisclosureTrigger;
export const DropdownMenuContent = FloatingContent;
export type DropdownMenuItemProps = ContainerProps & {
  href?: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  onSelect?: () => void;
};
export function DropdownMenuItem({
  href,
  disabled = false,
  closeOnSelect = true,
  onSelect,
  children,
  style,
  ...props
}: DropdownMenuItemProps) {
  const disclosure = useContext(DisclosureContext);
  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole="menuitem"
      accessibilityState={{ disabled }}
      onPress={() => {
        onSelect?.();
        if (href) void Linking.openURL(href);
        if (closeOnSelect) disclosure.setOpen(false);
      }}
      style={[{ padding: 10 }, style]}
    >
      <Text>{children}</Text>
    </Pressable>
  );
}
export const DropdownMenuRoot = DropdownMenuBase;
export const DropdownMenu = Object.assign(DropdownMenuBase, {
  Root: DropdownMenuRoot,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem
});

export type HoverCardProps = ContainerProps;
function HoverCardBase({ style, ...props }: HoverCardProps) {
  const disclosure = useDisclosure();
  return (
    <DisclosureContext.Provider value={disclosure}>
      <View {...props} style={style} />
    </DisclosureContext.Provider>
  );
}
export const HoverCardTrigger = DisclosureTrigger;
export const HoverCardContent = FloatingContent;
export const HoverCardRoot = HoverCardBase;
export const HoverCard = Object.assign(HoverCardBase, {
  Root: HoverCardRoot,
  Trigger: HoverCardTrigger,
  Content: HoverCardContent
});

export type MenubarProps = ContainerProps;
function MenubarBase({ style, ...props }: MenubarProps) {
  return (
    <View {...props} accessibilityRole="menu" style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, style]} />
  );
}
export type MenubarItemProps = ContainerProps & {
  href?: string;
  current?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};
export function MenubarItem({ href, current, disabled, onPress, children, style, ...props }: MenubarItemProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="menuitem"
      accessibilityState={{ selected: current, disabled }}
      disabled={disabled}
      onPress={() => {
        onPress?.();
        if (href) void Linking.openURL(href);
      }}
      style={[{ padding: 8 }, style]}
    >
      <Text>{children}</Text>
    </Pressable>
  );
}
export const MenubarRoot = MenubarBase;
export const Menubar = Object.assign(MenubarBase, { Root: MenubarRoot, Item: MenubarItem });

export type NavigationMenuItem = {
  label: string;
  href?: string;
  description?: string;
  current?: boolean;
  onPress?: () => void;
};
export type NavigationMenuProps = ContainerProps & {
  items?: NavigationMenuItem[];
  orientation?: "horizontal" | "vertical";
};
export function NavigationMenu({ items, orientation = "horizontal", children, style, ...props }: NavigationMenuProps) {
  return (
    <View
      {...props}
      accessibilityRole="menu"
      style={[{ flexDirection: orientation === "horizontal" ? "row" : "column", gap: 8 }, style]}
    >
      {items
        ? items.map((item, index) => (
            <Pressable
              key={index}
              accessibilityRole="link"
              accessibilityState={{ selected: item.current }}
              onPress={() => {
                item.onPress?.();
                if (item.href) void Linking.openURL(item.href);
              }}
              style={{ padding: 8 }}
            >
              <Text color={item.current ? "primary" : "auto"}>{item.label}</Text>
              {item.description && <Text variant="hint">{item.description}</Text>}
            </Pressable>
          ))
        : children}
    </View>
  );
}

export type PopoverProps = ContainerProps & {
  open?: boolean;
  defaultOpen?: boolean;
  placement?: "top" | "right" | "bottom" | "left";
  onOpenChange?: (open: boolean, reason: "trigger" | "close") => void;
};
function PopoverBase({ open, defaultOpen = false, placement, onOpenChange, style, ...props }: PopoverProps) {
  const disclosure = useDisclosure(open, defaultOpen, (next) => onOpenChange?.(next, next ? "trigger" : "close"));
  return (
    <DisclosureContext.Provider value={disclosure}>
      <View {...props} style={style} />
    </DisclosureContext.Provider>
  );
}
export const PopoverTrigger = DisclosureTrigger;
export const PopoverContent = FloatingContent;
export function PopoverClose({ children, ...props }: ContainerProps) {
  const disclosure = useContext(DisclosureContext);
  return (
    <Pressable {...props} accessibilityRole="button" onPress={() => disclosure.setOpen(false)}>
      <Text>{children ?? "Close"}</Text>
    </Pressable>
  );
}
export const PopoverRoot = PopoverBase;
export const Popover = Object.assign(PopoverBase, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Close: PopoverClose
});

export type SheetProps = ContainerProps & {
  open?: boolean;
  side?: "left" | "right" | "top" | "bottom";
  onClose?: () => void;
  labelledBy?: string;
};
function SheetBase({ open = false, side = "right", onClose, labelledBy, children, style, ...props }: SheetProps) {
  const horizontal = side === "left" || side === "right";
  const panel = (
    <View
      {...props}
      accessibilityViewIsModal
      style={[
        {
          backgroundColor: "white",
          width: horizontal ? "80%" : "100%",
          height: horizontal ? "100%" : "55%",
          padding: 16
        },
        style
      ]}
    >
      {children}
    </View>
  );
  const backdrop = <Pressable onPress={onClose} accessibilityLabel="Close sheet" style={{ flex: 1 }} />;
  return (
    <SheetContext.Provider value={onClose}>
      <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
        <View style={{ flex: 1, flexDirection: horizontal ? "row" : "column", backgroundColor: "#0007" }}>
          {side === "left" || side === "top" ? (
            <>
              {panel}
              {backdrop}
            </>
          ) : (
            <>
              {backdrop}
              {panel}
            </>
          )}
        </View>
      </Modal>
    </SheetContext.Provider>
  );
}
const SheetContext = createContext<(() => void) | undefined>(undefined);
export function SheetTrigger({ children, onPress }: { children?: ReactNode; onPress?: () => void }) {
  return (
    <Button variant="outline" onPress={onPress}>
      {children}
    </Button>
  );
}
export function SheetContent({ style, ...props }: ContainerProps) {
  return <View {...props} style={style} />;
}
export function SheetClose({
  children = "Close",
  label = "Close sheet",
  onPress
}: {
  children?: ReactNode;
  label?: string;
  onPress?: () => void;
}) {
  const close = useContext(SheetContext);
  return (
    <Button variant="ghost" accessibilityLabel={label} onPress={onPress ?? close}>
      {children}
    </Button>
  );
}
export const SheetRoot = SheetBase;
export const Sheet = Object.assign(SheetBase, {
  Root: SheetRoot,
  Trigger: SheetTrigger,
  Content: SheetContent,
  Close: SheetClose
});

export type TabItem = { id: string; label: ReactNode; content?: ReactNode; disabled?: boolean };
export type TabsProps = ContainerProps & {
  tabs: TabItem[];
  activeId: string;
  onChange?: (id: string) => void;
  orientation?: "horizontal" | "vertical";
};
export function Tabs({ tabs, activeId, onChange, orientation = "horizontal", children, style, ...props }: TabsProps) {
  return (
    <View {...props} style={[{ flexDirection: orientation === "vertical" ? "row" : "column" }, style]}>
      <View accessibilityRole="tablist" style={{ flexDirection: orientation === "horizontal" ? "row" : "column" }}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.id}
            disabled={tab.disabled}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeId === tab.id, disabled: tab.disabled }}
            onPress={() => onChange?.(tab.id)}
            style={{ padding: 12, borderBottomWidth: activeId === tab.id ? 2 : 0, borderColor: "#6366f1" }}
          >
            <Text>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
      <View accessibilityRole="none" style={{ flex: 1, padding: 12 }}>
        {tabs.find((tab) => tab.id === activeId)?.content ?? children}
      </View>
    </View>
  );
}

export type ToastProps = ContainerProps & {
  title?: ReactNode;
  tone?: "info" | "success" | "warning" | "danger";
  action?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
};
export function Toast({ title, action, onClose, closeLabel = "Dismiss", children, style, ...props }: ToastProps) {
  return (
    <View
      {...props}
      accessibilityRole="alert"
      style={[
        {
          padding: 12,
          borderRadius: 8,
          backgroundColor: "#f3f4f6",
          flexDirection: "row",
          alignItems: "center",
          gap: 8
        },
        style
      ]}
    >
      <View style={{ flex: 1 }}>
        {title && <Text color="heading">{title}</Text>}
        {children}
      </View>
      {action}
      {onClose && (
        <Button variant="ghost" accessibilityLabel={closeLabel} onPress={onClose}>
          ×
        </Button>
      )}
    </View>
  );
}

export type TooltipProps = ContainerProps & { content: ReactNode; side?: "top" | "right" | "bottom" | "left" };
export function Tooltip({ content, side = "top", children, style, ...props }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const placement =
    side === "top"
      ? { bottom: "100%" as const }
      : side === "bottom"
      ? { top: "100%" as const }
      : side === "left"
      ? { right: "100%" as const }
      : { left: "100%" as const };
  return (
    <View {...props} style={style}>
      <Pressable accessibilityRole="button" onPress={() => setOpen(!open)} onLongPress={() => setOpen(true)}>
        {children}
      </Pressable>
      {open && (
        <Pressable
          onPress={() => setOpen(false)}
          style={[
            { position: "absolute", backgroundColor: "#111827", borderRadius: 6, padding: 6, zIndex: 10 },
            placement
          ]}
        >
          <Text style={{ color: "white" }}>{content}</Text>
        </Pressable>
      )}
    </View>
  );
}

export type TreeViewSelectionMode = "none" | "single" | "multiple";
export type TreeViewDropEvent = { sourceId: string; targetId: string; placement: "inside" };
export type TreeViewProps = ContainerProps & {
  selectedIds?: readonly string[];
  defaultSelectedIds?: readonly string[];
  selectionMode?: TreeViewSelectionMode;
  expandedIds?: readonly string[];
  defaultExpandedIds?: readonly string[];
  onSelectionChange?: (ids: string[]) => void;
  onExpandedChange?: (ids: string[]) => void;
  onActivate?: (id: string) => void;
  onDrop?: (event: TreeViewDropEvent) => void;
};
type TreeContextValue = {
  selected: readonly string[];
  expanded: readonly string[];
  mode: TreeViewSelectionMode;
  dragSource?: string;
  beginDrag: (id: string) => void;
  drop: (id: string) => boolean;
  select: (id: string) => void;
  expand: (id: string) => void;
  activate?: (id: string) => void;
};
const TreeContext = createContext<TreeContextValue>({
  selected: [],
  expanded: [],
  mode: "single",
  beginDrag: () => {},
  drop: () => false,
  select: () => {},
  expand: () => {}
});
function TreeViewBase({
  selectedIds,
  defaultSelectedIds = [],
  selectionMode = "single",
  expandedIds,
  defaultExpandedIds = [],
  onSelectionChange,
  onExpandedChange,
  onActivate,
  onDrop,
  children,
  style,
  ...props
}: TreeViewProps) {
  const [selection, setSelection] = useState<readonly string[]>(defaultSelectedIds);
  const [expansion, setExpansion] = useState<readonly string[]>(defaultExpandedIds);
  const [dragSource, setDragSource] = useState<string>();
  const selected = selectedIds ?? selection,
    expanded = expandedIds ?? expansion;
  const context: TreeContextValue = {
    selected,
    expanded,
    mode: selectionMode,
    dragSource,
    beginDrag: setDragSource,
    drop: (id) => {
      if (!dragSource || dragSource === id) return false;
      onDrop?.({ sourceId: dragSource, targetId: id, placement: "inside" });
      setDragSource(undefined);
      return true;
    },
    activate: onActivate,
    select: (id) => {
      if (selectionMode === "none") return;
      const next =
        selectionMode === "single"
          ? [id]
          : selected.includes(id)
          ? selected.filter((item) => item !== id)
          : [...selected, id];
      if (selectedIds === undefined) setSelection(next);
      onSelectionChange?.(next);
    },
    expand: (id) => {
      const next = expanded.includes(id) ? expanded.filter((item) => item !== id) : [...expanded, id];
      if (expandedIds === undefined) setExpansion(next);
      onExpandedChange?.(next);
    }
  };
  return (
    <TreeContext.Provider value={context}>
      <View {...props} accessibilityRole="none" style={style}>
        {children}
      </View>
    </TreeContext.Provider>
  );
}
export type TreeViewItemProps = ContainerProps & {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  depth?: number;
  disabled?: boolean;
  draggable?: boolean;
  expanded?: boolean;
  expandable?: boolean;
};
export function TreeViewItem({
  id,
  label,
  description,
  depth = 0,
  disabled = false,
  draggable = false,
  expanded,
  expandable = false,
  children,
  style,
  ...props
}: TreeViewItemProps) {
  const tree = useContext(TreeContext);
  const isExpanded = expanded ?? tree.expanded.includes(id);
  const hasChildren = expandable || children !== undefined;
  return (
    <View {...props} style={style}>
      <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{
          selected: tree.selected.includes(id),
          expanded: hasChildren ? isExpanded : undefined,
          disabled
        }}
        onLongPress={draggable ? () => tree.beginDrag(id) : undefined}
        onPress={() => {
          if (!tree.drop(id)) {
            tree.select(id);
            tree.activate?.(id);
          }
        }}
        style={{
          paddingLeft: depth * 16,
          paddingVertical: 8,
          flexDirection: "row",
          gap: 8,
          backgroundColor: tree.dragSource === id ? "#e0e7ff" : undefined
        }}
      >
        <Text>{label}</Text>
        {description && (
          <Text variant="hint" color="muted">
            {description}
          </Text>
        )}
        {hasChildren && <Text onPress={() => tree.expand(id)}>{isExpanded ? "▾" : "▸"}</Text>}
      </Pressable>
      {isExpanded && children}
    </View>
  );
}
export const TreeViewRoot = TreeViewBase;
export const TreeView = Object.assign(TreeViewBase, { Root: TreeViewRoot, Item: TreeViewItem });
