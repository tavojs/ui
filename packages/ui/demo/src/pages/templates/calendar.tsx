import { createTavo, TavoController } from "@tavojs/core";
import {
  Chip,
  Button,
  Card,
  Grid,
  Inline,
  Page,
  Section,
  PropertyItem,
  PropertyList,
  Stack,
  StatusDot,
  Timeline,
  TimelineItem,
} from "@/index";

export const head = { title: "Calendar Template - Tavo UI" };

class CalendarTemplateController extends TavoController {}

const CalendarTemplate = createTavo<
  Record<string, never>,
  Record<string, never>,
  CalendarTemplateController
>({
  model: () => ({}),
  controller: CalendarTemplateController,
  view: () => (
    <Page size="xl">
      <Section
        eyebrow="Schedule template"
        title="Weekly planning"
        description="A calendar-adjacent page for meetings, work blocks, and availability."
        actions={
          <Inline>
            <Button>New event</Button>
            <Button variant="outline" tone="neutral">
              Sync
            </Button>
          </Inline>
        }
      />
      <Grid minItemWidth="18rem" spacing="lg">
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => (
          <Card.Root title={day} eyebrow={index === 2 ? "Today" : "Day"}>
            <Stack>
              <Chip tone={index === 2 ? "primary" : "neutral"}>
                {index + 10} May
              </Chip>
              <StatusDot
                tone={index === 4 ? "warning" : "success"}
                label={index === 4 ? "Busy" : "Available"}
              />
            </Stack>
          </Card.Root>
        ))}
      </Grid>
      <Grid minItemWidth="22rem" spacing="lg">
        <Card title="Agenda">
          <Timeline>
            <TimelineItem title="Planning" meta="09:00" tone="primary">
              Review sprint priorities.
            </TimelineItem>
            <TimelineItem title="Design sync" meta="12:30" tone="secondary">
              Component polish pass.
            </TimelineItem>
            <TimelineItem title="Release check" meta="16:00" tone="success">
              Confirm package output.
            </TimelineItem>
          </Timeline>
        </Card>
        <Card title="Event details">
          <PropertyList>
            <PropertyItem label="Location">Remote</PropertyItem>
            <PropertyItem label="Calendar">Product</PropertyItem>
            <PropertyItem label="Guests">8 accepted</PropertyItem>
          </PropertyList>
        </Card>
      </Grid>
    </Page>
  ),
});

export default CalendarTemplate;
