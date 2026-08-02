import { createRoot } from "@tavojs/core";
import { Button, Card, Field, SearchInput, Box, Text } from "@tavojs/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tavojs/ui/table";
import "@tavojs/ui/components.css";
import "@tavojs/ui/theme.css";

function App() {
  return (
    <main
      style={{
        padding: "var(--tui-space-6)",
        fontFamily: "var(--tui-font-family)",
      }}
    >
      <Box>
        <Card title="Consumer fixture" eyebrow="Package import">
          <Field label="Search">
            <SearchInput placeholder="Imported from @tavojs/ui" />
          </Field>
          <Table compact>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Import</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Root barrel</TableCell>
                <TableCell>Ready</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Subpath table</TableCell>
                <TableCell>Ready</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Text color="muted">
            This fixture imports the package the way an app would.
          </Text>
          <Button>Action</Button>
        </Card>
      </Box>
    </main>
  );
}

createRoot(document.getElementById("app")!).render(<App />);
