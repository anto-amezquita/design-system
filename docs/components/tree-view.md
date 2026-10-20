# TreeView

> Nested items that open and close, such as files and folders, a component library or an outline, to browse, choose one or choose several

- Tier: patterns
- Storybook: `Components/TreeView`
- Import: `import { TreeView } from '@amezquita/design-system/components/patterns/TreeView'`

## Props

| Prop | Type | Description |
|---|---|---|
| `items` | `{ id: string; label: string; icon?: React.ReactNode; children?: { id: string; label: string; icon?: React.ReactNode; children?: TreeNode[]; disabled?: boolean }[]; disabled?: boolean }[]` | The nodes at the top level. |
| `aria-label` | `string` | Names the tree: "Files", "Components". |
| `selectionMode?` | `'none' \| 'single' \| 'multiple'` | `none` (default): rows are activated (`onAction`), not selected. `single`: one selected row. `multiple`: any number, with a tick each. |
| `selected?` | `string[]` | Controlled selection (ids). Pair with `onSelectedChange`. |
| `defaultSelected?` | `string[]` | Uncontrolled starting selection. |
| `onSelectedChange?` | `(ids: string[]) => void` |  |
| `expanded?` | `string[]` | Controlled open branches (ids). Pair with `onExpandedChange`. |
| `defaultExpanded?` | `string[]` | Uncontrolled starting open branches. |
| `onExpandedChange?` | `(ids: string[]) => void` |  |
| `onAction?` | `(node: { id: string; label: string; icon?: React.ReactNode; children?: { id: string; label: string; icon?: React.ReactNode; children?: TreeNode[]; disabled?: boolean }[]; disabled?: boolean }) => void` | Called when a row is activated with Enter or a click: open a file, go to a page. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLUListElement>, 'aria-label' | 'role'>`

## Best practices

### Do

- Use it when the nesting itself matters: folders, a hierarchy, an outline.
- Keep labels short and unique among siblings, so typing to find works.
- Open the path to the selected row on first render (`defaultExpanded`), so it's in view.

### Don't

- Don't use a tree for site navigation; that's SideNav, with links.
- Don't nest a single level; that's a List, or an Accordion for sections.
- Don't put buttons or links inside rows; a row is one control, activated with Enter.

## Accessibility

- The WAI-ARIA tree pattern: a `tree` with `treeitem`s and nested `group`s. Each item has `aria-level`, `aria-posinset` and `aria-setsize`; branches have `aria-expanded`; with selection, every item has `aria-selected` and a multiple tree is `aria-multiselectable`
- Each item is named by its own label (`aria-labelledby`). Named from its content, an open branch would also read out all its children
- One Tab stop: the row you were last on, else the selected row, else the first. Down and Up move through visible rows; Right opens a branch, then moves into it; Left closes it, then moves to the parent; Home and End go to the ends; `*` opens every branch beside the focused one; typing letters jumps to the next row that starts with them
- Enter activates (or selects, in `single`); Space selects or toggles a row in `multiple`. A click on the caret only opens or closes. A disabled row is reachable and read as unavailable, but can't be chosen
- Selected rows have a bar at the start edge and a heavier label as well as the fill, so it doesn't rest on colour. The focus ring sits on the row, not around the children. Row text, selected rows and disabled rows are tested at 4.5:1, and the caret and the bar at 3:1, in all five brands, light and dark
