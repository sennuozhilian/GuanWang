'use client';
import Image from 'next/image';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarker, 
  faPhone, 
  faEnvelope, 
  faClock,
  faCertificate,
  faXmark
} from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  return (
    <footer className="bg-dark py-12 border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 四列等高布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* 1. 资质证书列（缩小证书尺寸） */}
          <div className="flex flex-col h-full">            
            <div className="space-y-3 flex-grow">
              <h4 className="text-white font-bold text-lg flex items-center gap-2">
                <FontAwesomeIcon icon={faCertificate} className="text-primary text-base" />
                资质证书
              </h4>
              
              {/* 缩小证书：调整aspect比例+减少内边距 */}
              <div 
                className="cursor-pointer group relative rounded-lg overflow-hidden
                          border border-primary/20 shadow-md shadow-primary/5
                          hover:border-primary/50 hover:shadow-primary/15
                          transition-all duration-300"
                onClick={() => setIsCertModalOpen(true)}
              >
                {/* 更扁的横版比例+缩小内边距 */}
                <div className="aspect-[16/9] p-2 bg-gray-800/20">
                  <Image
                    src="/images/cert1.jpg"
                    alt="大连市人工智能产业协会会员单位荣誉证书"
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                </div>
                {/* 紧凑的点击提示 */}
                <div className="absolute top-1 right-1 bg-primary text-white text-xs px-1 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  点击放大
                </div>
              </div>
            </div>
          </div>
          
          {/* 2. 快速链接列（同步紧凑度） */}
          <div className="flex flex-col h-full">
            <div className="space-y-3 flex-grow">
              <h4 className="text-white font-bold text-lg mb-3">快速链接</h4>
              <ul className="space-y-2.5">
                {[
                  { id: 'home', label: '首页' },
                  { id: 'about', label: '关于我们' },
                  { id: 'products', label: '产品中心' },
                  { id: 'cases', label: '案例展示' },
                  { id: 'contact', label: '联系我们' },
                ].map((item) => (
                  <li key={item.id}>
                    <a 
                      href={`#${item.id}`} 
                      className="text-gray-300 hover:text-primary transition-colors text-sm"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* 3. 产品系列列（同步紧凑度） */}
          <div className="flex flex-col h-full">
            <div className="space-y-3 flex-grow">
              <h4 className="text-white font-bold text-lg mb-3">产品系列</h4>
              <ul className="space-y-2.5">
                {[
                  '工业协作机器人',
                  'AGV移动机器人',
                  '智能服务机器人',
                  'SCARA机器人',
                  '机器视觉系统',
                ].map((product) => (
                  <li key={product}>
                    <a 
                      href="#products" 
                      className="text-gray-300 hover:text-primary transition-colors text-sm"
                    >
                      {product}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* 4. 联系我们列（同步紧凑度） */}
          <div className="flex flex-col h-full">
            <div className="space-y-3 flex-grow">
              <h4 className="text-white font-bold text-lg mb-3">联系我们</h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-start gap-2">
                  <FontAwesomeIcon icon={faMapMarker} className="text-primary mt-1 shrink-0 text-sm" />
                  <span className="text-gray-300 leading-tight">
                    辽宁省大连高新技术产业园区黄浦路533号<br />海创国际产业大厦3002
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FontAwesomeIcon icon={faPhone} className="text-primary mt-1 shrink-0 text-sm" />
                  <a href="tel:13795159537" className="text-gray-300 hover:text-primary transition-colors">
                    13795159537
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <FontAwesomeIcon icon={faEnvelope} className="text-primary mt-1 shrink-0 text-sm" />
                  <a href="mailto:noname@snzljcloud.cn" className="text-gray-300 hover:text-primary transition-colors">
                    noname@snzljcloud.cn
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <FontAwesomeIcon icon={faClock} className="text-primary mt-1 shrink-0 text-sm" />
                  <span className="text-gray-300">周一至周五: 9:00-17:00</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* 底部版权（保持不变） */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} 森诺智联机器人技术有限公司. 保留所有权利.
          </p>
          <div className="flex gap-6">
            <a href="/privacy-policy" className="text-gray-400 hover:text-primary transition-colors text-sm">隐私政策</a>
            <a href="/terms-of-service" className="text-gray-400 hover:text-primary transition-colors text-sm">服务条款</a>
            <a href="/sitemap" className="text-gray-400 hover:text-primary transition-colors text-sm">网站地图</a>
          </div>
        </div>
      </div>

      {/* 证书放大弹窗（保持适配） */}
      {isCertModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setIsCertModalOpen(false)}
        >
          <div 
            className="relative max-w-[90vw] max-h-[90vh] rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors z-10"
              onClick={() => setIsCertModalOpen(false)}
              aria-label="关闭证书预览"
            >
              <FontAwesomeIcon icon={faXmark} size="lg" />
            </button>
            
            <Image
              src="/images/cert1.jpg"
              alt="大连市人工智能产业协会会员单位荣誉证书（放大）"
              width={1200}
              height={900}
              className="object-contain max-h-[85vh]"
              loading="eager"
            />
          </div>
        </div>
      )}
    </footer>
  );
}