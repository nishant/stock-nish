import type { IntradayPoint } from '../types/stock';

interface SparklineProps {
  data: IntradayPoint[];
  ticker: string;
  isUp: boolean;
}

export function Sparkline({ data, ticker, isUp }: SparklineProps): JSX.Element | null {
  if (data.length < 2) { return null; }

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || minPrice * 0.01;

  const W = 300;
  const H = 56;
  const PAD = 2;

  const toX = (i: number): number => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const toY = (p: number): number => H - PAD - ((p - minPrice) / range) * (H - PAD * 2);

  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(d.price).toFixed(1)}`)
    .join(' ');

  const fillPath = [
    linePath,
    `L ${toX(data.length - 1).toFixed(1)} ${H}`,
    `L ${toX(0).toFixed(1)} ${H}`,
    'Z',
  ].join(' ');

  const color = isUp ? '#22c55e' : '#ef4444';
  const gradId = `spark-grad-${ticker}`;
  const lastX = toX(data.length - 1);
  const lastY = toY(prices[prices.length - 1]);

  // Find the time range label
  const firstTime = new Date(data[0].time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const lastTime = new Date(data[data.length - 1].time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-14"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill={`url(#${gradId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Current price dot */}
        <circle cx={lastX.toFixed(1)} cy={lastY.toFixed(1)} r="3" fill={color} />
        {/* Pulsing ring on the current dot */}
        <circle
          cx={lastX.toFixed(1)}
          cy={lastY.toFixed(1)}
          r="5"
          fill="none"
          stroke={color}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
      </svg>
      {/* Time + price range labels */}
      <div className="mt-0.5 flex items-center justify-between px-0.5">
        <span className="text-[10px] text-gray-600">{firstTime}</span>
        <span className="text-[10px] text-gray-500">
          H <span className="text-gray-400">${maxPrice.toFixed(2)}</span>
          {'  '}L <span className="text-gray-400">${minPrice.toFixed(2)}</span>
        </span>
        <span className="text-[10px] text-gray-600">{lastTime}</span>
      </div>
    </div>
  );
}
