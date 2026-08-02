import { createTavo, TavoController } from "@tavojs/core";
import {
  Chip,
  Button,
  Card,
  Grid,
  Inline,
  Page,
  Section,
  Stack,
  StatusDot,
} from "@/index";

export const head = { title: "Project Board Template - Tavo UI" };

class ProjectBoardTemplateController extends TavoController {}

const columns = ["Backlog", "In progress", "Review"];

const ProjectBoardTemplate = createTavo<
  Record<string, never>,
  Record<string, never>,
  ProjectBoardTemplateController
>({
  model: () => ({}),
  controller: ProjectBoardTemplateController,
  view: () => (
    <Page size="xl">
      <Section
        eyebrow="Project board template"
        title="Delivery board"
        description="A kanban-style project page using cards, badges, and resource recipes."
        actions={<Button>New task</Button>}
      />
      <Grid minItemWidth="18rem" spacing="lg">
        {columns.map((column, index) => (
          <Card.Root
            title={column}
            actions={<Chip tone="neutral">{index + 2}</Chip>}
            surface="raised"
          >
            <Stack>
              <Card
                title={`${column} task`}
                meta="UI"
                tone={
                  index === 0 ? "neutral" : index === 1 ? "warning" : "success"
                }
                description="Reusable task card for project boards."
              />
              <Inline>
                <StatusDot
                  tone={index === 2 ? "success" : "primary"}
                  label={index === 2 ? "Ready" : "Open"}
                />
              </Inline>
            </Stack>
          </Card.Root>
        ))}
      </Grid>
    </Page>
  ),
});

export default ProjectBoardTemplate;
