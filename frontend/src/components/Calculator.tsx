'use client';

import React, { useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

interface CalculatorProps {
  lang: string;
  prices: any;
  rates: any;
}

const Calculator: React.FC<CalculatorProps> = ({ lang, prices, rates }) => {
  const t = translations[lang as keyof typeof translations] || translations.en;
  
  const [metal, setMetal] = useState('gold');
  const [type, setType] = useState('buy');
  const [weight, setWeight] = useState(1);
  const [unit, setUnit] = useState('g');
  const [total, setTotal] = useState(0);

  const OZ_TO_G = 31.1035;
  const DON_TO_G = 3.75;

  useEffect(() => {
    if (!prices || !rates) return;

    const basePriceUsd = prices[metal]; // Price per oz in USD
    const rate = rates[t.currency] || 1;
    
    let pricePerGram = (basePriceUsd / OZ_TO_G) * rate;
    
    // 매매 수수료 간단 적용 (살 때 +5%, 팔 때 -5% 예시)
    const margin = type === 'buy' ? 1.05 : 0.95;
    pricePerGram *= margin;

    let calculatedTotal = 0;
    if (unit === 'g') {
      calculatedTotal = pricePerGram * weight;
    } else if (unit === 'oz') {
      calculatedTotal = (pricePerGram * OZ_TO_G) * weight;
    } else if (unit === 'don') {
      calculatedTotal = (pricePerGram * DON_TO_G) * weight;
    }

    setTotal(calculatedTotal);
  }, [metal, type, weight, unit, prices, rates, t.currency]);

  return (
    <div className="glass p-8 w-full max-w-md gold-border">
      <h2 className="text-2xl font-bold gold-text mb-6 text-center">{t.calculate}</h2>
      
      <div className="space-y-4">
        {/* Metal Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {['gold', 'silver', 'platinum', 'palladium'].map((m) => (
        <button
          key={m}
          onClick={() => setMetal(m)}
          className={`py-2 text-[10px] sm:text-xs rounded-lg transition-all ${
            metal === m ? 'bg-gold text-background font-bold' : 'bg-white/5 hover:bg-white/10 text-gold/60'
          }`}
        >
          {t[m as keyof typeof t]}
        </button>
      ))}
    </div>

        {/* Type Selection */}
        <div className="flex gap-2">
          {['buy', 'sell'].map((v) => (
            <button
              key={v}
              onClick={() => setType(v)}
              className={`flex-1 py-2 rounded-lg border border-gold/30 transition-all ${
                type === v ? 'bg-gold/20 gold-text' : 'bg-transparent hover:bg-white/5'
              }`}
            >
              {t[v as keyof typeof t]}
            </button>
          ))}
        </div>

        {/* Weight Input */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gold/60 mb-1">{t.weight}</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full bg-white/5 border border-gold/20 rounded-lg p-2 focus:outline-none focus:border-gold"
            />
          </div>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="bg-white/5 border border-gold/20 rounded-lg p-2 focus:outline-none focus:border-gold"
          >
            <option value="g">g</option>
            <option value="oz">oz</option>
            {lang === 'ko' && <option value="don">돈</option>}
          </select>
        </div>

        {/* Result */}
        <div className="mt-8 p-4 bg-gold/10 rounded-xl border border-gold/20 text-center">
          <p className="text-sm text-gold/60 mb-1">{t.total}</p>
          <p className="text-3xl font-bold gold-text">
            {total.toLocaleString(undefined, { maximumFractionDigits: 0 })} {t.currency}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
