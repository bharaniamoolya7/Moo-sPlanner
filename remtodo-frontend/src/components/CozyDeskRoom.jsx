import { useState } from 'react';

export default function CozyDeskRoom() {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div className="cozy-desk-svg-wrapper" style={{ width: '100%', height: '100%', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF8F5', borderRadius: 8, padding: 10 }}>
        <svg viewBox="0 0 400 240" width="100%" height="220" style={{ maxWidth: 500, shapeRendering: 'crispEdges' }}>
          {/* Room Background / Wall */}
          <rect x="0" y="0" width="400" height="170" fill="#FFF8F0" />
          <rect x="0" y="170" width="400" height="70" fill="#E8D5C4" />
          {/* Baseboard */}
          <rect x="0" y="165" width="400" height="5" fill="#C5B09E" />

          {/* Window */}
          <rect x="30" y="20" width="90" height="100" fill="#4B3F72" stroke="#6C5B7B" strokeWidth="4" />
          {/* Night Sky Stars */}
          <circle cx="50" cy="40" r="1.5" fill="#FFE66D" />
          <circle cx="90" cy="35" r="2" fill="#FFE66D" />
          <circle cx="75" cy="70" r="1.5" fill="#FFFFFF" />
          <circle cx="100" cy="85" r="1" fill="#FFE66D" />
          {/* Moon */}
          <circle cx="95" cy="45" r="8" fill="#F7FFF7" />
          {/* Window Pane Divider */}
          <line x1="75" y1="20" x2="75" y2="120" stroke="#6C5B7B" strokeWidth="3" />
          <line x1="30" y1="70" x2="120" y2="70" stroke="#6C5B7B" strokeWidth="3" />
          {/* Window Sill */}
          <rect x="24" y="120" width="102" height="8" fill="#D4A373" />

          {/* Framed Art on Wall */}
          <rect x="290" y="25" width="70" height="50" fill="#F4E1D2" stroke="#8D6E63" strokeWidth="3" />
          <path d="M 300 65 L 315 45 L 330 65 Z" fill="#6C5B7B" />
          <path d="M 320 65 L 335 40 L 350 65 Z" fill="#F8B195" />
          <circle cx="342" cy="36" r="3" fill="#F6D55C" />

          {/* Wall Bookshelf */}
          <rect x="150" y="30" width="110" height="8" fill="#A0522D" />
          {/* Books on Shelf */}
          <rect x="160" y="12" width="10" height="18" fill="#E84A5F" />
          <rect x="172" y="15" width="8" height="15" fill="#355C7D" />
          <rect x="182" y="10" width="12" height="20" fill="#99B898" />
          <rect x="196" y="16" width="9" height="14" fill="#F8B195" />
          {/* Small Plant on Shelf */}
          <rect x="220" y="18" width="14" height="12" fill="#E07A5F" />
          <circle cx="227" cy="14" r="7" fill="#81B29A" />

          {/* Wooden Study Desk */}
          <rect x="110" y="130" width="260" height="12" fill="#C08552" />
          <rect x="120" y="142" width="16" height="68" fill="#9C6644" />
          <rect x="344" y="142" width="16" height="68" fill="#9C6644" />
          <rect x="260" y="142" width="95" height="55" fill="#D4A373" stroke="#9C6644" strokeWidth="2" />
          {/* Desk Drawers */}
          <rect x="270" y="150" width="75" height="18" fill="#F4E1D2" />
          <circle cx="307" cy="159" r="2" fill="#8D6E63" />
          <rect x="270" y="172" width="75" height="18" fill="#F4E1D2" />
          <circle cx="307" cy="181" r="2" fill="#8D6E63" />

          {/* Laptop / Monitor */}
          <rect x="165" y="85" width="70" height="45" fill="#2B2D42" rx="2" />
          <rect x="169" y="89" width="62" height="37" fill="#8D99AE" />
          {/* Screen Content - Code lines */}
          <rect x="173" y="93" width="30" height="3" fill="#E84A5F" />
          <rect x="173" y="99" width="45" height="3" fill="#2A9D8F" />
          <rect x="173" y="105" width="22" height="3" fill="#E9C46A" />
          <rect x="173" y="111" width="38" height="3" fill="#F4A261" />
          {/* Laptop Base */}
          <rect x="155" y="128" width="90" height="4" fill="#8D99AE" />

          {/* Desk Lamp (Warm Glow) */}
          <path d="M 130 130 L 130 100 L 145 95" stroke="#E76F51" strokeWidth="3" fill="none" />
          <path d="M 140 90 L 155 100 L 145 105 Z" fill="#E76F51" />
          {/* Glow Cone */}
          <polygon points="145,102 185,130 130,130" fill="#FFE66D" opacity="0.25" />

          {/* Coffee Mug */}
          <rect x="248" y="118" width="10" height="12" fill="#F4A261" rx="1" />
          <path d="M 258 121 Q 262 124 258 127" stroke="#F4A261" strokeWidth="2" fill="none" />
          {/* Steam */}
          <path d="M 251 114 Q 254 110 251 106" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.7" />

          {/* Plant on Desk */}
          <rect x="345" y="114" width="14" height="16" fill="#E07A5F" />
          <circle cx="352" cy="108" r="9" fill="#2A9D8F" />
          <circle cx="347" cy="104" r="6" fill="#E9C46A" />

          {/* Cozy Chair */}
          <rect x="180" y="145" width="50" height="55" fill="#E84A5F" rx="4" />
          <rect x="185" y="140" width="40" height="35" fill="#F8B195" rx="3" />
          <rect x="200" y="200" width="10" height="25" fill="#2B2D42" />
          <rect x="175" y="222" width="60" height="4" fill="#2B2D42" />

          {/* Cute Sleeping Cat on Rug */}
          <ellipse cx="60" cy="205" rx="25" ry="12" fill="#E9C46A" />
          <ellipse cx="78" cy="200" rx="10" ry="9" fill="#E9C46A" />
          <polygon points="76,192 82,192 79,186" fill="#E76F51" />
          <polygon points="82,193 88,193 85,187" fill="#E76F51" />
          <path d="M 40 205 Q 35 195 42 192" stroke="#E9C46A" strokeWidth="3" fill="none" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src="/pixel-room.png"
      alt="My cozy pixel desk room"
      className="dash-room-img"
      onError={() => setImgError(true)}
      style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 8 }}
    />
  );
}
