import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || '';
  const title = searchParams.get('title') || 'You are invited!';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fff1f2 0%, #faf5ff 50%, #f0f9ff 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            padding: '60px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              background: 'linear-gradient(to right, #f43f5e, #9333ea)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            MomentPages
          </div>
          <div
            style={{
              fontSize: '52px',
              fontWeight: 700,
              color: '#1f2937',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#6b7280',
              textAlign: 'center',
            }}
          >
            Open to view your personalized invitation
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
