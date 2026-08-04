import { createTavo, TavoController } from "@tavojs/core";
import {
  AppBar,
  Chip,
  Box,
  Button,
  Toolbar,
  Grid,
  Inline,
  Page,
  Section,
  Card,
  Progress,
  Stat,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from "@/index";

export const head = { title: "Analytics Template - Tavo.js UI" };

class AnalyticsTemplateController extends TavoController {}

const AnalyticsTemplate = createTavo<
  Record<string, never>,
  Record<string, never>,
  AnalyticsTemplateController
>({
  model: () => ({}),
  controller: AnalyticsTemplateController,
  view: () => (
    <Page size="xl">
      <AppBar>
        <Toolbar>
          <Chip tone="primary">Analytics</Chip>
          <Inline>
            <Button size="sm">Export</Button>
            <Button size="sm" variant="outline" tone="neutral">
              Compare
            </Button>
          </Inline>
        </Toolbar>
      </AppBar>
      <Section
        eyebrow="Analytics template"
        title="Product performance"
        description="A dashboard page for metrics, trend summaries, and report tables."
      />
      <Grid minItemWidth="12rem">
        <Stat label="Visitors" value="128k" trend="+18%" tone="success" />
        <Stat label="Activation" value="42%" trend="+6%" tone="primary" />
        <Stat label="Revenue" value="$84k" trend="+11%" tone="secondary" />
        <Stat label="Churn" value="2.1%" trend="-0.4%" tone="warning" />
      </Grid>
      <Grid minItemWidth="24rem" spacing="lg">
        <Card
          title="Funnel health"
          description="Progress components can stand in for simple charts."
        >
          <Progress label="Visit to signup" value={68} showValue />
          <Progress
            label="Signup to activation"
            value={42}
            showValue
            tone="secondary"
          />
          <Progress
            label="Activation to paid"
            value={24}
            showValue
            tone="success"
          />
        </Card>
        <Box padding="lg" radius="surface" border>
          <Text variant="h3">Insight</Text>
          <Text color="muted">
            Expansion revenue is tracking above target while churn remains
            stable.
          </Text>
          <Box surface="subtle" radius="md" padding="md">
            Next review: Monday 10:00
          </Box>
        </Box>
      </Grid>
      <Toolbar
        title="Top channels"
        actions={<Button size="sm">Open report</Button>}
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Channel</TableHeaderCell>
            <TableHeaderCell>Visitors</TableHeaderCell>
            <TableHeaderCell numeric>Conversion</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {["Organic", "Referral", "Campaign"].map((name, index) => (
            <TableRow>
              <TableCell>{name}</TableCell>
              <TableCell>{[58210, 18440, 9210][index]}</TableCell>
              <TableCell numeric>{[8.4, 6.1, 4.8][index]}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Page>
  ),
});

export default AnalyticsTemplate;
