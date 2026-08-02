import { createTavo, TavoController } from "@tavojs/core";
import {
  AppBar,
  Avatar,
  Chip,
  Button,
  Toolbar,
  Grid,
  Inline,
  Link,
  Section,
  Card,
  Progress,
  PropertyItem,
  PropertyList,
  SearchInput,
  Shell,
  Sidebar,
  Stack,
  Stat,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from "@/index";

export const head = {
  title: "Admin Template - Tavo UI",
  head: '<meta name="description" content="An admin dashboard template composed with @tavojs/ui components">',
};

class AdminTemplateController extends TavoController {}

const users = [
  ["Ari Lane", "Owner", "Active", "42"],
  ["Mira Chen", "Editor", "Invited", "18"],
  ["Jon Bell", "Viewer", "Active", "7"],
];

const AdminTemplate = createTavo<
  Record<string, never>,
  Record<string, never>,
  AdminTemplateController
>({
  model: () => ({}),
  controller: AdminTemplateController,
  view: () => (
    <Shell
      header={
        <AppBar position="sticky">
          <Toolbar>
            <Inline>
              <Chip tone="primary">Admin</Chip>
              <Link href="/">UI Kit</Link>
              <Link href="/templates/blog">Blog</Link>
              <Link href="/templates/login-register">Auth</Link>
            </Inline>
            <Inline>
              <SearchInput
                placeholder="Search workspace"
                aria-label="Search workspace"
              />
              <Avatar name="Team" />
            </Inline>
          </Toolbar>
        </AppBar>
      }
      sidebar={
        <Sidebar padding="md">
          <Stack gap="sm">
            <Button variant="soft">Overview</Button>
            <Button variant="ghost" tone="neutral">
              Members
            </Button>
            <Button variant="ghost" tone="neutral">
              Billing
            </Button>
            <Button variant="ghost" tone="neutral">
              Settings
            </Button>
          </Stack>
        </Sidebar>
      }
    >
      <Stack gap="lg" style={{ padding: "var(--tui-space-6)" }}>
        <Section
          eyebrow="Admin template"
          title="Workspace overview"
          description="A dashboard composition for operational tools, built from layout, data, and feedback components."
          actions={
            <Inline>
              <Button>Invite member</Button>
              <Button variant="outline" tone="neutral">
                Export
              </Button>
            </Inline>
          }
        />

        <Grid minItemWidth="12rem">
          <Stat
            label="Active users"
            value="2,418"
            trend="+12%"
            tone="success"
            hint="Compared with last month"
          />
          <Stat
            label="Revenue"
            value="$48.2k"
            trend="+8%"
            tone="primary"
            hint="Current billing cycle"
          />
          <Stat
            label="Open issues"
            value="18"
            trend="-4"
            tone="warning"
            hint="Needs triage"
          />
          <Stat
            label="Uptime"
            value="99.98%"
            trend="Stable"
            tone="info"
            hint="Last 30 days"
          />
        </Grid>

        <Grid minItemWidth="22rem" spacing="lg">
          <Card
            title="Usage"
            description="A compact panel for charts or progress summaries."
            actions={<Chip tone="success">Healthy</Chip>}
          >
            <Stack>
              <Progress value={78} label="API usage" />
              <Progress value={54} label="Storage" tone="secondary" />
              <Progress value={32} label="Seats" tone="warning" />
            </Stack>
          </Card>

          <Card
            title="Account details"
            description="Key-value layout for quick scanning."
          >
            <PropertyList>
              <PropertyItem label="Plan">Scale</PropertyItem>
              <PropertyItem label="Region">EU West</PropertyItem>
              <PropertyItem label="Renewal">June 12, 2026</PropertyItem>
              <PropertyItem label="Security">
                <Chip tone="success">SSO enabled</Chip>
              </PropertyItem>
            </PropertyList>
          </Card>
        </Grid>

        <Section
          title="Members"
          description="Toolbar, Toolbar, and Table compose into a typical admin surface."
        >
          <Box padding="md" radius="surface" border>
            <Stack>
              <Toolbar
                title="Team members"
                filters={
                  <Toolbar>
                    <Chip tone="neutral">All roles</Chip>
                    <Chip tone="success">Active</Chip>
                    <Chip tone="warning">Invited</Chip>
                  </Toolbar>
                }
                actions={<Button size="sm">Add member</Button>}
              />
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Role</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell numeric>Projects</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(([name, role, status, projects]) => (
                    <TableRow>
                      <TableCell>{name}</TableCell>
                      <TableCell>{role}</TableCell>
                      <TableCell>
                        <Chip
                          tone={status === "Active" ? "success" : "warning"}
                        >
                          {status}
                        </Chip>
                      </TableCell>
                      <TableCell numeric>{projects}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </Box>
        </Section>

        <Text color="muted">
          This template intentionally avoids dashboard-specific SCSS.
        </Text>
      </Stack>
    </Shell>
  ),
});

export default AdminTemplate;
