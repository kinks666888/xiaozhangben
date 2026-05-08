import { useEffect, useRef } from 'react';
import { CATEGORY_COLORS, type Category } from '../lib/supabase';

interface PieChartProps {
  data: { category: Category; amount: number }[];
  size?: number;
}

export function PieChart({ data, size = 200 }: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const total = data.reduce((sum, d) => sum + d.amount, 0);
    if (total === 0) {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('暂无数据', size / 2, size / 2);
      return;
    }

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 10;
    let startAngle = -Math.PI / 2;

    ctx.clearRect(0, 0, size, size);

    data.forEach((d) => {
      if (d.amount === 0) return;
      const sliceAngle = (d.amount / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = CATEGORY_COLORS[d.category] || '#6b7280';
      ctx.fill();

      // White border between slices
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Inner circle for donut effect
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`¥${total.toFixed(0)}`, cx, cy - 8);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('总支出', cx, cy + 10);
  }, [data, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}
