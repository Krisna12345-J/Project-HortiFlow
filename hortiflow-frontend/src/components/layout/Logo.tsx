import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  variant?: 'full' | 'emblem';
  theme?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  variant = 'full',
  theme = 'light',
}) => {
  const emblemHeight = size === 'sm' ? 28 : size === 'lg' ? 44 : 34;
  const hortiTextClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-[26px]' : 'text-[21px]';
  const subtitleClass = size === 'sm' ? 'text-[7px]' : size === 'lg' ? 'text-[9.5px]' : 'text-[8px]';

  const isDark = theme === 'dark';

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      id="hortiflow-brand-logo"
      title="HortiFlow - Content Operations Platform"
    >
      {/* Official HortiFlow Vector Emblem */}
      <svg
        height={emblemHeight}
        viewBox="0 0 116 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-[1.02]"
      >
        <defs>
          <linearGradient id="hfSproutGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9DEE28" />
            <stop offset="100%" stopColor="#6BCB13" />
          </linearGradient>
          <linearGradient id="hfSproutGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B3F73B" />
            <stop offset="100%" stopColor="#7CD917" />
          </linearGradient>
        </defs>

        {/* Sprout on top of right pillar */}
        <g id="sprout-leaves">
          <path
            d="M78 20C78 16 77.5 12 77 9"
            stroke="#5DBA0D"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Left leaf */}
          <path
            d="M77 12C68 11 63 5 64 1C73 1 78 6 77 12Z"
            fill="url(#hfSproutGradLeft)"
          />
          {/* Right leaf */}
          <path
            d="M77 11C86 9 91 3 90 0.5C81 1.5 77 7 77 11Z"
            fill="url(#hfSproutGradRight)"
          />
        </g>

        {/* Left Pillar Pod */}
        <rect
          x="10"
          y="18"
          width="38"
          height="74"
          rx="19"
          fill={isDark ? '#064e3b' : '#033B26'}
        />

        {/* Right Pillar Pod */}
        <rect
          x="62"
          y="18"
          width="38"
          height="74"
          rx="19"
          fill={isDark ? '#064e3b' : '#033B26'}
        />

        {/* Center Connection Block */}
        <rect
          x="30"
          y="42"
          width="50"
          height="26"
          fill={isDark ? '#064e3b' : '#033B26'}
        />

        {/* White continuous flowing stream line ribbons */}
        <g id="flow-path">
          <path
            d="M 72 45 C 72 38 78 33 84 37 C 89 40 88 48 82 50 L 30 50 C 23 50 18 54 18 60 C 18 66 23 70 30 70 L 80 70 C 86 70 90 75 87 81 C 84 86 78 86 74 81"
            stroke="#FFFFFF"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      {/* Brand Typography & Tagline */}
      {variant !== 'emblem' && (
        <div className="flex flex-col justify-center leading-none">
          <div className={`font-black tracking-tight ${hortiTextClass} flex items-center leading-none`}>
            <span className={isDark ? 'text-white font-extrabold tracking-[-0.03em]' : 'text-[#033B26] font-extrabold tracking-[-0.03em]'}>
              Horti
            </span>
            <span className="font-extrabold tracking-[-0.03em] text-emerald-600 ml-[2px]">
              Flow
            </span>
          </div>

          {showSubtitle && (
            <span
              className={`${subtitleClass} font-bold ${isDark ? 'text-emerald-200' : 'text-slate-500'} uppercase tracking-[0.15em] mt-1 whitespace-nowrap`}
              style={{ letterSpacing: '0.15em' }}
            >
              CONTENT OPERATIONS PLATFORM
            </span>
          )}
        </div>
      )}
    </div>
  );
};
