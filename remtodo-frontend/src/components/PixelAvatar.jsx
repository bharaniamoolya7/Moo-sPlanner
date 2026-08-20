import { useMemo } from 'react';

export const AVATAR_OPTIONS = {
  GENDERS: ['girl', 'boy'],
  SKIN_COLORS: ['#FFDFC4', '#F0C8A0', '#D89870', '#8D5B4C', '#5C382B'],
  HAIR_COLORS: ['#FF99B0', '#5A3D31', '#F5D061', '#5B8DEF', '#333333', '#A06CD5'],
  HAIR_STYLES: ['spiky', 'slick_back', 'crew_cut', 'side_part', 'fluffy', 'cap', 'twin_tails', 'bob', 'long'],
  OUTFIT_COLORS: ['#FFB5C2', '#A4C8E1', '#F5E6A4', '#B8D8BA', '#E0D4F5'],
  EYE_STYLES: ['sparkle', 'happy', 'wink', 'cool'],
  ACCESSORIES: ['bow', 'glasses', 'blush_star', 'none']
};

export default function PixelAvatar({ config = {}, size = 80, onClick, className = '' }) {
  const gender = config?.gender || 'girl';
  const skinColor = config?.skinColor || AVATAR_OPTIONS.SKIN_COLORS[0];
  const hairColor = config?.hairColor || AVATAR_OPTIONS.HAIR_COLORS[0];
  const hairStyle = config?.hairStyle || (gender === 'boy' ? 'spiky' : 'twin_tails');
  const outfitColor = config?.outfitColor || AVATAR_OPTIONS.OUTFIT_COLORS[0];
  const eyeStyle = config?.eyeStyle || 'sparkle';
  const accessory = config?.accessory || (gender === 'girl' ? 'bow' : 'none');

  // Grid dimensions: 16x16 pixel matrix
  const pixelGrid = useMemo(() => {
    const grid = Array(16).fill(null).map(() => Array(16).fill(null));

    const fill = (x, y, color) => {
      if (x >= 0 && x < 16 && y >= 0 && y < 16) {
        grid[y][x] = color;
      }
    };

    const fillRect = (x, y, w, h, color) => {
      for (let i = x; i < x + w; i++) {
        for (let j = y; j < y + h; j++) {
          fill(i, j, color);
        }
      }
    };

    const outlineColor = '#2D1B2D'; // Dark retro pixel border

    // --- BODY & OUTFIT (Rows 11..15) ---
    // Neck
    fillRect(7, 10, 2, 1, skinColor);

    // Outfit / Shoulders
    fillRect(4, 11, 8, 4, outfitColor);
    fillRect(3, 12, 10, 3, outfitColor);
    // Outfit outline
    fillRect(3, 11, 1, 4, outlineColor);
    fillRect(12, 11, 1, 4, outlineColor);
    fillRect(4, 15, 8, 1, outlineColor);

    // Collar / Inner detail
    if (gender === 'girl') {
      fillRect(7, 11, 2, 2, '#FFFFFF'); // White collar
    } else {
      fillRect(7, 11, 2, 3, outlineColor); // Tie / Hoodie zip
      fillRect(7, 11, 2, 1, '#FFFFFF');
    }

    // --- HEAD BASE (Rows 4..10, Columns 4..11) ---
    fillRect(5, 4, 6, 7, skinColor);
    fillRect(4, 5, 8, 5, skinColor);

    // Head outline
    fillRect(4, 4, 1, 6, outlineColor);
    fillRect(11, 4, 1, 6, outlineColor);
    fillRect(5, 3, 6, 1, outlineColor);

    // --- EYES (Row 6 & 7) ---
    if (eyeStyle === 'wink') {
      fill(5, 7, outlineColor);
      fill(6, 7, outlineColor);
      fill(9, 7, outlineColor); // Winking eye
    } else if (eyeStyle === 'happy') {
      fill(5, 6, outlineColor); fill(6, 6, outlineColor);
      fill(9, 6, outlineColor); fill(10, 6, outlineColor);
    } else if (eyeStyle === 'cool') {
      fillRect(4, 6, 8, 2, outlineColor); // Cool Sunglasses
      fill(5, 6, '#FFFFFF'); fill(9, 6, '#FFFFFF');
    } else { // Sparkle cute eyes
      fill(5, 6, outlineColor); fill(5, 7, outlineColor);
      fill(6, 6, '#FFFFFF'); fill(6, 7, outlineColor);
      fill(9, 6, outlineColor); fill(9, 7, outlineColor);
      fill(10, 6, '#FFFFFF'); fill(10, 7, outlineColor);
    }

    // Cute Blush (Row 8)
    fill(4, 8, '#FF8899');
    fill(11, 8, '#FF8899');

    // Mouth (Row 9)
    fill(7, 9, '#E85D75');
    fill(8, 9, '#E85D75');

    // --- HAIR STYLES (Eyes at Rows 6-7 stay 100% uncovered) ---
    const hColor = hairColor;
    const hDark = outlineColor;

    if (hairStyle === 'spiky') {
      // Spiky Anime Hair (Points up, high forehead line at row 3 - Eyes open)
      fillRect(4, 2, 8, 2, hColor);
      fill(3, 1, hColor); fill(4, 1, hColor);
      fill(6, 0, hColor); fill(7, 0, hColor);
      fill(9, 1, hColor); fill(10, 1, hColor);
      fill(3, 3, hColor); fill(12, 3, hColor);
      fill(3, 0, hDark); fill(6, -1, hDark); fill(10, 0, hDark);
    } else if (hairStyle === 'slick_back') {
      // Sleek Combed-Back Style (High hairline at row 3 - Eyes open)
      fillRect(4, 2, 8, 2, hColor);
      fillRect(3, 3, 10, 1, hColor);
      fill(5, 1, hColor); fill(10, 1, hColor);
      fill(3, 2, hDark); fill(12, 2, hDark);
    } else if (hairStyle === 'crew_cut') {
      // Short Neat Crop / Fade (Clean forehead - Eyes open)
      fillRect(5, 2, 6, 2, hColor);
      fillRect(4, 3, 8, 1, hColor);
      fill(4, 4, hColor); fill(11, 4, hColor);
    } else if (hairStyle === 'side_part') {
      // Stylish Side Part (Combed to the side - Eyes open)
      fillRect(4, 2, 8, 2, hColor);
      fillRect(3, 3, 6, 1, hColor);
      fillRect(10, 3, 3, 1, hColor);
      fill(3, 4, hColor); fill(12, 4, hColor);
    } else if (hairStyle === 'fluffy') {
      // Fluffy Curly Top (High volume on top - Eyes open)
      fillRect(4, 1, 8, 3, hColor);
      fill(3, 2, hColor); fill(12, 2, hColor);
      fill(5, 0, hColor); fill(10, 0, hColor);
    } else if (hairStyle === 'cap') {
      // Baseball Cap (Visor at row 4 - Eyes open)
      fillRect(3, 2, 10, 2, outfitColor);
      fillRect(2, 4, 12, 1, hDark); // Cap visor
      fill(7, 1, '#FFFFFF'); // Cap badge
    } else if (hairStyle === 'bob') {
      // Cute Bob (Girl)
      fillRect(4, 2, 8, 3, hColor);
      fillRect(3, 3, 10, 5, hColor);
      fillRect(2, 5, 2, 4, hColor);
      fillRect(12, 5, 2, 4, hColor);
    } else if (hairStyle === 'long') {
      // Long Flowing Hair (Girl)
      fillRect(4, 2, 8, 3, hColor);
      fillRect(3, 3, 10, 8, hColor);
      fillRect(2, 5, 2, 7, hColor);
      fillRect(12, 5, 2, 7, hColor);
    } else if (hairStyle === 'crop') {
      // Short Crop
      fillRect(4, 2, 8, 2, hColor);
      fillRect(3, 3, 10, 1, hColor);
    } else {
      // Default Twin Tails (Girl)
      fillRect(4, 2, 8, 3, hColor);
      fillRect(5, 3, 6, 2, hColor);
      // Left Tail
      fillRect(1, 4, 3, 6, hColor);
      fill(2, 3, '#FF4466'); // Ribbon left
      // Right Tail
      fillRect(12, 4, 3, 6, hColor);
      fill(13, 3, '#FF4466'); // Ribbon right
    }

    // --- ACCESSORIES ---
    if (accessory === 'glasses') {
      // Cute Glasses
      fillRect(4, 6, 3, 2, 'rgba(255,255,255,0.4)');
      fillRect(9, 6, 3, 2, 'rgba(255,255,255,0.4)');
      fillRect(4, 6, 3, 1, outlineColor);
      fillRect(9, 6, 3, 1, outlineColor);
      fill(7, 6, outlineColor); // Bridge
    } else if (accessory === 'bow') {
      // Head Bow
      fill(10, 2, '#FF4477'); fill(11, 2, '#FF4477');
      fill(10, 1, '#FF6699'); fill(11, 3, '#FF6699');
    } else if (accessory === 'blush_star') {
      fill(3, 7, '#FFD700'); fill(12, 7, '#FFD700'); // Star cheeks
    }

    return grid;
  }, [gender, skinColor, hairColor, hairStyle, outfitColor, eyeStyle, accessory]);

  return (
    <div
      className={`pixel-avatar-container ${className}`}
      style={{
        width: size,
        height: size,
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        imageRendering: 'pixelated'
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        style={{ shapeRendering: 'crispEdges', width: '100%', height: '100%' }}
      >
        {pixelGrid.map((row, y) =>
          row.map((color, x) =>
            color ? (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={color}
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
