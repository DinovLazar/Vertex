import React from 'react'

/**
 * Renders a plain string with basic inline `**bold**` markdown into a React
 * fragment. Safe — no HTML interpretation, only span splitting around the
 * `**…**` markers.
 *
 * Used by the service-page templates so translation strings can carry
 * emphasis (e.g. "We use **Next.js** as our primary framework…") without
 * encoding JSX or raw HTML in JSON.
 */
export function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text.includes('**')) return text

  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}
