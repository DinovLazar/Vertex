import { StaggerContainer, StaggerItem } from '@/components/global'
import { staggerContainerSlow } from '@/lib/animations'

interface ProcessStep {
  title: string
  description: string
}

interface ProcessStepsProps {
  steps: ProcessStep[]
}

/**
 * Numbered vertical timeline of process steps.
 *
 * Renders each step as a numbered card. On desktop, steps sit in a two-column
 * grid; on mobile they stack. Reveals on scroll via staggered entrance.
 */
export default function ProcessSteps({ steps }: ProcessStepsProps) {
  return (
    <StaggerContainer
      as="ol"
      variants={staggerContainerSlow}
      amount={0.15}
      className="grid grid-cols-1 md:grid-cols-2 gap-5"
    >
      {steps.map((step, index) => (
        <StaggerItem
          key={step.title}
          as="li"
          className="relative flex gap-5 p-6 rounded-card border border-[var(--division-border)] bg-[var(--division-card)]"
        >
          <div className="flex-shrink-0">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-heading text-body font-semibold border border-[var(--division-border)] tabular-nums"
              style={{
                backgroundColor: 'var(--division-surface)',
                color: 'var(--division-text-primary)',
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </div>
          </div>
          <div>
            <h3 className="text-h3 text-[var(--division-text-primary)]">
              {step.title}
            </h3>
            <p className="mt-2 text-small text-[var(--division-text-secondary)]">
              {step.description}
            </p>
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}
