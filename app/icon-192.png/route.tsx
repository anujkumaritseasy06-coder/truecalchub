import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <svg 
          viewBox="0 0 32 32" 
          width={192}
          height={192}
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M4 6C4 4.89543 4.89543 4 6 4H26C27.1046 4 28 4.89543 28 6V13C28 14.1046 27.1046 15 26 15H20V26C20 27.1046 19.1046 28 18 28H14C12.8954 28 12 27.1046 12 26V15H6C4.89543 15 4 14.1046 4 13V6Z" fill="#059669" />
          <rect x="8" y="7" width="16" height="5" rx="1.5" fill="#ffffff" />
          <path d="M10 9.5H15" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M21 9.5H22" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="14" y="17" width="4" height="4" rx="1" fill="#ffffff" />
          <rect x="14" y="22" width="4" height="4" rx="1" fill="#ffffff" />
        </svg>
      </div>
    ),
    {
      width: 192,
      height: 192,
    }
  );
}
