import './Spinner.css'

type SpinnerSize = 'sm' | 'md' | 'lg'

type SpinnerProps = {
  size?: SpinnerSize
  label?: string
}

export function Spinner({ size = 'md', label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" className={`spinner spinner--${size}`} aria-label={label}>
      <svg
        className="spinner__svg"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle className="spinner__track" cx="12" cy="12" r="10" />
        <circle className="spinner__arc" cx="12" cy="12" r="10" />
      </svg>
    </span>
  )
}
