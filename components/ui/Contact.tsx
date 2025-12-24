'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarker, faPhone, faEnvelope, faClock, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import ContactForm from './ContactForm';
import LoadingAnimation from './LoadingAnimation';
import { validatePhone, validateEmail } from '../../lib/utils';

export default function Contact() {
  const contactRef = useRef<HTMLDivElement>(null);
  const [showQrcode, setShowQrcode] = useState(false);
  const [mediaLoading, setMediaLoading] = useState<Record<string, boolean>>({});

  // 媒体加载状态管理
  const startMediaLoading = (mediaUrl: string) => {
    setMediaLoading(prev => ({ ...prev, [mediaUrl]: true }));
  };

  const handleMediaLoad = (mediaUrl: string) => {
    setMediaLoading(prev => ({ ...prev, [mediaUrl]: false }));
  };

  // 当显示二维码时，重置二维码图片的加载状态
  useEffect(() => {
    if (showQrcode) {
      startMediaLoading('/images/weixin.png');
    }
  }, [showQrcode]);

  // 滚动动画监听
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (contactRef.current) {
      const elements = contactRef.current.querySelectorAll('.animate-on-scroll');
      elements.forEach((el) => observer.observe(el));
    }

    return () => {
      if (contactRef.current) {
        const elements = contactRef.current.querySelectorAll('.animate-on-scroll');
        elements.forEach((el) => observer.unobserve(el));
      }
    };
  }, []);

  // 微信二维码显示/隐藏
  const toggleQrcode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQrcode(!showQrcode);
  };

  // 点击页面其他地方关闭二维码
  useEffect(() => {
    const handleClickOutside = () => {
      if (showQrcode) {
        setShowQrcode(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showQrcode]);

  return (
    <section 
      id="contact" 
      className="py-20 bg-dark bg-secondary relative overflow-hidden" 
      ref={contactRef}
    >
      {/* 科技感背景装饰 - 与Products保持一致 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-transparent to-gray-950"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 标题区域 - 移除图标，调整间距保持美观 */}
        <div className="text-center max-w-4xl mx-auto mb-16 animate-on-scroll">
          <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
            携手合作，共创未来
          </h2>
          
          <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">
            无论您是需要产品咨询、方案定制还是技术支持，我们的团队都将为您提供专业、高效的服务。
          </p>
          
          {/* 分割线保持与Products样式一致 */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-cyan-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-cyan-500/50"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 联系方式 */}
          <div className="animate-on-scroll">
            <div className="rounded-2xl overflow-hidden border border-cyan-500/20 shadow-[0_0_50px_rgba(0,255,255,0.1)] bg-gray-900/30 backdrop-blur-sm p-8 min-h-[677px] transition-all duration-300 hover:shadow-[0_0_60px_rgba(0,255,255,0.15)]">
              <h3 className="text-2xl font-bold mb-8 text-white">联系方式</h3>
              <ul className="space-y-8">
                {/* 列表图标容器样式统一 */}
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-900/40 to-blue-900/40 flex items-center justify-center border border-cyan-500/30 flex-shrink-0">
                    <FontAwesomeIcon icon={faMapMarker} className="text-cyan-400 text-xl" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2 text-lg">公司地址</h4>
                    <p className="text-gray-300">辽宁省大连高新技术产业园区黄浦路533号海创国际产业大厦3002</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-900/40 to-blue-900/40 flex items-center justify-center border border-cyan-500/30 flex-shrink-0">
                    <FontAwesomeIcon icon={faPhone} className="text-cyan-400 text-xl" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2 text-lg">联系电话</h4>
                    <a className="text-gray-300 hover:text-cyan-400 transition-colors">13795159537</a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-900/40 to-blue-900/40 flex items-center justify-center border border-cyan-500/30 flex-shrink-0">
                    <FontAwesomeIcon icon={faEnvelope} className="text-cyan-400 text-xl" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2 text-lg">电子邮箱</h4>
                    <a className="text-gray-300 hover:text-cyan-400 transition-colors">noname@snzljcloud.cn</a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-900/40 to-blue-900/40 flex items-center justify-center border border-cyan-500/30 flex-shrink-0">
                    <FontAwesomeIcon icon={faClock} className="text-cyan-400 text-xl" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2 text-lg">工作时间</h4>
                    <p className="text-gray-300">周一至周五: 9:00-17:00</p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-12">
                <h4 className="text-white font-semibold mb-6 text-lg">关注我们</h4>
                <div className="flex gap-6">
                  {/* 微信图标容器 - 尺寸与标题图标容器匹配 */}
                  <div className="wechat-icon-wrapper relative" id="wechatContact">
                    <button 
                      className="w-12 h-12 bg-gray-950 rounded-full border border-cyan-500/30 
                                flex items-center justify-center text-cyan-400 
                                hover:bg-cyan-900/40 hover:border-cyan-400 hover:text-white 
                                hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] hover:scale-110
                                active:scale-95
                                transition-all duration-300"
                      onClick={toggleQrcode}
                      aria-label="微信咨询"
                    >
                      <FontAwesomeIcon icon={faCommentDots} className="text-xl" />
                    </button>

                    {/* 二维码容器 - 向上移动（top从-160px改为-200px），优化定位 */}
                    <div 
                      className={`qrcode-container ${showQrcode ? 'show' : ''}`}
                      style={{ 
                        position: 'absolute',
                        top: '-300px', // 向上移动40px，可根据需要调整为-180px/-220px
                        left: 'calc(100% + 5px)',
                        transform: 'translateY(0)',
                        width: '280px',
                        maxWidth: '90vw',
                        zIndex: 50,
                        opacity: showQrcode ? 1 : 0,
                        visibility: showQrcode ? 'visible' : 'hidden',
                        transition: 'opacity 0.3s ease, visibility 0.3s ease'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="qrcode-border relative p-4 bg-gray-900/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.1)]">
                        {/* 图片容器优化 - 确保图片完全居中 */}
                        <div className="w-56 h-56 mx-auto flex items-center justify-center relative">
                          {/* 二维码加载动画 */}
                          {mediaLoading['/images/weixin.png'] && (
                            <div className="absolute inset-0 bg-dark/80 flex items-center justify-center z-10">
                              <LoadingAnimation size="md" color="cyan-500" />
                            </div>
                          )}
                          <Image 
                            src="/images/weixin.png" 
                            alt="微信二维码" 
                            fill // 使用fill模式更灵活
                            sizes="224px"
                            className="object-contain" // 保持图片比例，完全显示
                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                            onLoadStart={() => startMediaLoading('/images/weixin.png')}
                            onLoad={() => handleMediaLoad('/images/weixin.png')}
                            onError={() => handleMediaLoad('/images/weixin.png')}
                          />
                        </div>
                      </div>
                      <div className="qrcode-title mt-3 text-center text-gray-300 text-sm">
                        扫码关注微信公众号
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 联系表单 */}
          <div className="animate-on-scroll">
            <div className="rounded-2xl overflow-hidden border border-cyan-500/20 shadow-[0_0_50px_rgba(0,255,255,0.1)] bg-gray-900/30 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-[0_0_60px_rgba(0,255,255,0.15)]">
              <h3 className="text-2xl font-bold mb-8 text-white">发送咨询</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}