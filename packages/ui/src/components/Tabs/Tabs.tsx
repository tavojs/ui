import type { Child, VNode } from "@tavojs/core";
import styles from "./Tabs.module.scss";
import { cx } from "@/components/shared";

export type TabItem = {
  id: string;
  label: Child;
  content?: Child;
};

export type TabsProps = {
  tabs: TabItem[];
  activeId: string;
  children?: Child;
  className?: string;
  onChange?: (tabId: string) => void;
  idPrefix?: string;
  orientation?: "horizontal" | "vertical";
};

function focusTab(event: KeyboardEvent, direction: number) {
  const target = event.currentTarget as HTMLElement;
  const list = target.closest('[role="tablist"]');
  const tabs = list ? Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])')) : [];
  const index = tabs.indexOf(target);
  const nextIndex = direction === Number.NEGATIVE_INFINITY ? 0 : direction === Number.POSITIVE_INFINITY ? tabs.length - 1 : (index + direction + tabs.length) % tabs.length;
  const next = tabs[nextIndex];
  next?.focus();
  next?.click();
}

function onTabKeyDown(event: KeyboardEvent) {
  switch (event.key) {
    case "ArrowRight":
    case "ArrowDown":
      event.preventDefault();
      focusTab(event, 1);
      break;
    case "ArrowLeft":
    case "ArrowUp":
      event.preventDefault();
      focusTab(event, -1);
      break;
    case "Home":
      event.preventDefault();
      focusTab(event, Number.NEGATIVE_INFINITY);
      break;
    case "End":
      event.preventDefault();
      focusTab(event, Number.POSITIVE_INFINITY);
      break;
  }
}

function childArray(children: Child | undefined): Child[] {
  if (children === undefined || children === null || children === false) {
    return [];
  }
  return Array.isArray(children) ? children.flatMap(childArray) : [children];
}

function isTabsContent(child: Child): child is VNode & { props: { id?: string; children: Child[]; className?: string } } {
  return typeof child === "object" && child !== null && !Array.isArray(child) && child.type === TabsContent;
}

function findContentPanel(children: Child | undefined, id: string): (VNode & { props: { id?: string; children: Child[]; className?: string } }) | undefined {
  for (const child of childArray(children)) {
    if (isTabsContent(child) && child.props.id === id) {
      return child;
    }
  }
  return undefined;
}

function TabsBase({ tabs, activeId, children, className = "", onChange, idPrefix = "tavo", orientation = "horizontal" }: TabsProps) {
  if (tabs.length === 0) {
    return null;
  }

  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  const activeContentPanel = findContentPanel(children, activeTab.id);
  const activeTabId = `${idPrefix}-tab-${activeTab.id}`;
  const activePanelId = `${idPrefix}-tabpanel-${activeTab.id}`;

  return (
    <div className={cx(styles.tabs, className)}>
      <div className={styles.list} role="tablist" aria-orientation={orientation}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`${idPrefix}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab.id === tab.id ? "true" : "false"}
            aria-controls={`${idPrefix}-tabpanel-${tab.id}`}
            tabIndex={activeTab.id === tab.id ? 0 : -1}
            className={cx(styles.trigger, activeTab.id === tab.id && styles.active)}
            onClick={() => onChange?.(tab.id)}
            onKeyDown={onTabKeyDown}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div id={activePanelId} className={cx(styles.panel, activeContentPanel?.props.className)} role="tabpanel" aria-labelledby={activeTabId}>
        {activeTab.content ?? activeContentPanel?.props.children}
      </div>
    </div>
  );
}

export function TabsList(props: { children?: Child; className?: string }) {
  return <div className={cx(styles.list, props.className)} role="tablist">{props.children}</div>;
}

export function TabsTrigger(props: {
  children?: Child;
  className?: string;
  active?: boolean;
  onClick?: () => void;
  id?: string;
  controls?: string;
}) {
  return (
    <button
      id={props.id}
      type="button"
      role="tab"
      aria-selected={props.active ? "true" : "false"}
      aria-controls={props.controls}
      tabIndex={props.active ? 0 : -1}
      className={cx(styles.trigger, props.active && styles.active, props.className)}
      onClick={props.onClick}
      onKeyDown={onTabKeyDown}
    >
      {props.children}
    </button>
  );
}

export function TabsContent(props: { children?: Child; className?: string; id?: string; labelledBy?: string }) {
  return <div id={props.id} className={cx(styles.panel, props.className)} role="tabpanel" aria-labelledby={props.labelledBy}>{props.children}</div>;
}

export function TabsIndicator(props: { className?: string }) {
  return <span className={cx(styles.indicator, props.className)} aria-hidden="true" />;
}

export const TabsRoot = TabsBase;
export const Tabs = Object.assign(TabsBase, {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
  Indicator: TabsIndicator
});
