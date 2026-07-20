'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';

interface Props {
  value: string;          // 签名图片 dataURL
  onChange: (dataUrl: string) => void;
  width?: number;
  height?: number;
  signerName?: string;    // 显示签署人占位文字
}

/**
 * 手写签名画板
 * - 支持鼠标和触摸书写
 * - 实时输出 PNG dataURL
 * - 支持清空、撤销
 */
export default function SignaturePad({
  value,
  onChange,
  width = 560,
  height = 180,
  signerName = '签署人',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);

  const [hasInk, setHasInk] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  // 初始化 canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 适配高分屏
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctxRef.current = ctx;

    // 如果有初始值，加载图片
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setHasInk(true);
      };
      img.src = value;
    }
  }, [width, height, value]);

  const getPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const snapshot = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    // 保存当前画面到撤销栈
    try {
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current.push(img);
      if (historyRef.current.length > 20) historyRef.current.shift();
      setCanUndo(true);
    } catch {
      // ignore
    }
  }, []);

  const startDraw = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    snapshot();
    drawingRef.current = true;
    const pt = getPoint(e);
    lastPointRef.current = pt;
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    // 起笔点画一个圆点，让点击也能留痕
    ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
  }, [getPoint, snapshot]);

  const draw = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    const pt = getPoint(e);
    const last = lastPointRef.current;
    if (!last) {
      lastPointRef.current = pt;
      return;
    }
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPointRef.current = pt;
    if (!hasInk) setHasInk(true);
  }, [getPoint, hasInk]);

  const endDraw = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    // 输出 PNG dataURL
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  }, [onChange]);

  const clear = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    snapshot();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange('');
  }, [onChange, snapshot]);

  const undo = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const last = historyRef.current.pop();
    if (!last) {
      setCanUndo(false);
      return;
    }
    ctx.putImageData(last, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
    setHasInk(true);
    setCanUndo(historyRef.current.length > 0);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <div
        className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gradient-to-br from-amber-50 via-paper to-amber-50 dark:from-amber-900/10 dark:to-amber-900/5"
        style={{ width, height }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
          onPointerCancel={endDraw}
          className="block touch-none cursor-crosshair"
          style={{ width, height }}
        />
        {!hasInk && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400 dark:text-gray-500 select-none">
              <svg className="w-6 h-6 mx-auto mb-1 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="text-xs">请在此处手写 {signerName} 签名</span>
            </div>
          </div>
        )}
        {/* 装饰：右下角小印章 */}
        <div className="absolute bottom-2 right-2 text-[10px] text-gray-300 dark:text-gray-600 select-none pointer-events-none">
          ✍️ 手写签名
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={clear}
          disabled={!hasInk}
          className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-3.5 h-3.5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
          </svg>
          清空
        </button>
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-3.5 h-3.5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          撤销
        </button>
        {hasInk && (
          <span className="text-xs text-green-600 dark:text-green-400 ml-auto">
            ✓ 已签名
          </span>
        )}
      </div>
    </div>
  );
}
