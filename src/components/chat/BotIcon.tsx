import type { SVGProps } from 'react'

export function BotIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Antenna */}
      <line x1="12" y1="2" x2="12" y2="4" />
      <circle cx="12" cy="2" r="0.5" fill="currentColor" />
      {/* Head */}
      <rect x="4" y="5" width="16" height="12" rx="3" />
      {/* Eyes */}
      <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
      {/* Mouth / speaker */}
      <line x1="9.5" y1="14" x2="14.5" y2="14" />
      {/* Side ears */}
      <line x1="4" y1="9" x2="2.5" y2="9" />
      <line x1="4" y1="13" x2="2.5" y2="13" />
      <line x1="20" y1="9" x2="21.5" y2="9" />
      <line x1="20" y1="13" x2="21.5" y2="13" />
      {/* Body base */}
      <path d="M8 17v2a2 2 0 002 2h4a2 2 0 002-2v-2" />
    </svg>
  )
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  )
}

export function SendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
}
