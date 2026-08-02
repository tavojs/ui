import { createTavo, TavoController } from "@tavojs/core";
import {
  Alert,
  AppBar,
  Chip,
  Box,
  Button,
  Checkbox,
  Field,
  Grid,
  Inline,
  Link,
  Page,
  ToggleGroup,
  Stack,
  Text,
  TextInput,
  Toolbar,
} from "@/index";

export const head = {
  title: "Login/Register Template - Tavo UI",
  head: '<meta name="description" content="A login and registration template composed with @tavojs/ui components">',
};

class AuthTemplateController extends TavoController {}

const LoginRegisterTemplate = createTavo<
  Record<string, never>,
  Record<string, never>,
  AuthTemplateController
>({
  model: () => ({}),
  controller: AuthTemplateController,
  view: () => (
    <Page size="full" padding="none">
      <AppBar position="static">
        <Toolbar>
          <Inline>
            <Chip tone="primary">Tavo Auth</Chip>
            <Link href="/">UI Kit</Link>
            <Link href="/templates/blog">Blog</Link>
            <Link href="/templates/admin">Admin</Link>
          </Inline>
          <Button size="sm" variant="ghost" tone="neutral">
            Help
          </Button>
        </Toolbar>
      </AppBar>

      <Grid
        minItemWidth="24rem"
        spacing="lg"
        style={{ minHeight: "calc(100dvh - 5rem)", alignItems: "stretch" }}
      >
        <Box
          surface="primary"
          padding="lg"
          style={{ display: "grid", alignContent: "center" }}
        >
          <Stack gap="lg">
            <Chip tone="neutral">Authentication template</Chip>
            <Text variant="h1" color="inherit" style={{ maxWidth: "36rem" }}>
              Sign in, create an account, and keep the page CSS-free.
            </Text>
            <Text color="inherit" style={{ maxWidth: "34rem" }}>
              The layout uses Page, Grid, Box, Box, Field, TextInput, Checkbox,
              and Button. Product apps can swap copy and validation without
              inventing a new auth shell.
            </Text>
          </Stack>
        </Box>

        <Box padding="lg" style={{ display: "grid", alignContent: "center" }}>
          <Stack
            gap="lg"
            style={{ maxWidth: "28rem", width: "100%", marginInline: "auto" }}
          >
            <Stack gap="sm">
              <Chip tone="secondary">Account</Chip>
              <Text variant="h2">Welcome back</Text>
              <Text color="muted">
                Use this as a login or registration starting point.
              </Text>
            </Stack>

            <ToggleGroup
              aria-label="Authentication mode"
              name="auth-mode"
              value="login"
              items={[
                { value: "login", label: "Login" },
                { value: "register", label: "Register" },
              ]}
            />

            <Alert tone="info" title="Template note">
              Wire this to page state when you want the segmented control to
              swap between login and registration fields.
            </Alert>

            <Stack>
              <Field label="Email address" required>
                <TextInput type="email" placeholder="you@company.com" />
              </Field>
              <Field
                label="Password"
                hint="Use at least 8 characters."
                required
              >
                <TextInput type="password" placeholder="••••••••" />
              </Field>
              <Inline>
                <Checkbox label="Remember me" />
                <Link href="#">Forgot password?</Link>
              </Inline>
              <Button>Continue</Button>
              <Button variant="outline" tone="neutral">
                Continue with SSO
              </Button>
            </Stack>

            <Text color="muted">
              New here? <Link href="#">Create an account</Link>
            </Text>
          </Stack>
        </Box>
      </Grid>
    </Page>
  ),
});

export default LoginRegisterTemplate;
