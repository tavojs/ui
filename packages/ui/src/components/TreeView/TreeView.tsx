import type { Child, VNode } from "@tavojs/core";
import styles from "./TreeView.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";

export type TreeViewSelectionMode = "none" | "single" | "multiple";
export type TreeViewDropPlacement = "before" | "inside" | "after";

export type TreeViewDropState = {
  placement: TreeViewDropPlacement;
  valid: boolean;
};

export type TreeViewDropEvent = {
  sourceId: string;
  targetId: string;
  placement: TreeViewDropPlacement;
};

export type TreeViewProps = BaseProps & {
  selectedIds?: readonly string[];
  defaultSelectedIds?: readonly string[];
  selectionMode?: TreeViewSelectionMode;
  selectionAnchorId?: string;
  expandedIds?: readonly string[];
  defaultExpandedIds?: readonly string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onExpandedChange?: (expandedIds: string[]) => void;
  onActivate?: (id: string) => void;
  onDrop?: (event: TreeViewDropEvent) => void;
};

export type TreeViewItemProps = BaseProps & {
  id: string;
  label: Child;
  description?: Child;
  depth?: number;
  disabled?: boolean;
  draggable?: boolean;
  expanded?: boolean;
  dropState?: TreeViewDropState;
  expandLabel?: string;
};

type TreeContext = {
  order: string[];
  selectedIds: string[];
  expandedIds: string[];
  selectionMode: TreeViewSelectionMode;
  anchor: { id?: string };
  focusId?: string;
  drag: { sourceId?: string };
  controlledSelection: boolean;
  controlledExpansion: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  onExpandedChange?: (expandedIds: string[]) => void;
  onActivate?: (id: string) => void;
  onDrop?: (event: TreeViewDropEvent) => void;
};

type InternalTreeViewItemProps = TreeViewItemProps & {
  __tree?: TreeContext;
  __depth?: number;
  __position?: number;
  __setSize?: number;
};

function isVNode(value: Child): value is VNode {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "type" in value && "props" in value;
}

function childArray(children: Child | undefined): Child[] {
  if (children === undefined || children === null || children === false) return [];
  return Array.isArray(children) ? children.flatMap(childArray) : [children];
}

function collectVisibleTreeItemIds(child: Child, expandedIds: ReadonlySet<string>, ids: string[]) {
  if (Array.isArray(child)) {
    child.forEach((item) => collectVisibleTreeItemIds(item, expandedIds, ids));
    return;
  }
  if (!isVNode(child) || child.type !== TreeViewItem || typeof child.props.id !== "string") return;
  ids.push(child.props.id);
  const isExpanded = typeof child.props.expanded === "boolean"
    ? child.props.expanded
    : expandedIds.has(child.props.id);
  if (isExpanded) {
    childArray(child.props.children as Child).forEach((item) => collectVisibleTreeItemIds(item, expandedIds, ids));
  }
}

function withTreeContext(child: Child, context: TreeContext, depth = 0): Child {
  if (Array.isArray(child)) {
    const siblings = child.filter((item) => isVNode(item) && item.type === TreeViewItem);
    let position = 0;
    return child.map((item) => {
      if (isVNode(item) && item.type === TreeViewItem) position += 1;
      return withTreeContextItem(item, context, depth, position, siblings.length);
    });
  }
  return withTreeContextItem(child, context, depth, 1, 1);
}

function withTreeContextItem(
  child: Child,
  context: TreeContext,
  depth: number,
  position: number,
  setSize: number,
): Child {
  if (!isVNode(child) || child.type !== TreeViewItem) return child;
  const explicitDepth = typeof child.props.depth === "number" ? child.props.depth : depth;
  const nested = withTreeContext(child.props.children as Child, context, explicitDepth + 1);
  return {
    ...child,
    props: {
      ...child.props,
      children: childArray(nested),
      __tree: context,
      __depth: explicitDepth,
      __position: position,
      __setSize: setSize,
    },
  };
}

function focusRelativeTreeItem(current: HTMLElement, offset: number) {
  const tree = current.closest('[role="tree"]');
  if (!tree) return;
  const items = Array.from(tree.querySelectorAll<HTMLElement>('[role="treeitem"]:not([aria-disabled="true"])'))
    .filter((item) => item.offsetParent !== null);
  const index = items.indexOf(current);
  const nextIndex = offset === Number.NEGATIVE_INFINITY
    ? 0
    : offset === Number.POSITIVE_INFINITY
      ? items.length - 1
      : Math.min(items.length - 1, Math.max(0, index + offset));
  const next = items[nextIndex];
  if (next) {
    current.tabIndex = -1;
    next.tabIndex = 0;
    next.focus();
  }
}

export function nextTreeSelection(
  order: readonly string[],
  selectedIds: readonly string[],
  id: string,
  mode: TreeViewSelectionMode,
  options: { additive?: boolean; range?: boolean; anchorId?: string } = {},
): string[] {
  if (mode === "none") return [...selectedIds];
  if (mode === "single") return [id];
  if (options.range) {
    const anchorIndex = order.indexOf(options.anchorId ?? id);
    const itemIndex = order.indexOf(id);
    if (anchorIndex >= 0 && itemIndex >= 0) {
      const range = order.slice(Math.min(anchorIndex, itemIndex), Math.max(anchorIndex, itemIndex) + 1);
      return options.additive ? [...new Set([...selectedIds, ...range])] : range;
    }
  }
  if (options.additive) {
    return selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];
  }
  return [id];
}

