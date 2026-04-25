'use client';

import React, { useEffect, useState } from 'react';
import Clock from '@/components/Clock';
import Calculator from '@/components/Calculator';
import { translations } from '@/lib/translations';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async (isInitial = false) => {
      if (!isInitial) setIsRefreshing(true);
      try {
        const res = await fetch('http://localhost:8000/api/init');
        const json = await res.json();
        setData(json);
        if (isInitial) setLang(json.lang);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchData(true); // 초기 로드
    const interval = setInterval(() => fetchData(false), 60000); // 60초마다 갱신
    return () => clearInterval(interval); // 컴포넌트 언마운트 시 클린업
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-xl sm:text-2xl gold-text animate-pulse">Loading Excellence...</div>
      </div>
    );
  }

  const t = translations[lang as keyof typeof translations] || translations.en;

  return (
    <main className="min-h-screen flex flex-col items-center py-8 sm:py-12 px-4 sm:px-6 space-y-8 sm:space-y-12">
      {/* Header & Language Switcher */}
      <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-light tracking-tighter gold-text uppercase">
            {t.title}
          </h1>
          <p className="text-[9px] sm:text-[10px] text-gold/40 tracking-[0.2em] sm:tracking-[0.3em] uppercase">
            {t.country}: {data?.country} | {data?.timezone}
          </p>
        </div>
        <div className="flex gap-4 sm:gap-6">
          {['en', 'ko', 'ja', 'zh'].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`text-xs sm:text-sm uppercase tracking-widest transition-all ${
                lang === l ? 'gold-text border-b border-gold' : 'text-gold/40 hover:text-gold/60'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
        {/* Left Side: Clock & Prices */}
        <div className="flex flex-col items-center space-y-8 sm:space-y-12">
          <Clock timezone={data?.timezone} />
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
            {['gold', 'silver', 'platinum', 'palladium'].map((metal) => {
              const ozPriceUsd = data?.prices[metal] || 0;
              const rate = data?.rates[t.currency] || 1;
              const gPriceLocal = (ozPriceUsd / 31.1035) * rate;
              
              const formattedPrice = new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : 'en-US', {
                style: 'currency',
                currency: t.currency,
                minimumFractionDigits: lang === 'ko' ? 0 : 2,
                maximumFractionDigits: lang === 'ko' ? 0 : 2,
              }).format(gPriceLocal);

              return (
                <div 
                  key={metal} 
                  className="glass p-2 sm:p-3 text-center border-gold/10 flex flex-col justify-center min-h-[90px] sm:min-h-[100px]"
                >
                  <p className="text-[8px] sm:text-[9px] text-gold/60 uppercase mb-1">{t[metal as keyof typeof t]}</p>
                  <p className="text-[10px] sm:text-xs md:text-sm font-bold gold-text break-all px-1 leading-tight">
                    {formattedPrice}
                  </p>
                  <p className="text-[8px] text-white/20 mt-1">/ g</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Calculator */}
        <div className="w-full flex justify-center">
          <Calculator 
            prices={data?.prices} 
            rates={data?.rates} 
            lang={lang} 
          />
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-auto w-full max-w-4xl px-4 py-8 flex flex-col items-center space-y-4">
        <div className="glass p-6 w-full text-center border-gold/10">
          <p className="text-[10px] sm:text-xs text-gold/40 leading-relaxed max-w-3xl mx-auto italic whitespace-pre-line">
            {t.disclaimer}
          </p>
        </div>
        <div className="flex gap-8 text-[10px] text-gold/30 items-center">
          <p className={isRefreshing ? 'animate-pulse text-gold/60' : ''}>
            {isRefreshing ? '⟳ 시세 갱신 중...' : `${t.lastUpdated}: ${data?.fetched_at ? new Date(data.fetched_at * 1000).toLocaleTimeString() : '---'}`}
          </p>
          <p>Market Data via GoldAPI.io</p>
        </div>
      </div>
    </main>
  );
}
