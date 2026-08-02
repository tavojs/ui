import { createTavo, TavoController } from "@tavojs/core";
import {
  Alert,
  AppBar,
  Avatar,
  Chip,
  Button,
  Field,
  Grid,
  Inline,
  Link,
  Page,
  Section,
  Card,
  PropertyItem,
  PropertyList,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  Toolbar,
} from "@/index";

export const head = {
  title: "Settings Template - Tavo UI",
  head: '<meta name="description" content="A settings page template composed with @tavojs/ui components">',
};

class SettingsTemplateController extends TavoController {}

const SettingsTemplate = createTavo<
  Record<string, never>,
  Record<string, never>,
  SettingsTemplateController
>({
  model: () => ({}),
  controller: SettingsTemplateController,
  view: () => (
    <Page size="xl" padding="none">
      <AppBar position="sticky">
        <Toolbar>
          <Inline>
            <Chip tone="primary">Settings</Chip>
            <Link href="/">UI Kit</Link>
            <Link href="/templates/admin">Admin</Link>
            <Link href="/templates/docs">Docs</Link>
          </Inline>
          <Avatar name="Ari" />
        </Toolbar>
      </AppBar>

      <Stack gap="lg" style={{ padding: "var(--tui-space-6)" }}>
        <Section
          eyebrow="Settings template"
          title="Profile and workspace settings"
          description="A practical account surface built from Field, Card, Card, Switch, Select, and PropertyList."
          actions={<Button>Save settings</Button>}
        />

        <Grid minItemWidth="22rem" spacing="lg">
          <Card title="Profile" description="Basic personal information.">
            <Stack>
              <Field label="Display name" required>
                <TextInput value="Ari Lane" />
              </Field>
              <Field label="Email">
                <TextInput type="email" value="ari@tavo.dev" />
              </Field>
              <Field label="Bio" optional>
                <Textarea
                  rows={4}
                  value="Building tidy interfaces with Tavo."
                />
              </Field>
            </Stack>
          </Card>

          <Stack gap="lg">
            <Card
              title="Notifications"
              description="Control how workspace updates reach you."
              actions={<Switch checked />}
            />
            <Card
              title="Two-factor authentication"
              description="Require a second factor for sensitive account actions."
              actions={<Switch />}
            />
            <Card title="Workspace">
              <Stack>
                <Field label="Default density">
                  <Select value="comfortable">
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="spacious">Spacious</option>
                  </Select>
                </Field>
                <PropertyList>
                  <PropertyItem label="Plan">Scale</PropertyItem>
                  <PropertyItem label="Region">EU West</PropertyItem>
                </PropertyList>
              </Stack>
            </Card>
          </Stack>
        </Grid>

        <Alert tone="success" title="Saved locally">
          This template is static, but the structure is ready for a real
          settings controller.
        </Alert>
      </Stack>
    </Page>
  ),
});

export default SettingsTemplate;
