import { createTavo, TavoController } from "@tavojs/core";
import {
  Alert,
  Chip,
  Box,
  Button,
  Card,
  Field,
  Grid,
  Inline,
  Page,
  Section,
  ToggleGroup,
  Stack,
  Stepper,
  Text,
  TextInput,
} from "@/index";

export const head = { title: "Onboarding Template - Tavo UI" };

class OnboardingTemplateController extends TavoController {}

const OnboardingTemplate = createTavo<
  Record<string, never>,
  Record<string, never>,
  OnboardingTemplateController
>({
  model: () => ({}),
  controller: OnboardingTemplateController,
  view: () => (
    <Page size="lg">
      <Section
        eyebrow="Onboarding template"
        title="Set up your workspace"
        description="A guided setup flow for products with multi-step activation."
      />
      <Stepper
        steps={[
          {
            id: "profile",
            title: "Profile",
            description: "Your basics",
            status: "complete",
          },
          {
            id: "team",
            title: "Team",
            description: "Invite people",
            status: "current",
          },
          { id: "finish", title: "Finish", description: "Review setup" },
        ]}
      />
      <Grid minItemWidth="22rem" spacing="lg">
        <Card.Root eyebrow="Step 2" title="Team details" surface="raised">
          <Stack>
            <Field label="Workspace name">
              <TextInput value="Tavo Studio" />
            </Field>
            <Field label="Workspace type">
              <ToggleGroup
                name="workspace-type"
                value="product"
                items={[
                  { label: "Product", value: "product" },
                  { label: "Agency", value: "agency" },
                ]}
              />
            </Field>
            <Inline>
              <Button>Continue</Button>
              <Button variant="ghost" tone="neutral">
                Skip
              </Button>
            </Inline>
          </Stack>
        </Card.Root>
        <Box surface="subtle" radius="lg" padding="lg">
          <Stack>
            <Chip tone="info">Tip</Chip>
            <Text variant="h3">Invite later if needed</Text>
            <Text color="muted">
              The flow can stay useful even when users do not have every setup
              answer ready.
            </Text>
            <Alert tone="success" title="Autosaved">
              Progress is saved between steps.
            </Alert>
          </Stack>
        </Box>
      </Grid>
    </Page>
  ),
});

export default OnboardingTemplate;
