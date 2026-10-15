'use client'

import { forwardRef, useId, useRef, useState } from 'react'
import { FileIcon, UploadSimpleIcon, XIcon } from '@phosphor-icons/react'
import { Field } from '../Field'
import { IconButton } from '../IconButton'
import { useField } from '../../../lib/field'
import { cn } from '../../../lib/cn'
import './FileUpload.css'

type FileUploadOwnProps = {
  /** What the files are, e.g. "Attachments". */
  label: string
  /** Say what's allowed: "PDF or images, up to 10 MB each." */
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  /** Like the native `accept`: "image/*,.pdf". Files that don't match are turned away with a reason. */
  accept?: string
  /** Largest file in bytes. */
  maxSize?: number
  /** Most files at once. 1 makes it a single-file picker. */
  maxFiles?: number
  /** Controlled list. Pair with `onFilesChange`. */
  files?: File[]
  onFilesChange?: (files: File[]) => void
  name?: string
  id?: string
}

type FileUploadProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'id'> & FileUploadOwnProps

const formatSize = (bytes: number) => {
  const [unit, value] =
    bytes >= 1e6 ? ['megabyte', bytes / 1e6] : bytes >= 1e3 ? ['kilobyte', bytes / 1e3] : ['byte', bytes]
  return new Intl.NumberFormat(undefined, { style: 'unit', unit, unitDisplay: 'short', maximumFractionDigits: 1 }).format(value)
}

/** Does a file match an accept string like "image/*,.pdf"? */
export function matchesAccept(file: File, accept?: string) {
  if (!accept) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept.split(',').map(s => s.trim().toLowerCase()).filter(Boolean).some(rule =>
    rule.startsWith('.') ? name.endsWith(rule)
      : rule.endsWith('/*') ? type.startsWith(rule.slice(0, -1))
        : type === rule,
  )
}

/**
 * Pick files by button or by dragging them in. A real file input underneath
 * (so the keyboard, screen readers and the system picker all work), a list
 * of what's chosen with a remove button each, and a polite status that
 * says what was added, removed or turned away, and why.
 */
export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(function FileUpload({
  label,
  hint,
  error,
  required,
  disabled = false,
  id,
  className,
  ...rest
}, ref) {
  const { accept, maxSize, maxFiles, files, onFilesChange, name, ...wrapper } = rest
  return (
    <Field label={label} hint={hint} error={error} required={required} disabled={disabled} id={id} className={cn('file-upload', className)} {...wrapper}>
      <Dropzone
        ref={ref}
        label={label}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFiles}
        files={files}
        onFilesChange={onFilesChange}
        name={name}
      />
    </Field>
  )
})

FileUpload.displayName = 'FileUpload'

type DropzoneProps = Pick<FileUploadOwnProps, 'label' | 'accept' | 'maxSize' | 'maxFiles' | 'files' | 'onFilesChange' | 'name'>

const Dropzone = forwardRef<HTMLInputElement, DropzoneProps>(function Dropzone(
  { label, accept, maxSize, maxFiles, files: filesProp, onFilesChange, name },
  ref,
) {
  const field = useField()
  const inputId = field?.id
  const buttonTextId = useId()
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const controlled = filesProp !== undefined
  const [inner, setInner] = useState<File[]>([])
  const files = controlled ? filesProp : inner
  const [status, setStatus] = useState('')
  const [rejected, setRejected] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const disabled = Boolean(field?.disabled)
  const single = maxFiles === 1

  const update = (next: File[]) => {
    if (!controlled) setInner(next)
    onFilesChange?.(next)
  }

  const add = (incoming: File[]) => {
    const reasons: string[] = []
    const accepted: File[] = []
    const room = maxFiles === undefined ? Infinity : single ? 1 : maxFiles - files.length
    for (const file of incoming) {
      if (!matchesAccept(file, accept)) reasons.push(`${file.name} wasn't added: that type isn't allowed.`)
      else if (maxSize !== undefined && file.size > maxSize) reasons.push(`${file.name} wasn't added: it's larger than ${formatSize(maxSize)}.`)
      else if (accepted.length >= room) reasons.push(`${file.name} wasn't added: ${maxFiles === 1 ? 'only one file' : `at most ${maxFiles} files`}.`)
      else accepted.push(file)
    }
    if (accepted.length) update(single ? accepted : [...files, ...accepted])
    setRejected(reasons)
    const added = accepted.length === 1 ? `${accepted[0].name} added.` : accepted.length > 1 ? `${accepted.length} files added.` : ''
    setStatus([added, ...reasons].filter(Boolean).join(' '))
  }

  const remove = (index: number) => {
    const removed = files[index]
    const next = files.filter((_, i) => i !== index)
    update(next)
    setRejected([])
    setStatus(`${removed.name} removed.`)
    // Focus the next remove button, the previous one, or the picker when the list empties.
    requestAnimationFrame(() => {
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('button')
      const target = buttons?.[Math.min(index, (buttons?.length ?? 1) - 1)]
      ;(target ?? inputRef.current)?.focus()
    })
  }

  return (
    <div className="file-upload__body">
      <div
        className={cn('file-upload__zone', dragging && 'file-upload__zone--dragging', field?.invalid && 'file-upload__zone--error', disabled && 'file-upload__zone--disabled')}
        onDragEnter={e => { if (disabled) return; e.preventDefault(); setDragging(true) }}
        onDragOver={e => { if (disabled) return; e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false) }}
        onDrop={e => {
          if (disabled) return
          e.preventDefault()
          setDragging(false)
          add(Array.from(e.dataTransfer.files))
        }}
      >
        <UploadSimpleIcon className="file-upload__zone-icon" aria-hidden="true" />
        <input
          ref={node => {
            inputRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          id={inputId}
          type="file"
          name={name}
          accept={accept}
          multiple={!single}
          disabled={disabled}
          // Named "Attachments, Choose files"; the hint or error describes it.
          aria-labelledby={`${inputId}-label ${buttonTextId}`}
          aria-describedby={field?.describedBy}
          aria-invalid={field?.invalid || undefined}
          required={field?.required || undefined}
          className="file-upload__input"
          onChange={e => {
            add(Array.from(e.target.files ?? []))
            e.target.value = '' // so choosing the same file again still counts
          }}
        />
        <label htmlFor={inputId} className="file-upload__button">
          <span id={buttonTextId}>{single ? 'Choose a file' : 'Choose files'}</span>
        </label>
        <span className="file-upload__or" aria-hidden="true">or drag {single ? 'it' : 'them'} here</span>
      </div>

      {files.length > 0 && (
        <ul ref={listRef} className="file-upload__list" aria-label={`Chosen for ${label}`}>
          {files.map((file, i) => (
            <li key={`${file.name}-${file.size}-${i}`} className="file-upload__file">
              <FileIcon className="file-upload__file-icon" aria-hidden="true" />
              <span className="file-upload__name">{file.name}</span>
              <span className="file-upload__size">{formatSize(file.size)}</span>
              <IconButton
                size="sm"
                variant="ghost"
                icon={<XIcon />}
                label={`Remove ${file.name}`}
                disabled={disabled}
                onClick={() => remove(i)}
              />
            </li>
          ))}
        </ul>
      )}

      {rejected.length > 0 && (
        <ul className="file-upload__rejected">
          {rejected.map(reason => <li key={reason}>{reason}</li>)}
        </ul>
      )}

      {/* Polite: what was added, removed or turned away. */}
      <div className="file-upload__status" role="status">{status}</div>
    </div>
  )
})
