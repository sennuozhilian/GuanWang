'use client';

import React from 'react';

// 科技感加载动画组件
interface LoadingAnimationProps {
  size?: 'sm' | 'md' | 'lg'; // 动画大小
  color?: string; // 主色调
  className?: string; // 额外CSS类
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = 'md',
  color = 'cyan-500',
  className = ''
}) => {
  // 根据size确定尺寸
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* 外层旋转环 */}
      <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: color, borderLeftColor: color }}></div>
      
      {/* 中层脉冲环 */}
      <div className="absolute inset-0 rounded-full border-2 animate-pulse" style={{ borderColor: color === 'cyan-500' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(14, 165, 233, 0.3)' }}></div>
      
      {/* 内层扫描线 */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent animate-scan" style={{ color }}></div>
      </div>
      
      {/* 中心发光点 */}
      <div className="absolute w-2 h-2 rounded-full bg-current shadow-lg animate-pulse" style={{ color, boxShadow: color === 'cyan-500' ? '0 0 0 2px rgba(6, 182, 212, 0.8)' : '0 0 0 2px rgba(14, 165, 233, 0.8)' }}></div>
    </div>
  );
};

export default LoadingAnimation;
