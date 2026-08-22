import { ImageResponse } from 'next/og'
import { brandMarkDataUri } from '@/lib/brand-mark'

export const alt = 'Vertex Consulting: We help businesses grow smarter.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Font note: we deliberately rely on the system-ui fallback. Google Fonts'
// v2 API serves only woff2, which satori (powering ImageResponse) cannot
// parse — the request renders as a 500 with "Unsupported OpenType signature
// wOF2". A bundled .ttf in /public would work but adds ~50KB to the repo for
// a one-image use case; the system sans-serif on every social-platform
// crawler is acceptable and on-brand-adjacent.

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background:
            'linear-gradient(135deg, #141414 0%, #1C1C1C 50%, #141414 100%)',
          color: '#F5F5F5',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-220px',
            right: '-200px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(245,245,245,0.06) 0%, rgba(245,245,245,0) 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-240px',
            left: '-180px',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(245,245,245,0.04) 0%, rgba(245,245,245,0) 70%)',
            filter: 'blur(40px)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            zIndex: 1,
          }}
        >
          {/* The brand disc, drawn from the same vector as the favicon. It is
              passed as an SVG data URI rather than inline markup because
              satori rasterises <img> sources reliably and only partially
              supports inline SVG children. The disc is #0E0E0E on a #141414
              card, so a hairline ring separates it from the background — the
              mark is otherwise near-invisible on its own brand colour. */}
          <img
            src={brandMarkDataUri({ plate: 'disc' })}
            alt=""
            width={72}
            height={72}
            style={{
              borderRadius: '50%',
              boxShadow: 'inset 0 0 0 1px rgba(245,245,245,0.12)',
            }}
          />
          <span
            style={{
              fontSize: '30px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#F5F5F5',
            }}
          >
            Vertex Consulting
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', zIndex: 1 }}>
          <div
            style={{
              fontSize: '96px',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              display: 'flex',
              flexWrap: 'wrap',
              color: '#F5F5F5',
            }}
          >
            <span>We help businesses grow&nbsp;</span>
            <span
              style={{
                background:
                  'linear-gradient(135deg, #FFFFFF 0%, #A3A3A3 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              smarter.
            </span>
          </div>
          <div
            style={{
              marginTop: '28px',
              fontSize: '28px',
              lineHeight: 1.4,
              color: '#A3A3A3',
              maxWidth: '900px',
            }}
          >
            Business consulting &amp; digital marketing, from Strumica, Macedonia.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '22px',
            color: '#737373',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#737373',
                }}
              />
              <span>Consulting</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#737373',
                }}
              />
              <span>Marketing</span>
            </div>
          </div>
          <span style={{ letterSpacing: '0.02em', color: '#A3A3A3' }}>
            vertexconsulting.mk
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
