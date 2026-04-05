'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface FunnelChartProps {
  stageData: { stage: string; count: number }[]
}

export function FunnelChart({ stageData }: FunnelChartProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Funil de Onboarding</h2>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stageData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis type="number" stroke="#e8ffee" fontSize={12} />
            <YAxis
              type="category"
              dataKey="stage"
              width={130}
              stroke="#e8ffee"
              fontSize={11}
              tick={{ fill: '#e8ffee' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0d1610',
                border: '1px solid rgba(0,255,102,0.2)',
                borderRadius: '12px',
                color: '#e8ffee',
              }}
            />
            <Bar dataKey="count" fill="#00ff66" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
