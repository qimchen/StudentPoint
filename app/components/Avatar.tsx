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
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const level = getLevel(totalPoints);
  const progressPercent = Math.min((totalPoints / 2000) * 100, 100);

  const handleConfirm = useCallback(async () => {
    if (!selectedAvatar) return;
    
    setIsSaving(true);
    try {
      const response = await apiFetch('/api/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, avatarUrl: selectedAvatar }),
      });

      if (response.ok) {
        onAvatarChange?.(selectedAvatar);
        setShowPicker(false);
        setSelectedAvatar(null);
      } else {
        alert('设置头像失败，请重试');
      }
    } catch {
      alert('设置头像失败，请重试');
    }
    setIsSaving(false);
  }, [studentId, selectedAvatar, onAvatarChange]);

  const handleDoubleClick = useCallback(() => {
    setSelectedAvatar(null);
    setShowPicker(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowPicker(false);
    setSelectedAvatar(null);
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
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}
          onClick={handleClose}
        >
          <div 
            style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '360px', height: '400px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', margin: 0 }}>选择头像</h3>
            </div>
            
            <div style={{ padding: '12px', overflowY: 'auto', flex: '1 1 auto' }}>
              {selectedAvatar && (
                <div style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#eff6ff', borderRadius: '12px' }}>
                  <p style={{ fontSize: '12px', textAlign: 'center', color: '#6b7280', marginBottom: '4px', margin: 0 }}>已选头像</p>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #3b82f6', backgroundColor: 'white' }}>
                      <img src={selectedAvatar} alt="预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {PRESET_AVATARS.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    style={{
                      aspectRatio: '1/1',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: selectedAvatar === url ? '2px solid #3b82f6' : '2px solid transparent',
                      backgroundColor: '#f3f4f6',
                      cursor: 'pointer',
                      padding: 0,
                      outline: selectedAvatar === url ? '2px solid #93c5fd' : 'none',
                      outlineOffset: '2px'
                    }}
                    onClick={() => setSelectedAvatar(url)}
                  >
                    <img src={url} alt={`头像 ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px', flexShrink: 0, backgroundColor: 'white' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '2px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onClick={handleClose}
              >
                取消
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: selectedAvatar && !isSaving ? '#3b82f6' : '#d1d5db',
                  color: selectedAvatar && !isSaving ? 'white' : '#6b7280',
                  fontWeight: '500',
                  cursor: selectedAvatar && !isSaving ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
                onClick={handleConfirm}
                disabled={!selectedAvatar || isSaving}
              >
                {isSaving ? '保存中...' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
