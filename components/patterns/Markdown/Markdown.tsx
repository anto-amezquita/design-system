'use client'

import { Children, Fragment, forwardRef, isValidElement, useMemo } from 'react'
import { compiler } from 'markdown-to-jsx/react'
import { cn } from '../../../lib/cn'
import { Heading } from '../../primitives/Heading'
import { Text } from '../../primitives/Text'
import { Link } from '../../primitives/Link'
import { List } from '../../primitives/List'
import { Blockquote } from '../../primitives/Blockquote'
import { CodeBlock } from '../../primitives/CodeBlock'
import { Image } from '../../primitives/Image'
import { Divider } from '../../primitives/Divider'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table'
import './Markdown.css'

type MarkdownOwnProps = {
  /** The Markdown source. */
  children: string
  /**
   * How many levels to shift headings down. Default 1: `#` renders an `h2`,
   * because the page already has its `h1`. Use 0 when the Markdown is the
   * whole page and its `#` is the page title.
   */
  headingOffset?: 0 | 1 | 2 | 3
}

// decisions/0007: typed against the native attributes so `...rest` reaches the wrapper.
type MarkdownProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & MarkdownOwnProps

type Level = 1 | 2 | 3 | 4 | 5 | 6

/** Text content of a rendered code element, for CodeBlock's `code` string. */
function textOf(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

/**
 * Renders a Markdown string with the system's own components: Heading,
 * Text, Link, List, Blockquote, CodeBlock, Table, Image and Divider, so
 * written content looks like the rest of the product in every brand.
 * Raw HTML in the source is shown as text, never rendered, and unsafe
 * URLs (`javascript:`) are dropped.
 */
export const Markdown = forwardRef<HTMLDivElement, MarkdownProps>(function Markdown({
  children,
  headingOffset = 1,
  className,
  ...rest
}, ref) {
  const content = useMemo(() => {
    const heading = (n: number) => function MarkdownHeading({ children: c, id }: { children?: React.ReactNode; id?: string }) {
      const semantic = Math.min(6, n + headingOffset) as Level
      const visual = Math.min(5, semantic) as Exclude<Level, 6>
      return <Heading level={visual} as={`h${semantic}`} id={id}>{c}</Heading>
    }

    return compiler(children, {
      // Raw HTML in the source stays text: Markdown often comes from people
      // or models, and rendering their HTML would be an injection route.
      disableParsingRawHTML: true,
      forceBlock: true,
      // No wrapper of its own: the blocks sit directly in Markdown's div,
      // where the flow spacing (Markdown.css) can reach them.
      wrapper: Fragment,
      overrides: {
        h1: heading(1), h2: heading(2), h3: heading(3), h4: heading(4), h5: heading(5), h6: heading(6),
        p: { component: Text },
        a: { component: Link },
        ul: { component: (p: React.HTMLAttributes<HTMLUListElement>) => <List marker="bullet" gap="tight" {...p} /> },
        // `start` (a list that begins at 3) isn't in List's props, but List
        // renders an `ol` for numbers and passes attributes through to it.
        ol: { component: ({ start, reversed: _r, type: _t, ...p }: React.OlHTMLAttributes<HTMLOListElement>) => <List marker="number" gap="tight" {...p} {...({ start } as React.HTMLAttributes<HTMLOListElement>)} /> },
        blockquote: { component: ({ children: c }: { children?: React.ReactNode }) => <Blockquote>{c}</Blockquote> },
        hr: { component: () => <Divider /> },
        img: { component: ({ src, alt, title }: React.ImgHTMLAttributes<HTMLImageElement>) => <Image src={String(src ?? '')} alt={alt ?? ''} title={title} /> },
        table: { component: ({ children: c }: { children?: React.ReactNode }) => <Table>{c}</Table> },
        thead: { component: TableHead },
        tbody: { component: TableBody },
        tr: { component: TableRow },
        th: { component: TableHeader },
        td: { component: TableCell },
        // Fenced code becomes a CodeBlock; its language comes from the
        // code element's `lang-…` class. Inline code stays a code element.
        pre: {
          component: ({ children: c }: { children?: React.ReactNode }) => {
            const code = Children.toArray(c).find(isValidElement) as React.ReactElement<{ className?: string; children?: React.ReactNode }> | undefined
            const language = code?.props.className?.match(/(?:lang|language)-(\S+)/)?.[1]
            return <CodeBlock code={textOf(code?.props.children ?? c)} language={language} />
          },
        },
        code: { component: (p: React.HTMLAttributes<HTMLElement>) => <code {...p} className={cn('markdown__code', p.className)} /> },
      },
    })
  }, [children, headingOffset])

  return (
    <div {...rest} ref={ref} className={cn('markdown', className)}>
      {content}
    </div>
  )
})

Markdown.displayName = 'Markdown'
