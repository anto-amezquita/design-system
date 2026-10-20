'use client'

import { forwardRef, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { scaleBand, scaleLinear, scalePoint, scaleTime } from 'd3-scale'
import { area as d3area, line as d3line } from 'd3-shape'
import { ChartBarIcon, TableIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import { Button } from '../../primitives/Button'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table'
import './Chart.css'

export type ChartDatum = Record<string, string | number | Date | null | undefined>

export type ChartSeries = {
  /** The data key holding this series' values. */
  key: string
  /** Its name in the legend, the tooltip, the table and what's read aloud. */
  label: string
}

type ChartOwnProps = {
  /** `line` for change over time or an ordered sequence; `bar` to compare amounts across categories. */
  type: 'line' | 'bar'
  /** What the chart shows, as a statement or question: "Monthly signups, 2026". Shown above it and names it. */
  title: string
  /** One or two sentences on what to see in it. Shown under the title and read with the chart. */
  description?: string
  /** One object per x value, in order. */
  data: ChartDatum[]
  /** The key of the x value in each datum: a date, a number or a category name. */
  x: string
  /** Up to six series, in a fixed colour order: series 1 always takes chart colour 1. */
  series: ChartSeries[]
  /** With `line`: fill under each line, faintly. */
  area?: boolean
  /** Format a value for the axis, tooltip, table and speech. Default: the locale's number format. */
  formatValue?: (value: number) => string
  /** Format an x value. Default: dates as "Mar 2026" (or "12 Mar" when days differ), others as text. */
  formatX?: (value: string | number | Date) => string
  /** Locale for the default formats. Default: the browser's. */
  locale?: string
  /** The x column's heading in the table. Default "Date" for dates, otherwise "Category". */
  xLabel?: string
  /** Height of the plot in px. Default 280. */
  height?: number
  /** Start on the table instead of the chart. */
  defaultView?: 'chart' | 'table'
}

// decisions/0007: typed against the native attributes so `...rest` reaches the figure.
type ChartProps = Omit<React.HTMLAttributes<HTMLElement>, 'title'> & ChartOwnProps

const MAX_SERIES = 6
/** Line style per series (the second encoding besides colour): solid, dashed, dotted, … */
const DASHES = ['', '6 4', '2 3', '10 3 2 3', '4 2', '12 4']
/** Marker shape per series, as an SVG path around (0, 0) for an 8px mark. */
const MARKERS = [
  'M 4 0 A 4 4 0 1 1 -4 0 A 4 4 0 1 1 4 0 Z', // circle
  'M -3.5 -3.5 H 3.5 V 3.5 H -3.5 Z', // square
  'M 0 -4.5 L 4.5 3.5 H -4.5 Z', // triangle
  'M 0 -4.5 L 4.5 0 L 0 4.5 L -4.5 0 Z', // diamond
  'M -4 -1.5 H 4 V 1.5 H -4 Z M -1.5 -4 H 1.5 V 4 H -1.5 Z', // plus
  'M 0 4.5 L 4.5 -3.5 H -4.5 Z', // triangle down
]
const MARGIN = { top: 12, right: 16, bottom: 28 }
const NEAR = 24

const asNumber = (v: ChartDatum[string]) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

/** A bar with its free end rounded and its baseline end square. */
function barPath(x: number, w: number, y0: number, y1: number, r: number) {
  const up = y1 <= y0
  const h = Math.abs(y1 - y0)
  const rr = Math.min(r, w / 2, h)
  if (up) {
    return `M ${x} ${y0} V ${y1 + rr} Q ${x} ${y1} ${x + rr} ${y1} H ${x + w - rr} Q ${x + w} ${y1} ${x + w} ${y1 + rr} V ${y0} Z`
  }
  return `M ${x} ${y0} V ${y1 - rr} Q ${x} ${y1} ${x + rr} ${y1} H ${x + w - rr} Q ${x + w} ${y1} ${x + w} ${y1 - rr} V ${y0} Z`
}

/**
 * A line or bar chart drawn as SVG from the system's tokens: series in a
 * fixed colour order with a line style and marker shape each, so colour is
 * never the only cue. It's keyboard-explorable, reads the point you're on
 * aloud, and switches to a table of the same data.
 */
export const Chart = forwardRef<HTMLElement, ChartProps>(function Chart({
  type,
  title,
  description,
  data,
  x,
  series: seriesProp,
  area = false,
  formatValue: formatValueProp,
  formatX: formatXProp,
  locale,
  xLabel,
  height = 280,
  defaultView = 'chart',
  className,
  ...rest
}, ref) {
  const id = useId()
  const series = seriesProp.slice(0, MAX_SERIES)
  if (process.env.NODE_ENV !== 'production' && seriesProp.length > MAX_SERIES) {
    console.warn(`[Chart] ${seriesProp.length} series given; only the first ${MAX_SERIES} are drawn. Fold the rest into "Other", or use small multiples.`)
  }
  const [view, setView] = useState(defaultView)
  const [width, setWidth] = useState(640)
  const [active, setActive] = useState<{ i: number; s: number } | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [spoken, setSpoken] = useState('')
  const box = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setWidth(Math.max(240, el.getBoundingClientRect().width))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [view])

  const number = useMemo(() => new Intl.NumberFormat(locale), [locale])
  const formatValue = formatValueProp ?? ((v: number) => number.format(v))
  const xValues = data.map(d => d[x] as string | number | Date)
  const isTime = xValues.length > 0 && xValues.every(v => v instanceof Date)
  const formatX = formatXProp ?? ((v: string | number | Date) => {
    if (v instanceof Date) {
      const days = new Set(xValues.map(d => (d as Date).getDate())).size > 1
      return v.toLocaleDateString(locale, days ? { day: 'numeric', month: 'short' } : { month: 'short', year: 'numeric' })
    }
    return typeof v === 'number' ? number.format(v) : String(v)
  })

  const values = data.flatMap(d => series.map(s => asNumber(d[s.key]))).filter((v): v is number => v !== null)
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 1
  // Bars always start at zero; lines start at zero unless the values sit far from it.
  const lo = type === 'bar' || min >= 0 && min < max * 0.5 ? Math.min(0, min) : min
  const y = scaleLinear().domain([lo, max === lo ? lo + 1 : max]).nice(5)
  const ticks = y.ticks(5)
  const tickText = ticks.map(t => formatValue(t))
  const marginLeft = Math.max(...tickText.map(t => t.length)) * 7.5 + 16
  const innerW = Math.max(0, width - marginLeft - MARGIN.right)
  const innerH = height - MARGIN.top - MARGIN.bottom
  y.range([innerH, 0])
  // The bars' and areas' base: zero, or the bottom of the axis when it doesn't reach zero.
  const baseY = y(lo > 0 ? lo : 0)

  // x positions: the centre of each datum.
  const band = scaleBand<number>().domain(data.map((_, i) => i)).range([0, innerW]).paddingInner(0.24).paddingOuter(0.12)
  const point = isTime
    ? scaleTime().domain([xValues[0] as Date, xValues[xValues.length - 1] as Date]).range([0, innerW])
    : null
  const points = scalePoint<number>().domain(data.map((_, i) => i)).range([0, innerW]).padding(0.25)
  const cx = (i: number) =>
    type === 'bar' ? band(i)! + band.bandwidth() / 2 : point ? point(xValues[i] as Date) : points(i)!

  const inner = scaleBand<number>().domain(series.map((_, s) => s)).range([0, band.bandwidth()]).paddingInner(series.length > 1 ? 0.08 : 0)

  // Fewer x labels than points when they'd collide: about one per 72px.
  const every = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(innerW / 72))))
  const showMarkers = type === 'line' && data.length <= 24

  const label = (i: number, s: number) => {
    const v = asNumber(data[i]?.[series[s].key])
    const name = series.length > 1 ? `${series[s].label}, ` : ''
    return `${formatX(xValues[i])}: ${name}${v === null ? 'no value' : formatValue(v)}`
  }

  const move = (next: { i: number; s: number }) => {
    const i = Math.max(0, Math.min(data.length - 1, next.i))
    const s = (next.s + series.length) % series.length
    setActive({ i, s })
    setSpoken(`${label(i, s)}. Point ${i + 1} of ${data.length}.`)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const at = active ?? { i: 0, s: 0 }
    const step: Record<string, { i: number; s: number }> = {
      ArrowRight: { i: at.i + 1, s: at.s },
      ArrowLeft: { i: at.i - 1, s: at.s },
      ArrowDown: { i: at.i, s: at.s + 1 },
      ArrowUp: { i: at.i, s: at.s - 1 },
      Home: { i: 0, s: at.s },
      End: { i: data.length - 1, s: at.s },
    }
    if (event.key === 'Escape') {
      setActive(null)
      return
    }
    const next = step[event.key]
    if (!next || !data.length) return
    event.preventDefault()
    move(active ? next : { i: 0, s: 0 })
  }

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const px = event.clientX - rect.left - marginLeft
    let best = 0
    for (let i = 1; i < data.length; i++) {
      if (Math.abs(cx(i) - px) < Math.abs(cx(best) - px)) best = i
    }
    setHover(Math.abs(cx(best) - px) <= Math.max(NEAR, band.step() / 2) ? best : null)
  }

  const shown = active?.i ?? hover
  const tooltipLeft = shown === null ? 0 : marginLeft + cx(shown)
  const titleId = `${id}-title`
  const descId = `${id}-desc`
  const rangeText = values.length ? `Values from ${formatValue(min)} to ${formatValue(max)}.` : 'No values.'
  const kind = type === 'line' ? 'Line chart' : 'Bar chart'
  const summary = `${kind}, ${series.length === 1 ? '1 series' : `${series.length} series: ${series.map(s => s.label).join(', ')}`}, ${data.length} points, ${data.length ? `from ${formatX(xValues[0])} to ${formatX(xValues[data.length - 1])}` : ''}. ${rangeText}`

  return (
    <figure {...rest} ref={ref} className={cn('chart', className)} aria-labelledby={titleId}>
      <div className="chart__header">
        <div className="chart__heading">
          <figcaption id={titleId} className="chart__title">{title}</figcaption>
          {description && <p className="chart__description">{description}</p>}
        </div>
        <Button
          variant="ghost"
          icon={view === 'chart' ? <TableIcon /> : <ChartBarIcon />}
          onClick={() => setView(v => (v === 'chart' ? 'table' : 'chart'))}
          className="chart__switch"
        >
          {view === 'chart' ? 'Show as table' : 'Show as chart'}
        </Button>
      </div>

      {view === 'chart' && series.length > 1 && (
        <ul className="chart__legend" aria-label="Series">
          {series.map((s, si) => (
            <li key={s.key} className={cn('chart__legend-item', `chart__series--${si + 1}`)}>
              <svg className="chart__key" width="28" height="12" viewBox="-14 -6 28 12" aria-hidden="true">
                {type === 'line'
                  ? <><line x1="-13" x2="13" y1="0" y2="0" className="chart__line" strokeDasharray={DASHES[si]} /><path d={MARKERS[si]} className="chart__marker" /></>
                  : <rect x="-6" y="-6" width="12" height="12" rx="2" className="chart__bar" />}
              </svg>
              {s.label}
            </li>
          ))}
        </ul>
      )}

      {view === 'chart' ? (
        <div ref={box} className="chart__plot">
          <div
            className="chart__canvas"
            tabIndex={0}
            role="group"
            aria-roledescription="chart"
            aria-labelledby={titleId}
            aria-describedby={descId}
            onKeyDown={onKeyDown}
            onBlur={() => setActive(null)}
          >
            <VisuallyHidden id={descId}>
              {description ? `${description} ` : ''}{summary} Use the arrow keys to move between points{series.length > 1 ? ' and series' : ''}, or switch to the table.
            </VisuallyHidden>
            <svg
              width={width}
              height={height}
              className="chart__svg"
              aria-hidden="true"
              onPointerMove={onPointerMove}
              onPointerLeave={() => setHover(null)}
            >
              <g transform={`translate(${marginLeft} ${MARGIN.top})`}>
                {ticks.map((t, ti) => (
                  <g key={t} transform={`translate(0 ${y(t)})`}>
                    <line x2={innerW} className={t === 0 ? 'chart__baseline' : 'chart__grid'} />
                    <text x={-8} dy="0.32em" textAnchor="end" className="chart__tick">{tickText[ti]}</text>
                  </g>
                ))}
                {data.map((_, i) => (i % every === 0 || i === data.length - 1 && type === 'bar') && (
                  <text key={i} x={cx(i)} y={innerH + 20} textAnchor="middle" className="chart__tick">{formatX(xValues[i])}</text>
                ))}

                {shown !== null && type === 'line' && (
                  <line x1={cx(shown)} x2={cx(shown)} y2={innerH} className="chart__crosshair" />
                )}
                {shown !== null && type === 'bar' && (
                  <rect x={band(shown)! - band.step() * band.paddingInner() / 2} width={band.step()} height={innerH} className="chart__hover-band" />
                )}

                {type === 'bar' && series.map((s, si) => (
                  <g key={s.key} className={`chart__series--${si + 1}`}>
                    {data.map((d, i) => {
                      const v = asNumber(d[s.key])
                      if (v === null) return null
                      return (
                        <path
                          key={i}
                          d={barPath(band(i)! + inner(si)!, inner.bandwidth(), baseY, y(v), 4)}
                          className={cn('chart__bar', active?.i === i && active.s === si && 'chart__bar--active')}
                        />
                      )
                    })}
                  </g>
                ))}

                {type === 'line' && series.map((s, si) => {
                  const defined = (d: ChartDatum) => asNumber(d[s.key]) !== null
                  const xs = (_: ChartDatum, i: number) => cx(i)
                  const ys = (d: ChartDatum) => y(asNumber(d[s.key])!)
                  const path = d3line<ChartDatum>().defined(defined).x(xs).y(ys)(data) ?? ''
                  const fill = area ? d3area<ChartDatum>().defined(defined).x(xs).y0(baseY).y1(ys)(data) ?? '' : ''
                  return (
                    <g key={s.key} className={`chart__series--${si + 1}`}>
                      {area && <path d={fill} className="chart__area" />}
                      <path d={path} className="chart__line" strokeDasharray={DASHES[si]} />
                      {data.map((d, i) => {
                        const v = asNumber(d[s.key])
                        const on = active?.i === i && active.s === si
                        if (v === null || (!showMarkers && !on && shown !== i)) return null
                        return (
                          <path
                            key={i}
                            d={MARKERS[si]}
                            transform={`translate(${cx(i)} ${y(v)}) scale(${on ? 1.5 : 1})`}
                            className={cn('chart__marker', on && 'chart__marker--active')}
                          />
                        )
                      })}
                    </g>
                  )
                })}
              </g>
            </svg>
            {shown !== null && (
              <div
                className={cn('chart__tooltip', tooltipLeft > width / 2 && 'chart__tooltip--start')}
                style={{ insetInlineStart: tooltipLeft }}
                aria-hidden="true"
              >
                <p className="chart__tooltip-title">{formatX(xValues[shown])}</p>
                {series.map((s, si) => {
                  const v = asNumber(data[shown][s.key])
                  return (
                    <p key={s.key} className={cn('chart__tooltip-row', `chart__series--${si + 1}`, active?.s === si && 'chart__tooltip-row--active')}>
                      <svg className="chart__key" width="12" height="12" viewBox="-6 -6 12 12" aria-hidden="true">
                        {type === 'line' ? <path d={MARKERS[si]} className="chart__marker" /> : <rect x="-5" y="-5" width="10" height="10" rx="2" className="chart__bar" />}
                      </svg>
                      <span className="chart__tooltip-label">{s.label}</span>
                      <span className="chart__tooltip-value">{v === null ? '—' : formatValue(v)}</span>
                    </p>
                  )
                })}
              </div>
            )}
          </div>
          <VisuallyHidden as="div" role="status">{spoken}</VisuallyHidden>
        </div>
      ) : (
        <Table compact scrollLabel={`${title}, as a table`}>
          <TableHead>
            <TableRow>
              <TableHeader scope="col">{xLabel ?? (isTime ? 'Date' : 'Category')}</TableHeader>
              {series.map(s => <TableHeader key={s.key} scope="col" className="chart__cell">{s.label}</TableHeader>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((d, i) => (
              <TableRow key={i}>
                <TableHeader scope="row">{formatX(xValues[i])}</TableHeader>
                {series.map(s => {
                  const v = asNumber(d[s.key])
                  return <TableCell key={s.key} className="chart__cell">{v === null ? '—' : formatValue(v)}</TableCell>
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </figure>
  )
})

Chart.displayName = 'Chart'
