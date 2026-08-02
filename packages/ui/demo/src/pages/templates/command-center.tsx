import { createTavo, TavoController } from "@tavojs/core";
import {
  Timeline,
  TimelineItem,
  Chip,
  Button,
  CommandMenu,
  Grid,
  Page,
  Section,
  Card,
  Stat,
  StatusDot,
  Toast,
} from "@/index";

export const head = { title: "Command Center Template - Tavo UI" };

class CommandCenterTemplateController extends TavoController {}

const CommandCenterTemplate = createTavo<
  Record<string, never>,
  Record<string, never>,
  CommandCenterTemplateController
>({
  model: () => ({}),
  controller: CommandCenterTemplateController,
  view: () => (
    <Page size="xl">
      <Section
        eyebrow="Command center template"
        title="Operational command center"
        description="A dense control room layout for alerts, commands, metrics, and live status."
        actions={<Button>Run playbook</Button>}
      />
      <Grid minItemWidth="12rem">
        <Stat label="Incidents" value="2" tone="danger" />
        <Stat label="Services" value="42" tone="success" />
        <Stat label="Latency" value="128ms" tone="info" />
      </Grid>
      <Grid minItemWidth="22rem" spacing="lg">
        <Card title="Commands" actions={<Chip tone="primary">Cmd K</Chip>}>
          <CommandMenu
            items={[
              {
                label: "Restart worker",
                description: "Queue service",
                shortcut: "R",
              },
              { label: "Open logs", description: "Production", shortcut: "L" },
              {
                label: "Mute alerts",
                description: "30 minutes",
                shortcut: "M",
              },
            ]}
          />
        </Card>
        <Card
          title="Activity"
          actions={<StatusDot tone="success" label="Monitoring" pulse />}
        >
          <Timeline>
            <TimelineItem title="API recovered" meta="now" tone="success">
              Error rate returned to baseline.
            </TimelineItem>
            <TimelineItem title="Payments degraded" meta="4m" tone="danger">
              Investigating upstream latency.
            </TimelineItem>
          </Timeline>
        </Card>
      </Grid>
      <Toast title="Playbook ready" tone="info">
        Use the command panel to trigger operational actions.
      </Toast>
    </Page>
  ),
});

export default CommandCenterTemplate;
