'use client';
import React, { useState, useCallback } from 'react';
import ProgressRing from './ProgressRing';
import { apiFetch } from '../../lib/utils/api';

interface AvatarProps {
  studentId: string;
  name: string;
  totalPoints: number;
  avatarUrl?: string;
  size?: number;
  showLevelRing?: boolean;
  onAvatarChange?: (url: string) => void;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=d1d4e9',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Mia&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Max&backgroundColor=c1e1ff',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe&backgroundColor=bde0fe',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Sam&backgroundColor=ffecc7',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=happy&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=smile&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=joy&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=sunny&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/bottts/svg?seed=cool&backgroundColor=d1d4e9',
  'https://api.dicebear.com/7.x/bottts/svg?seed=awesome&backgroundColor=c1e1ff',
  'https://api.dicebear.com/7.x/bottts/svg?seed=great&backgroundColor=bde0fe',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=beautiful&backgroundColor=ffecc7',
];

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
  const [showPicker, setShowPicker] = useState(false);
  
  const level = getLevel(totalPoints);
  const progressPercent = Math.min((totalPoints / 2000) * 100, 100);

  const handleAvatarSelect = useCallback(async (avatarUrl: string) => {
    try {
      const response = await apiFetch('/api/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, avatarUrl }),
      });

      if (response.ok) {
        onAvatarChange?.(avatarUrl);
      } else {
        alert('设置头像失败，请重试');
      }
    } catch {
      alert('设置头像失败，请重试');
    }
    setShowPicker(false);
  }, [studentId, onAvatarChange]);

  const handleDoubleClick = useCallback(() => {
    setShowPicker(true);
  }, []);

  const displayUrl = avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=random`;

  return (
    <>
      <div 
        className="relative cursor-pointer group"
        onDoubleClick={handleDoubleClick}
      >
        {showLevelRing ? (
          <ProgressRing
            progress={progressPercent}
            size={size}
            strokeWidth={4}
            color={level.ringColor}
          >
            <div 
              className={`rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center overflow-hidden`}
              style={{ width: size - 12, height: size - 12 }}
            >
              <img 
                src={displayUrl} 
                alt={name}
                className="w-full h-full object-cover bg-white"
              />
            </div>
          </ProgressRing>
        ) : (
          <div 
            className={`rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center overflow-hidden`}
            style={{ width: size, height: size }}
          >
            <img 
              src={displayUrl} 
              alt={name}
              className="w-full h-full object-cover bg-white"
            />
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

        <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>

        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          双击更换头像
        </div>
      </div>

      {showPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPicker(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-center">选择头像</h3>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_AVATARS.map((url, index) => (
                <button
                  key={index}
                  className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors bg-gray-100"
                  onClick={() => handleAvatarSelect(url)}
                >
                  <img src={url} alt={`头像 ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <button
              className="mt-4 w-full btn btn-outline"
              onClick={() => setShowPicker(false)}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </>
  );
}
