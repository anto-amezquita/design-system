import './Hero.css'

type HeroProps = {
  eyebrow?: string
  title: string
  titleAs?: 'h1' | 'h2'
  lead?: string
  actions?: React.ReactNode
  align?: 'left' | 'centered'
}

export function Hero({ eyebrow, title, titleAs: Title = 'h1', lead, actions, align = 'left' }: HeroProps) {
  return (
    <section className={`hero${align === 'centered' ? ' hero--centered' : ''}`}>
      <div className="hero__inner">
        {eyebrow && <p className="hero__eyebrow">{eyebrow}</p>}
        <Title className="hero__title">{title}</Title>
        {lead && <p className="hero__lead">{lead}</p>}
        {actions && <div className="hero__actions">{actions}</div>}
      </div>
    </section>
  )
}
