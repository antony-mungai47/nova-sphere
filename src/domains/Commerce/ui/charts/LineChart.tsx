"use client";

import React from "react";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface LineChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  valueFormatter?: (val: number) => string;
}

export function LineChart({ data, xKey, yKey, color = "#3b82f6", valueFormatter }: LineChartProps) {
  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey={xKey} 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={valueFormatter}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--surface))", 
              borderColor: "hsl(var(--border))",
              borderRadius: "12px",
              color: "hsl(var(--foreground))",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
            }}
            itemStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
            formatter={(value: number) => [valueFormatter ? valueFormatter(value) : value, ""]}
            labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
          />
          <Line 
            type="monotone" 
            dataKey={yKey} 
            stroke={color} 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--surface))" }} 
            activeDot={{ r: 6, strokeWidth: 0 }}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
