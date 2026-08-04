import { createTavo, TavoController } from "@tavojs/core";
import {
  Timeline,
  TimelineItem,
  AppBar,
  Avatar,
  Chip,
  Button,
  Toolbar,
  Grid,
  Inline,
  Page,
  Card,
  SearchInput,
  Sidebar,
  Stack,
  StatusDot,
  Text,
  Textarea,
} from "@/index";

export const head = { title: "Inbox Template - Tavo.js UI" };

class InboxTemplateController extends TavoController {}

const InboxTemplate = createTavo<
  Record<string, never>,
  Record<string, never>,
  InboxTemplateController
>({
  model: () => ({}),
  controller: InboxTemplateController,
  view: () => (
    <Page size="full" padding="none">
      <AppBar>
        <Toolbar>
          <Chip tone="primary">Inbox</Chip>
          <SearchInput placeholder="Search messages" />
          <Button size="sm">Compose</Button>
        </Toolbar>
      </AppBar>
      <Grid
        minItemWidth="20rem"
        spacing="lg"
        style={{
          padding: "var(--tui-space-6)",
          gridTemplateColumns: "16rem minmax(0, 1fr)",
        }}
      >
        <Sidebar>
          <Stack>
            <Button variant="soft">Priority</Button>
            <Button variant="ghost" tone="neutral">
              Assigned
            </Button>
            <Button variant="ghost" tone="neutral">
              Archived
            </Button>
          </Stack>
        </Sidebar>
        <Grid minItemWidth="22rem" spacing="lg">
          <Card
            title="Threads"
            actions={<StatusDot tone="success" label="Live" pulse />}
          >
            <Timeline>
              <TimelineItem title="Mira Chen" meta="2m" tone="primary">
                Can you review the billing copy?
              </TimelineItem>
              <TimelineItem title="Support" meta="18m" tone="warning">
                New ticket was assigned to your team.
              </TimelineItem>
              <TimelineItem title="Deploy bot" meta="1h" tone="success">
                Production deploy completed.
              </TimelineItem>
            </Timeline>
          </Card>
          <Card title="Reply" description="A simple response pane.">
            <Stack>
              <Inline>
                <Avatar name="Ari" />
                <Text variant="h3">Mira Chen</Text>
              </Inline>
              <Textarea rows={8} value="Thanks, I will review this today." />
              <Inline>
                <Button>Send reply</Button>
                <Button variant="ghost" tone="neutral">
                  Save draft
                </Button>
              </Inline>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Page>
  ),
});

export default InboxTemplate;