function TreeViewBase({
  children,
  className = "",
  selectedIds,
  defaultSelectedIds = [],
  selectionMode = "single",
  selectionAnchorId,
  expandedIds,
  defaultExpandedIds = [],
  onSelectionChange,
  onExpandedChange,
  onActivate,
  onDrop,
  ...props
}: TreeViewProps) {
  const resolvedExpandedIds = [...(expandedIds ?? defaultExpandedIds)];
  const order: string[] = [];
  collectVisibleTreeItemIds(children, new Set(resolvedExpandedIds), order);
  const resolvedSelectedIds = [...(selectedIds ?? defaultSelectedIds)];
  const context: TreeContext = {
    order,
    selectedIds: resolvedSelectedIds,
    expandedIds: resolvedExpandedIds,
    selectionMode,
    anchor: { id: selectionAnchorId ?? resolvedSelectedIds[0] },
    focusId: resolvedSelectedIds.find((id) => order.includes(id)) ?? order[0],
    drag: {},
    controlledSelection: selectedIds !== undefined,
    controlledExpansion: expandedIds !== undefined,
    onSelectionChange,
    onExpandedChange,
    onActivate,
    onDrop,
  };

  return (
    <div
      className={sxClassName(props, cx(styles.root, className))}
      role="tree"
      aria-multiselectable={selectionMode === "multiple" ? "true" : undefined}
      {...props}
    >
      {withTreeContext(children, context)}
    </div>
  );
}

function requestSelection(
  context: TreeContext,
  id: string,
  options: { additive?: boolean; range?: boolean } = {},
  item?: HTMLElement,
) {
  const next = nextTreeSelection(context.order, context.selectedIds, id, context.selectionMode, {
    ...options,
    anchorId: context.anchor.id,
  });
  if (!options.range) context.anchor.id = id;
  context.selectedIds = next;
  if (!context.controlledSelection && item) {
    const tree = item.closest('[role="tree"]');
    tree?.querySelectorAll<HTMLElement>('[role="treeitem"]').forEach((candidate) => {
      const selected = next.includes(candidate.dataset.treeId ?? "");
      candidate.setAttribute("aria-selected", selected ? "true" : "false");
      candidate.classList.toggle(styles.selected, selected);
    });
  }
  context.onSelectionChange?.(next);
}

function requestExpanded(context: TreeContext, id: string, expanded: boolean, item?: HTMLElement) {
  context.expandedIds = expanded
    ? [...new Set([...context.expandedIds, id])]
    : context.expandedIds.filter((expandedId) => expandedId !== id);
  if (!context.controlledExpansion && item) {
    item.setAttribute("aria-expanded", expanded ? "true" : "false");
    item.querySelector<HTMLElement>(`:scope > .${styles.expand}`)?.setAttribute("aria-expanded", expanded ? "true" : "false");
    const group = item.parentElement?.querySelector<HTMLElement>(`:scope > [role="group"]`);
    if (group) group.hidden = !expanded;
  }
  context.onExpandedChange?.([...context.expandedIds]);
}

