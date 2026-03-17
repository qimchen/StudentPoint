'use client';
import React, { useRef, useState, useCallback } from 'react';
import ProgressRing from './ProgressRing';

interface AvatarProps {
  studentId: string;
  name: string;
  totalPoints: number;
  avatarUrl?: string;
  size?: number;
  showLevelRing?: boolean;
  onAvatarChange?: (url: string) => void;
}

const getLevel = (points: number): { name: string; icon: string; color: string; ringColor: string; decorations: string[] } => {
  if (points >= 2000) return { 
    name: '钻石大师', 
    icon: '💎', 
    color: 'from-purple-400 to-purple-600',
    ringColor: '#A855F7',
    decorations: ['crown', 'sparkle', 'glow']
  };
  if (points >= 1000) return { 
    name: '黄金达人', 
    icon: '🥇', 
    color: 'from-yellow-400 to-yellow-600',
    ringColor: '#EAB308',
    decorations: ['crown', 'sparkle']
  };
  if (points >= 500) return { 
    name: '白银高手', 
    icon: '🥈', 
    color: 'from-gray-300 to-gray-500',
    ringColor: '#6B7280',
    decorations: ['sparkle']
  };
  if (points >= 100) return { 
    name: '青铜新星', 
    icon: '🥉', 
    color: 'from-amber-400 to-amber-600',
    ringColor: '#D97706',
    decorations: []
  };
  if (points >= 50) return { 
    name: '积分学徒', 
    icon: '⭐', 
    color: 'from-blue-400 to-blue-600',
    ringColor: '#3B82F6',
    decorations: []
  };
  return { 
    name: '初学者', 
    icon: '🌱', 
    color: 'from-green-400 to-green-600',
    ringColor: '#22C55E',
    decorations: []
  };
};

export default function Avatar({ 
  studentId, 
  name, 
  totalPoints, 
  avatarUrl, 
  size = 72,
  showLevelRing = true,
  onAvatarChange 
}: AvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showTip, setShowTip] = useState(false);
  
  const level = getLevel(totalPoints);
  const progressPercent = Math.min((totalPoints / 2000) * 100, 100);

  const handleDoubleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        
        const response = await fetch('/api/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, avatarUrl: base64 }),
        });

        if (response.ok) {
          onAvatarChange?.(base64);
        } else {
          alert('上传失败，请重试');
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
      alert('上传失败，请重试');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [studentId, onAvatarChange]);

  const avatarContent = (
    <div 
      className="relative cursor-pointer group"
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      {showLevelRing ? (
        <ProgressRing
          progress={progressPercent}
          size={size}
          strokeWidth={4}
          color={level.ringColor}
        >
          <div className={`w-[${size - 12}px] h-[${size - 12}px] rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center overflow-hidden`}>
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-2xl font-bold">{name.charAt(0)}</span>
            )}
          </div>
        </ProgressRing>
      ) : (
        <div 
          className={`rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center overflow-hidden`}
          style={{ width: size, height: size }}
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-2xl font-bold">{name.charAt(0)}</span>
          )}
        </div>
      )}

      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-sm border-2 border-white dark:border-gray-700">
        {level.icon}
      </div>

      {level.decorations.includes('crown') && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg animate-bounce">
          👑
        </div>
      )}

      {level.decorations.includes('sparkle') && (
        <>
          <div className="absolute -top-1 -right-1 text-xs animate-pulse">✨</div>
          <div className="absolute -bottom-1 -left-1 text-xs animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
        </>
      )}

      {level.decorations.includes('glow') && (
        <div className="absolute inset-0 rounded-full animate-pulse-glow opacity-50" style={{ color: level.ringColor }} />
      )}

      {isUploading && (
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
          <div className="loading-spinner" />
        </div>
      )}

      <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>

      {showTip && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
          双击更换头像
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );

  return avatarContent;
}
