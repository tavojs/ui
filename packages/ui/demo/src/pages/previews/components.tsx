import { createTavo, type Store, TavoController } from "@tavojs/core";
import {
  Box,
  Button,
  Chip,
  Inline,
  Link,
  Page,
  SearchInput,
  Select,
  Stack,
  Text,
  VisuallyHidden,
} from "@/index";
import {
  componentMetadata,
  type ComponentCategory,
} from "@/metadata";
import tavoLogo from "@/assets/images/tavo-logo.svg";

type ComponentsCatalogState = {
  category: "all" | ComponentCategory;
  query: string;
};

export const head = {
  title: "Components - Tavo.js UI Preview",
  head: '<meta name="description" content="Search and explore every @tavojs/ui component in the package preview">',
};

class ComponentsCatalogController extends TavoController {
  model: Store<ComponentsCatalogState>;

  constructor({ model }: { model: Store<ComponentsCatalogState> }) {
    super();
    this.model = model;
  }

  patch(data: Partial<ComponentsCatalogState>) {
    this.model.patch(data);
  }
}

const categories: ComponentCategory[] = [
  "layout",
  "content",
  "navigation",
  "forms",
  "data",
  "feedback",
  "recipes",
];

const categoryLabels: Record<ComponentCategory, string> = {
  layout: "Layout",
  content: "Content",
  navigation: "Navigation",
  forms: "Forms",
  data: "Data",
  feedback: "Feedback",
  recipes: "Recipes",
};

const ComponentsCatalogPage = createTavo<
  Record<string, never>,
  ComponentsCatalogState,
  ComponentsCatalogController
>({
  model: () => ({ category: "all", query: "" }),
  controller: ComponentsCatalogController,
  view: ({ state, controller }) => {
    const terms = state.query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const searched = terms.length > 0
      ? componentMetadata.filter((component) => {
          const text = [
            component.name,
            component.slug,
            component.category,
            component.description,
            component.whenToUse,
            ...component.searchTerms,
          ].join(" ").toLowerCase();
          return terms.every((term) => text.includes(term));
        })
      : componentMetadata;
    const visible = searched.filter(
      (component) =>
        state.category === "all" || component.category === state.category,
    );

    return (
      <Page size="full" padding="none">
        <header className="catalog-header">
          <div className="catalog-header-inner">
            <Link className="catalog-brand" href="/" noUnderline>
              <img className="catalog-mark" src={tavoLogo} alt="" />
              <span>Tavo.js UI</span>
            </Link>
          </div>
        </header>

        <Box as="main" maxWidth="xl" paddingInline="lg" center fullWidth>
          <Stack gap="lg" className="catalog-page">
            <section className="catalog-hero">
              <Chip tone="primary" size="sm">
                Package preview
              </Chip>
              <Text as="h1" variant="h1" color="heading">
                UI components
              </Text>
              <Text className="catalog-lede" color="muted">
                Browse, filter, and inspect all {componentMetadata.length} public
                components directly from the package. Every component has its own
                page with imports, examples, props, and accessibility guidance.
              </Text>
            </section>

            <section className="catalog-browser" aria-labelledby="component-browser-title">
              <div className="catalog-browser-heading">
                <div>
                  <Text id="component-browser-title" as="h2" variant="h2">
                    Explore the library
                  </Text>
                  <Text color="muted">
                    Search by name, purpose, prop, or accessibility behavior.
                  </Text>
                </div>
                <Chip tone="neutral">
                  {visible.length} {visible.length === 1 ? "component" : "components"}
                </Chip>
              </div>

              <div className="catalog-controls">
                <SearchInput
                  aria-label={`Search ${componentMetadata.length} components`}
                  placeholder={`Search ${componentMetadata.length} components`}
                  value={state.query}
                  clearable
                  onClear={() => controller?.patch({ query: "" })}
                  onInput={(event: Event) =>
                    controller?.patch({
                      query: (event.target as HTMLInputElement).value,
                    })
                  }
                />
                <Select
                  aria-label="Filter components by category"
                  value={state.category}
                  onChange={(event: Event) =>
                    controller?.patch({
                      category: (event.target as HTMLSelectElement)
                        .value as ComponentsCatalogState["category"],
                    })
                  }
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option value={category}>{categoryLabels[category]}</option>
                  ))}
                </Select>
              </div>

              <VisuallyHidden aria-live="polite" aria-atomic="true">
                {visible.length} components shown.
              </VisuallyHidden>

              {visible.length > 0 ? (
                <div className="catalog-grid">
                  {visible.map((component) => (
                    <Link
                      className="catalog-card"
                      href={`/components/${component.slug}`}
                      noUnderline
                      aria-label={`View ${component.name} component`}
                    >
                      <Inline className="catalog-card-meta" justify="between">
                        <Chip size="sm" tone="neutral">
                          {component.category}
                        </Chip>
                        <span aria-hidden="true">↗</span>
                      </Inline>
                      <Text as="h3" variant="h3" color="heading">
                        {component.name}
                      </Text>
                      <Text color="muted">{component.description}</Text>
                      <span className="catalog-card-action">View component →</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <Box className="catalog-empty" padding="lg" radius="lg" border>
                  <Stack gap="sm">
                    <Text as="h3" variant="h3">
                      No components found
                    </Text>
                    <Text color="muted">
                      Try a component name such as “button”, a category such as
                      “forms”, or a goal such as “loading”.
                    </Text>
                    <div>
                      <Button
                        size="sm"
                        variant="soft"
                        onClick={() =>
                          controller?.patch({ query: "", category: "all" })
                        }
                      >
                        Clear filters
                      </Button>
                    </div>
                  </Stack>
                </Box>
              )}
            </section>
          </Stack>
        </Box>
      </Page>
    );
  },
});

export default ComponentsCatalogPage;
