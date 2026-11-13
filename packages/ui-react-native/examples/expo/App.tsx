import { registerRootComponent } from "expo";
import {
  Field,
  FormControl,
  RadioGroup,
  SegmentedControl,
  Stack,
  TavoThemeProvider,
  Text,
  TextInput,
  ToggleGroup
} from "@tavojs/ui-react-native";
import { Button } from "@tavojs/ui-react-native/button";
import themeConfig from "./tavo-ui.generated.js";

const densityOptions = [
  { label: "Compact", value: "compact" },
  { label: "Comfortable", value: "comfortable" }
];

export default function App() {
  return (
    <TavoThemeProvider config={themeConfig}>
      <Stack padding="md" gap="md">
        <Text variant="h2">Tavo.js Native UI</Text>
        <FormControl fullWidth>
          <Field label="Project name" hint="Use a short memorable name." required>
            <TextInput placeholder="Runway Log" />
          </Field>
          <RadioGroup name="density" value="compact" items={densityOptions} />
          <SegmentedControl
            name="view"
            value="list"
            options={[
              { label: "List", value: "list" },
              { label: "Grid", value: "grid" }
            ]}
          />
          <ToggleGroup
            value="bold"
            items={[
              { label: "Bold", value: "bold" },
              { label: "Italic", value: "italic" }
            ]}
          />
          <Button>Save</Button>
        </FormControl>
      </Stack>
    </TavoThemeProvider>
  );
}

registerRootComponent(App);
