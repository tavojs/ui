import { buildThemeTokens, type TavoUiThemeConfig } from "@tavojs/ui-core";

export type A11yAuditSeverity = "error" | "warning" | "info";

export type A11yAuditIssue = {
  id: string;
  severity: A11yAuditSeverity;
  message: string;
  target?: string;
};

export type A11yAuditResult = {
  passed: boolean;
  issues: A11yAuditIssue[];
};

export function auditThemeA11y(config: TavoUiThemeConfig): A11yAuditResult {
  let warnings: string[];
  try {
    warnings = buildThemeTokens(config).warnings;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    warnings = message
      .replace(/^Theme accessibility validation failed:\n?/, "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  const issues = warnings.map<A11yAuditIssue>((warning) => ({
    id: "theme-contrast",
    severity: config.accessibility?.failOnViolation ? "error" : "warning",
    message: warning,
    target: "theme",
  }));

  return {
    passed: issues.every((issue) => issue.severity !== "error"),
    issues,
  };
}
