import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/metadata'
import type { Locale } from '@/i18n/routing'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy.meta' })
  return generatePageMetadata({
    title: t('title'),
    description: t('description'),
    path: '/privacy',
    locale,
    noIndex: true,
  })
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'privacy' })

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 prose-blog">
      {/* MK-only notice — the full policy body below is still in English.
          A Macedonian translation, reviewed by counsel, lands before launch. */}
      {locale === 'mk' && (
        <div
          className="mb-10 rounded-card border px-5 py-4 text-small"
          style={{
            borderColor: 'var(--division-border)',
            backgroundColor: 'var(--division-surface)',
            color: 'var(--division-text-secondary)',
          }}
        >
          {t('pendingTranslationNotice')}
        </div>
      )}

      <h1 className="text-h1 text-[var(--division-text-primary)] mb-6">
        Privacy Policy — Vertex Consulting
      </h1>

      <div className="space-y-1 text-small text-[var(--division-text-muted)] mb-6">
        <p>
          <strong className="text-[var(--division-text-secondary)] font-medium">
            Effective date:
          </strong>{' '}
          [to be set when published]
        </p>
        <p>
          <strong className="text-[var(--division-text-secondary)] font-medium">
            Last updated:
          </strong>{' '}
          April 2026
        </p>
      </div>

      <p>
        This policy explains what personal information Vertex Consulting collects when you visit
        our website or contact us, why we collect it, how we use it, and what rights you have
        over it. We aim to be clear and straightforward — no legal tricks.
      </p>

      <hr className="my-10 border-[var(--division-border)]" />

      <h2>1. Who we are</h2>
      <p>
        This website is operated by{' '}
        <strong>ВЕРТЕКС КОНСАЛТИНГ ДООЕЛ</strong> (trading as &ldquo;Vertex Consulting&rdquo;), a
        company registered in North Macedonia.
      </p>
      <ul>
        <li>
          <strong>Address:</strong> Str. Mladinska 43, Strumica, Macedonia
        </li>
        <li>
          <strong>Email:</strong> info@vertexconsulting.mk
        </li>
        <li>
          <strong>Phone:</strong> +389 70 214 033
        </li>
        <li>
          <strong>Owner &amp; data controller:</strong> Goran Dinov
        </li>
      </ul>
      <p>
        If you have any questions about this policy or how your data is handled, contact us at
        the email or phone above.
      </p>

      <hr className="my-10 border-[var(--division-border)]" />

      <h2>2. Information we collect</h2>

      <h3>2.1 Information you give us directly</h3>
      <ul>
        <li>
          <strong>Contact form.</strong> When you fill out our contact form, we collect your
          name, email address, phone number (optional), the division you are interested in
          (Consulting, Marketing, or both), and the content of your message.
        </li>
        <li>
          <strong>Newsletter signup.</strong> When you subscribe to our newsletter, we collect
          your email address.
        </li>
        <li>
          <strong>Direct communication.</strong> If you email, call, or message us through any
          other channel, we receive whatever information you choose to share.
        </li>
      </ul>

      <h3>2.2 Information collected automatically</h3>
      <p>
        When you visit our website, our hosting and analytics providers automatically receive
        standard technical information, including:
      </p>
      <ul>
        <li>Your IP address (which gives approximate geographic location)</li>
        <li>Browser type and version</li>
        <li>Device type and operating system</li>
        <li>Pages you visit and time spent on each</li>
        <li>The website you came from (referrer)</li>
        <li>Date and time of your visit</li>
      </ul>
      <p>
        This is standard for any website and is used to keep the site running, diagnose
        problems, and understand general usage patterns.
      </p>

      <h3>2.3 Cookies</h3>
      <p>Our website uses a small number of cookies. See Section 9 below for details.</p>

      <hr className="my-10 border-[var(--division-border)]" />

      <h2>3. How we use your information</h2>
      <p>We use the information we collect for the following purposes:</p>
      <ul>
        <li>
          <strong>To respond to your inquiries.</strong> If you contact us through the form,
          email, or phone, we use your information to reply and follow up on your request.
        </li>
        <li>
          <strong>To send you our newsletter</strong> — but only if you have subscribed. You can
          unsubscribe at any time using the link in every newsletter we send.
        </li>
        <li>
          <strong>To provide and improve our services.</strong> If you become a client, we use
          your information to deliver the consulting or marketing services we have agreed on.
        </li>
        <li>
          <strong>To keep the website working.</strong> Technical information is used to
          diagnose issues, prevent abuse, and maintain performance.
        </li>
        <li>
          <strong>To comply with legal obligations.</strong> If the law requires us to keep or
          disclose certain information (for example, tax records), we do so.
        </li>
      </ul>
      <p>
        We do <strong>not</strong> use your information to build advertising profiles, sell to
        third parties, or train AI models.
      </p>

      <hr className="my-10 border-[var(--division-border)]" />

      <h2>4. Legal basis for processing</h2>
      <p>
        Under North Macedonia&rsquo;s Law on Personal Data Protection and the EU General Data
        Protection Regulation (GDPR), we process your data on the following legal grounds:
      </p>
      <ul>
        <li>
          <strong>Consent</strong> — for newsletter subscriptions and non-essential cookies. You
          give consent by ticking a box, submitting a form, or clicking &ldquo;Accept.&rdquo;
          You can withdraw consent at any time.
        </li>
        <li>
          <strong>Legitimate interest</strong> — for responding to your inquiries, maintaining
          the website, and preventing abuse. We have a genuine business interest and we have
          considered your rights.
        </li>
        <li>
          <strong>Contract</strong> — if you become a client, to deliver the services we have
          agreed to.
        </li>
        <li>
          <strong>Legal obligation</strong> — for accounting, tax, and regulatory records we are
          required to keep.
        </li>
      </ul>

      <hr className="my-10 border-[var(--division-border)]" />

      <h2>5. Who we share your information with</h2>
      <p>
        We do not sell your data. We only share it with trusted service providers who help us
        run the website and our business. These include:
      </p>
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse text-small">
          <thead>
            <tr style={{ backgroundColor: 'var(--division-surface)' }}>
              <th
                className="border px-4 py-3 text-left font-heading font-semibold text-[var(--division-text-primary)]"
                style={{ borderColor: 'var(--division-border)' }}
              >
                Service
              </th>
              <th
                className="border px-4 py-3 text-left font-heading font-semibold text-[var(--division-text-primary)]"
                style={{ borderColor: 'var(--division-border)' }}
              >
                What they do
              </th>
              <th
                className="border px-4 py-3 text-left font-heading font-semibold text-[var(--division-text-primary)]"
                style={{ borderColor: 'var(--division-border)' }}
              >
                Where they are based
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                className="border px-4 py-3 align-top text-[var(--division-text-primary)] font-medium"
                style={{ borderColor: 'var(--division-border)' }}
              >
                Vercel
              </td>
              <td
                className="border px-4 py-3 align-top text-[var(--division-text-secondary)]"
                style={{ borderColor: 'var(--division-border)' }}
              >
                Hosts the website
              </td>
              <td
                className="border px-4 py-3 align-top text-[var(--division-text-secondary)]"
                style={{ borderColor: 'var(--division-border)' }}
              >
                United States
              </td>
            </tr>
            <tr>
              <td
                className="border px-4 py-3 align-top text-[var(--division-text-primary)] font-medium"
                style={{ borderColor: 'var(--division-border)' }}
              >
                Cloudflare
              </td>
              <td
                className="border px-4 py-3 align-top text-[var(--division-text-secondary)]"
                style={{ borderColor: 'var(--division-border)' }}
              >
                Provides DNS and security for our domain
              </td>
              <td
                className="border px-4 py-3 align-top text-[var(--division-text-secondary)]"
                style={{ borderColor: 'var(--division-border)' }}
              >
                United States
              </td>
            </tr>
            <tr>
              <td
                className="border px-4 py-3 align-top text-[var(--division-text-primary)] font-medium"
                style={{ borderColor: 'var(--division-border)' }}
              >
                Resend
              </td>
              <td
                className="border px-4 py-3 align-top text-[var(--division-text-secondary)]"
                style={{ borderColor: 'var(--division-border)' }}
              >
                Delivers our emails (contact replies, newsletters) and stores newsletter
                subscriber emails
              </td>
              <td
                className="border px-4 py-3 align-top text-[var(--division-text-secondary)]"
                style={{ borderColor: 'var(--division-border)' }}
              >
                United States / EU
              </td>
            </tr>
            <tr>
              <td
                className="border px-4 py-3 align-top text-[var(--division-text-primary)] font-medium"
                style={{ borderColor: 'var(--division-border)' }}
              >
                Google Maps (embedded on the Contact page)
              </td>
              <td
                className="border px-4 py-3 align-top text-[var(--division-text-secondary)]"
                style={{ borderColor: 'var(--division-border)' }}
              >
                Displays our office location
              </td>
              <td
                className="border px-4 py-3 align-top text-[var(--division-text-secondary)]"
                style={{ borderColor: 'var(--division-border)' }}
              >
                United States
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Each of these providers has their own privacy policy and security practices, and each is
        a well-established service with appropriate safeguards for international data transfers
        (see Section 6).
      </p>
      <p>
        We may also share your information when required by law — for example, in response to a
        court order — or to protect the rights, safety, or property of Vertex Consulting, our
        clients, or others.
      </p>

      <hr className="my-10 border-[var(--division-border)]" />

      <h2>6. International data transfers</h2>
      <p>
        Some of our service providers are based outside of North Macedonia and the European
        Economic Area — primarily in the United States. When your data is transferred to these
        countries, we rely on safeguards that meet GDPR standards, including{' '}
        <strong>Standard Contractual Clauses</strong> approved by the European Commission.
      </p>

      <hr className="my-10 border-[var(--division-border)]" />

      <h2>7. How long we keep your data</h2>
      <ul>
        <li>
          <strong>Contact form submissions:</strong> kept for as long as needed to respond to
          your inquiry and, if you become a client, for the duration of our working relationship
          plus any legally required retention period afterwards.
        </li>
        <li>
          <strong>Newsletter subscribers:</strong> kept until you unsubscribe. If you
          unsubscribe, we remove your email from active lists promptly.
        </li>
        <li>
          <strong>Client records:</strong> kept for as long as our legal, accounting, and tax
          obligations require — typically 5 to 10 years after the end of our contract under
          Macedonian law.
        </li>
        <li>
          <strong>Technical logs (IP, browser data):</strong> kept for up to 90 days for
          security and diagnostic purposes.
        </li>
      </ul>
      <p>If you would like your data deleted sooner, contact us (see Section 8).</p>

      <hr className="my-10 border-[var(--division-border)]" />

      <h2>8. Your rights</h2>
      <p>
        You have strong rights over your personal data under Macedonian and EU law. Specifically,
        you have the right to:
      </p>
      <ul>
        <li>
          <strong>Access</strong> — ask us what personal data we hold about you and get a copy.
        </li>
        <li>
          <strong>Correct</strong> — ask us to fix information that is inaccurate or incomplete.
        </li>
        <li>
          <strong>Delete</strong> — ask us to delete your personal data (&ldquo;right to be
          forgotten&rdquo;), subject to any legal obligations we have to keep certain records.
        </li>
        <li>
          <strong>Restrict or object</strong> — ask us to pause or stop processing your data for
          certain purposes (for example, marketing).
        </li>
        <li>
          <strong>Portability</strong> — receive your data in a machine-readable format and
          transfer it to another provider.
        </li>
        <li>
          <strong>Withdraw consent</strong> — for anything you previously agreed to (for
          example, newsletter). Withdrawing consent does not affect processing that already
          happened.
        </li>
        <li>
          <strong>Complain</strong> — to the Agency for Personal Data Protection of North
          Macedonia (Агенција за заштита на личните податоци) or your local EU supervisory
          authority if you believe we have mishandled your data.
        </li>
      </ul>
      <p>
        To exercise any of these rights, email us at{' '}
        <strong>info@vertexconsulting.mk</strong>. We will respond within 30 days.
      </p>

      <hr className="my-10 border-[var(--division-border)]" />

      <h2>9. Cookies</h2>
      <p>Cookies are small text files that websites store on your device. Our site uses:</p>
      <ul>
        <li>
          <strong>Essential cookies</strong> — required for the website to function (for
          example, remembering your language preference between English and Macedonian). These
          do not need your consent.
        </li>
        <li>
          <strong>Analytics cookies</strong> — if enabled, these help us understand how visitors
          use the site in aggregate. We do not identify individual visitors. These only run if
          you have consented.
        </li>
      </ul>
      <p>
        You can clear cookies at any time through your browser settings. Disabling essential
        cookies may break parts of the site.
      </p>

      <hr className="my-10 border-[var(--division-border)]" />

      <h2>10. Children&rsquo;s privacy</h2>
      <p>
        Our website and services are not directed to children under 16. We do not knowingly
        collect personal data from children. If you are a parent or guardian and believe your
        child has given us personal information, contact us and we will delete it.
      </p>

      <hr className="my-10 border-[var(--division-border)]" />

      <h2>11. Security</h2>
      <p>
        We take reasonable steps to protect your information from unauthorized access, loss, or
        misuse. This includes encryption of data in transit (HTTPS across the entire site),
        limited internal access to submitted data, and working only with service providers who
        maintain their own strong security practices.
      </p>
      <p>
        No system is perfectly secure. If we ever become aware of a data breach that affects
        you, we will notify you and the relevant authorities as required by law.
      </p>

      <hr className="my-10 border-[var(--division-border)]" />

      <h2>12. Changes to this policy</h2>
      <p>
        We may update this policy from time to time — for example, if we start using a new
        service provider or if the law changes. When we do, we will update the &ldquo;Last
        updated&rdquo; date at the top. For significant changes, we will notify users by email
        or a prominent notice on the website.
      </p>

      <hr className="my-10 border-[var(--division-border)]" />

      <h2>13. Contact us</h2>
      <p>Questions, requests, or complaints about this policy or your data:</p>
      <p>
        <strong>Email:</strong> info@vertexconsulting.mk
        <br />
        <strong>Phone:</strong> +389 70 214 033
        <br />
        <strong>Mail:</strong> Vertex Consulting, Str. Mladinska 43, Strumica, Macedonia
      </p>

      <hr className="my-10 border-[var(--division-border)]" />

      <p className="italic text-small text-[var(--division-text-muted)]">
        This policy is a plain-language document intended to be clear to visitors. It is not
        formal legal advice. If your business has specific regulatory requirements, consider
        having a lawyer review before publication.
      </p>
    </div>
  )
}
