import { createTavo, TavoController } from "@tavojs/core";
import {
  Alert,
  AppBar,
  Chip,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Field,
  Grid,
  Inline,
  Link,
  Page,
  Section,
  PropertyItem,
  PropertyList,
  Stack,
  Text,
  TextInput,
  Toolbar,
} from "@/index";

export const head = {
  title: "Checkout Template - Tavo.js UI",
  head: '<meta name="description" content="A checkout and billing template composed with @tavojs/ui components">',
};

class CheckoutTemplateController extends TavoController {}

const CheckoutTemplate = createTavo<
  Record<string, never>,
  Record<string, never>,
  CheckoutTemplateController
>({
  model: () => ({}),
  controller: CheckoutTemplateController,
  view: () => (
    <Page size="xl" padding="none">
      <AppBar position="sticky">
        <Toolbar>
          <Inline>
            <Chip tone="primary">Checkout</Chip>
            <Link href="/">UI Kit</Link>
            <Link href="/templates/pricing">Pricing</Link>
            <Link href="/templates/settings">Settings</Link>
          </Inline>
          <Chip tone="success">Secure</Chip>
        </Toolbar>
      </AppBar>

      <Stack gap="lg" style={{ padding: "var(--tui-space-6)" }}>
        <Section
          eyebrow="Checkout template"
          title="Billing and purchase flow"
          description="A two-column checkout layout for SaaS upgrades, billing forms, or marketplace purchases."
        />

        <Grid minItemWidth="24rem" spacing="lg">
          <Card.Root eyebrow="Payment" title="Billing details" surface="raised">
            <Stack>
              <Field label="Cardholder name" required>
                <TextInput value="Ari Lane" />
              </Field>
              <Field label="Card number" required>
                <TextInput placeholder="4242 4242 4242 4242" />
              </Field>
              <Grid columns={2}>
                <Field label="Expiry">
                  <TextInput placeholder="06 / 28" />
                </Field>
                <Field label="CVC">
                  <TextInput placeholder="123" />
                </Field>
              </Grid>
              <Inline>
                <Checkbox checked aria-label="Save payment method" />
                <Text color="muted">
                  Save this payment method for renewals.
                </Text>
              </Inline>
              <Button>Complete purchase</Button>
            </Stack>
          </Card.Root>

          <Stack gap="lg">
            <Box surface="raised" radius="lg" padding="lg" border shadow>
              <Stack>
                <Inline>
                  <Chip tone="secondary">Scale plan</Chip>
                  <Text variant="h2">$79</Text>
                </Inline>
                <Text color="muted">
                  Monthly subscription for product teams building with Tavo.js UI.
                </Text>
                <Divider />
                <PropertyList>
                  <PropertyItem label="Seats">12 included</PropertyItem>
                  <PropertyItem label="Support">Priority</PropertyItem>
                  <PropertyItem label="Tax">$6.32</PropertyItem>
                  <PropertyItem label="Total">$85.32</PropertyItem>
                </PropertyList>
              </Stack>
            </Box>
            <Alert tone="info" title="Template behavior">
              Pair this layout with controlled Field state and validation
              messages for a complete checkout flow.
            </Alert>
          </Stack>
        </Grid>
      </Stack>
    </Page>
  ),
});

export default CheckoutTemplate;
