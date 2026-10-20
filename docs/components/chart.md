# Chart

> A line chart (change over time, an ordered sequence) or a bar chart (amounts compared across categories), keyboard-explorable and one click from a table of the same data

- Tier: patterns
- Storybook: `Components/Chart`
- Import: `import { Chart } from '@amezquita/design-system/components/patterns/Chart'`

## Props

| Prop | Type | Description |
|---|---|---|
| `type` | `'line' \| 'bar'` | `line` for change over time or an ordered sequence; `bar` to compare amounts across categories. |
| `title` | `string` | What the chart shows, as a statement or question: "Monthly signups, 2026". Shown above it and names it. |
| `description?` | `string` | One or two sentences on what to see in it. Shown under the title and read with the chart. |
| `data` | `ChartDatum[]` | One object per x value, in order. |
| `x` | `string` | The key of the x value in each datum: a date, a number or a category name. |
| `series` | `{ key: string; label: string }[]` | Up to six series, in a fixed colour order: series 1 always takes chart colour 1. |
| `area?` | `boolean` | With `line`: fill under each line, faintly. |
| `formatValue?` | `(value: number) => string` | Format a value for the axis, tooltip, table and speech. Default: the locale's number format. |
| `formatX?` | `(value: string \| number \| Date) => string` | Format an x value. Default: dates as "Mar 2026" (or "12 Mar" when days differ), others as text. |
| `locale?` | `string` | Locale for the default formats. Default: the browser's. |
| `xLabel?` | `string` | The x column's heading in the table. Default "Date" for dates, otherwise "Category". |
| `height?` | `number` | Height of the plot in px. Default 280. |
| `defaultView?` | `'chart' \| 'table'` | Start on the table instead of the chart. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'title'>`

## Best practices

### Do

- Write the title as what the chart shows, and the description as what to notice.
- Keep series in the same order across charts, so a series keeps its colour.
- Start bars at zero; the component always does.

### Don't

- Don't plot two measures with different units on one chart; make two charts.
- Don't use more than six series; fold the rest into "Other" or use small multiples.
- Don't put values on every point; the tooltip, speech and table carry them.

## Accessibility

- A `figure` named by its title. The plot is a focusable group with `aria-roledescription="chart"`, described by the description, a summary written from the data ("Line chart, 3 series: Web, iOS, Android, 12 points, from Jan 2026 to Dec 2026. Values from 600 to 2,470.") and how to explore it. The SVG itself is hidden from screen readers
- Arrow Left and Right move between points, Up and Down between series, Home and End to the ends, Escape to let go. Each point is read aloud through a polite status: "Q2: iOS, 900. Point 2 of 4." The tooltip follows the keyboard as well as the pointer
- Colour is never the only cue: each series has its own line style and marker shape, a legend names them for two or more series, and the tooltip, speech and table say the series name. The series colours are tested at 3:1 on both surfaces in all five brands, light and dark (contrast pairs), and the palette was checked for colour-blind separation with the dataviz validator
- "Show as table" switches to a Table of the same data, with a header for each column and each row
- Axis text, the description and the tooltip text are tested at 4.5:1. Nothing animates