export function TreeViewItem({
  id,
  label,
  description,
  children,
  className = "",
  depth,
  disabled = false,
  draggable = false,
  expanded,
  dropState,
  expandLabel,
  __tree,
  __depth = depth ?? 0,
  __position,
  __setSize,
  onClick,
  onKeyDown,
  onFocus,
  ...props
}: InternalTreeViewItemProps) {
  const context = __tree;
  const nestedChildren = childArray(children);
  const hasChildren = nestedChildren.length > 0;
  const isExpanded = expanded ?? Boolean(context?.expandedIds.includes(id));
  const isSelected = Boolean(context?.selectedIds.includes(id));
  const rowClassName = sxClassName(
    props,
    cx(
      styles.item,
      isSelected && styles.selected,
      disabled && styles.disabled,
      dropState && styles[`drop-${dropState.placement}`],
      dropState && !dropState.valid && styles.invalidDrop,
      className,
    ),
  );

  return (
    <div className={styles.itemContainer}>
      <div
        className={rowClassName}
        role="treeitem"
        tabIndex={disabled ? -1 : context?.focusId === id ? 0 : -1}
        aria-level={__depth + 1}
        aria-posinset={__position}
        aria-setsize={__setSize}
        aria-selected={context?.selectionMode === "none" ? undefined : isSelected ? "true" : "false"}
        aria-expanded={hasChildren ? (isExpanded ? "true" : "false") : undefined}
        aria-disabled={disabled ? "true" : undefined}
        draggable={draggable && !disabled}
        data-tree-id={id}
        data-drop-placement={dropState?.placement}
        data-drop-valid={dropState ? (dropState.valid ? "true" : "false") : undefined}
        style={{ "--tui-tree-depth": __depth }}
        onClick={(event: MouseEvent & { currentTarget: HTMLElement }) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled || !context) return;
          requestSelection(context, id, {
            additive: event.metaKey || event.ctrlKey,
            range: event.shiftKey,
          }, event.currentTarget);
        }}
        onFocus={(event: FocusEvent & { currentTarget: HTMLElement }) => {
          onFocus?.(event);
          if (event.defaultPrevented) return;
          const tree = event.currentTarget.closest('[role="tree"]');
          tree?.querySelectorAll<HTMLElement>('[role="treeitem"][tabindex="0"]').forEach((candidate) => {
            if (candidate !== event.currentTarget) candidate.tabIndex = -1;
          });
          event.currentTarget.tabIndex = 0;
        }}
        onDblClick={() => {
          if (!disabled) context?.onActivate?.(id);
        }}
        onKeyDown={(event: KeyboardEvent & { currentTarget: HTMLElement }) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || disabled || !context) return;
          switch (event.key) {
            case "ArrowDown":
              event.preventDefault();
              focusRelativeTreeItem(event.currentTarget, 1);
              break;
            case "ArrowUp":
              event.preventDefault();
              focusRelativeTreeItem(event.currentTarget, -1);
              break;
            case "Home":
              event.preventDefault();
              focusRelativeTreeItem(event.currentTarget, Number.NEGATIVE_INFINITY);
              break;
            case "End":
              event.preventDefault();
              focusRelativeTreeItem(event.currentTarget, Number.POSITIVE_INFINITY);
              break;
            case "ArrowRight":
              if (hasChildren && !isExpanded) {
                event.preventDefault();
                requestExpanded(context, id, true, event.currentTarget);
              } else if (hasChildren) {
                event.preventDefault();
                focusRelativeTreeItem(event.currentTarget, 1);
              }
              break;
            case "ArrowLeft":
              if (hasChildren && isExpanded) {
                event.preventDefault();
                requestExpanded(context, id, false, event.currentTarget);
              } else {
                const parentGroup = event.currentTarget.parentElement?.parentElement;
                const parentItem = parentGroup?.parentElement?.querySelector<HTMLElement>(`:scope > [role="treeitem"]`);
                if (parentItem) {
                  event.preventDefault();
                  parentItem.focus();
                }
              }
              break;
            case " ":
              event.preventDefault();
              requestSelection(context, id, { additive: event.metaKey || event.ctrlKey, range: event.shiftKey }, event.currentTarget);
              break;
            case "Enter":
              event.preventDefault();
              context.onActivate?.(id);
              break;
          }
        }}
        onDragStart={(event: DragEvent & { currentTarget: HTMLElement }) => {
          if (!context || !draggable || disabled) return;
          context.drag.sourceId = id;
          event.dataTransfer?.setData("application/x-tavo-tree-source", "active");
          event.currentTarget.dataset.dragging = "true";
        }}
        onDragEnd={(event: DragEvent & { currentTarget: HTMLElement }) => {
          if (context) context.drag.sourceId = undefined;
          delete event.currentTarget.dataset.dragging;
        }}
        onDragOver={(event: DragEvent) => {
          if (context?.drag.sourceId && context.drag.sourceId !== id && dropState?.valid !== false) event.preventDefault();
        }}
        onDrop={(event: DragEvent & { currentTarget: HTMLElement }) => {
          const sourceId = context?.drag.sourceId;
          if (!sourceId || sourceId === id || dropState?.valid === false || !context) return;
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = rect.height ? (event.clientY - rect.top) / rect.height : 0.5;
          const placement = dropState?.placement ?? (ratio < 0.25 ? "before" : ratio > 0.75 ? "after" : "inside");
          context.onDrop?.({ sourceId, targetId: id, placement });
          context.drag.sourceId = undefined;
        }}
        {...props}
      >
        <span className={styles.indent} aria-hidden="true" />
        {hasChildren ? (
          <button
            className={styles.expand}
            type="button"
            tabIndex={-1}
            aria-label={expandLabel ?? `${isExpanded ? "Collapse" : "Expand"} item`}
            aria-expanded={isExpanded ? "true" : "false"}
            onClick={(event: MouseEvent & { currentTarget: HTMLElement }) => {
              event.stopPropagation();
              if (!disabled && context) {
                const item = event.currentTarget.closest<HTMLElement>('[role="treeitem"]');
                requestExpanded(context, id, !isExpanded, item ?? undefined);
              }
            }}
          />
        ) : <span className={styles.expandPlaceholder} aria-hidden="true" />}
        <span className={styles.content}>
          <span className={styles.label}>{label}</span>
          {description !== undefined ? <span className={styles.description}>{description}</span> : null}
        </span>
      </div>
      {hasChildren ? <div className={styles.group} role="group" hidden={!isExpanded}>{nestedChildren}</div> : null}
    </div>
  );
}

export const TreeViewRoot = TreeViewBase;
export const TreeView = Object.assign(TreeViewBase, {
  Root: TreeViewRoot,
  Item: TreeViewItem,
});
export const Tree = TreeView;
export const TreeItem = TreeViewItem;
