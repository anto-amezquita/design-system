import { matchRange } from './match'

/**
 * The typed text in bold inside a list option (Combobox, MultiSelect).
 * Styled by `.combobox__match`: weight, not colour, so it reads on any
 * background.
 */
export function Highlight({ text, query }: { text: string; query: string }) {
  const range = matchRange(text, query)
  if (!range) return <>{text}</>
  return (
    <>
      {text.slice(0, range[0])}
      <mark className="combobox__match">{text.slice(range[0], range[1])}</mark>
      {text.slice(range[1])}
    </>
  )
}
