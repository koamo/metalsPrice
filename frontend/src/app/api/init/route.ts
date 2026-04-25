import { NextRequest, NextResponse } from 'next/server';

const GOLD_API_KEY = process.env.GOLD_API_KEY ?? '';
const CACHE_EXPIRE_MS = 60 * 1000; // 1분

// 모듈 레벨 메모리 캐시 (Vercel Edge가 아닌 Node 런타임에서 유효)
let cache: {
  metals: Record<string, number> | null;
  rates: Record<string, number> | null;
  charts: Record<string, unknown> | null;
  lastUpdated: number;
} = {
  metals: null,
  rates: null,
  charts: null,
  lastUpdated: 0,
};

async function fetchMetal(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(`https://www.goldapi.io/api/${symbol}/USD`, {
      headers: {
        'x-access-token': GOLD_API_KEY,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.price ?? null;
  } catch {
    return null;
  }
}

function generateChartData(basePrice: number) {
  const now = Date.now();
  const periods: Record<string, { points: number; deltaMs: number; format: 'hour' | 'day' | 'month' }> = {
    '1D': { points: 24, deltaMs: 60 * 60 * 1000, format: 'hour' },
    '1W': { points: 7, deltaMs: 24 * 60 * 60 * 1000, format: 'day' },
    '1M': { points: 30, deltaMs: 24 * 60 * 60 * 1000, format: 'day' },
    '1Y': { points: 12, deltaMs: 30 * 24 * 60 * 60 * 1000, format: 'month' },
  };

  return Object.fromEntries(
    Object.entries(periods).map(([key, { points, deltaMs, format }]) => {
      const data = Array.from({ length: points }, (_, i) => {
        const ts = now - deltaMs * (points - 1 - i);
        const d = new Date(ts);
        const label =
          format === 'hour'
            ? `${d.getHours().toString().padStart(2, '0')}:00`
            : format === 'day'
            ? `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`
            : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        return {
          label,
          price: basePrice + (Math.random() * 2 - 1) * basePrice * 0.03,
        };
      });
      return [key, data];
    })
  );
}

export async function GET(req: NextRequest) {
  // 언어/국가 감지
  const acceptLanguage = req.headers.get('accept-language') ?? '';
  const first = acceptLanguage.split(',')[0].toLowerCase();
  let lang = 'en';
  let country = 'US';
  if (first.includes('ko')) { lang = 'ko'; country = 'KR'; }
  else if (first.includes('ja')) { lang = 'ja'; country = 'JP'; }
  else if (first.includes('zh')) { lang = 'zh'; country = 'CN'; }

  const tzMap: Record<string, string> = {
    KR: 'Asia/Seoul',
    JP: 'Asia/Tokyo',
    CN: 'Asia/Shanghai',
    US: 'America/New_York',
  };
  const timezone = tzMap[country] ?? 'UTC';

  // 캐시 만료 확인
  const now = Date.now();
  if (!cache.metals || now - cache.lastUpdated > CACHE_EXPIRE_MS) {
    const [gold, silver, platinum, palladium] = await Promise.all([
      fetchMetal('XAU'),
      fetchMetal('XAG'),
      fetchMetal('XPT'),
      fetchMetal('XPD'),
    ]);

    cache.metals = {
      gold: gold ?? 2350.5,
      silver: silver ?? 28.2,
      platinum: platinum ?? 950.0,
      palladium: palladium ?? 1050.0,
    };

    cache.charts = Object.fromEntries(
      Object.entries(cache.metals).map(([metal, price]) => [metal, generateChartData(price)])
    );

    try {
      const rateRes = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' });
      if (rateRes.ok) {
        const rateData = await rateRes.json();
        cache.rates = rateData.rates;
      }
    } catch {
      cache.rates = { KRW: 1380.0, JPY: 155.0, CNY: 7.25, USD: 1.0 };
    }

    cache.lastUpdated = now;
  }

  return NextResponse.json({
    lang,
    country,
    timezone,
    prices: cache.metals,
    rates: cache.rates,
    charts: cache.charts,
    unit: 'oz',
    fetched_at: Math.floor(cache.lastUpdated / 1000),
  });
}
