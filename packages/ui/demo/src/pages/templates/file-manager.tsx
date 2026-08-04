import { createTavo, TavoController } from "@tavojs/core";
import {
  AppBar,
  Chip,
  Button,
  Toolbar,
  EmptyState,
  Grid,
  Inline,
  Page,
  Card,
  PropertyItem,
  PropertyList,
  SearchInput,
  Sidebar,
  Stack,
  StatusDot,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/index";

export const head = { title: "File Manager Template - Tavo.js UI" };

class FileManagerTemplateController extends TavoController {}

const files = [
  ["Brand assets", "Folder", "24 items"],
  ["Roadmap.pdf", "PDF", "4.2 MB"],
  ["Launch copy.md", "Markdown", "12 KB"],
];

const FileManagerTemplate = createTavo<
  Record<string, never>,
  Record<string, never>,
  FileManagerTemplateController
>({
  model: () => ({}),
  controller: FileManagerTemplateController,
  view: () => (
    <Page size="full" padding="none">
      <AppBar>
        <Toolbar>
          <Chip tone="primary">Files</Chip>
          <SearchInput placeholder="Search files" />
          <Button size="sm">Upload</Button>
        </Toolbar>
      </AppBar>
      <Grid
        minItemWidth="18rem"
        spacing="lg"
        style={{
          padding: "var(--tui-space-6)",
          gridTemplateColumns: "16rem minmax(0, 1fr) 20rem",
        }}
      >
        <Sidebar>
          <Stack>
            <Button variant="soft">All files</Button>
            <Button variant="ghost" tone="neutral">
              Shared
            </Button>
            <Button variant="ghost" tone="neutral">
              Archive
            </Button>
          </Stack>
        </Sidebar>
        <Stack>
          <Toolbar
            title="Recent files"
            actions={
              <Inline>
                <StatusDot tone="success" label="Synced" />
                <Button size="sm" variant="outline" tone="neutral">
                  New folder
                </Button>
              </Inline>
            }
          />
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Size</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map(([name, type, size]) => (
                <TableRow>
                  <TableCell>{name}</TableCell>
                  <TableCell>{type}</TableCell>
                  <TableCell>{size}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <EmptyState
            title="Drop files here"
            description="Use this area for upload and empty-folder states."
            actions={<Button variant="outline">Browse</Button>}
          />
        </Stack>
        <Card title="Details">
          <PropertyList>
            <PropertyItem label="Owner">Design Team</PropertyItem>
            <PropertyItem label="Access">Workspace</PropertyItem>
            <PropertyItem label="Status">
              <Chip tone="success">Indexed</Chip>
            </PropertyItem>
          </PropertyList>
        </Card>
      </Grid>
    </Page>
  ),
});

export default FileManagerTemplate;
