import { ImageResponse } from 'next/og'

export const alt = 'Vertex Consulting — We help businesses grow smarter.'
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
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background:
                'linear-gradient(135deg, #F5F5F5 0%, #C9C9C9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 700,
              color: '#141414',
            }}
          >
            V
          </div>
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
            Business consulting &amp; digital marketing — from Strumica, Macedonia.
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
