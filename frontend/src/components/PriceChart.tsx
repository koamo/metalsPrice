'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface PriceChartProps {
  data: any[];
  metal: string;
  lang: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, metal, lang }) => {
  return (
    <div className="w-full h-64 glass p-4 gold-border">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.05)" vertical={false} />
          <XAxis 
            dataKey="label" 
            stroke="#d4af37" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'rgba(212, 175, 55, 0.4)' }}
            interval={metal === 'silver' || data.length > 12 ? 'preserveStartEnd' : 0}
          />
          <YAxis 
            hide 
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f0c08', border: '1px solid #d4af37', borderRadius: '8px' }}
            itemStyle={{ color: '#d4af37' }}
            labelStyle={{ display: 'none' }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#d4af37" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
