'use client';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarker, 
  faPhone, 
  faEnvelope, 
  faClock,
  faCertificate,
  faXmark,
  faLink,
  faCube,
  faHeadset
} from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const pathname = usePathname();

  return (
    <footer className="bg-[#0a0e17] py-12 border-t border-[#16213e] relative overflow-hidden">
      {/* 科技感背景网格 */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] bg-[size:20px_20px] opacity-10 pointer-events-none"></div>
      {/* 科技感渐变光晕 */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#06b6d4] rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#8b5cf6] rounded-full filter blur-3xl opacity-20"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 四列科技感布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* 1. 资质证书列（科技感卡片） */}
          <div className="flex flex-col h-full bg-[#0f172a]/50 backdrop-blur-sm rounded-xl border border-[#1e40af]/30 p-5 hover:border-[#06b6d4]/50 transition-all duration-500">            
            <div className="space-y-4 flex-grow">
              <h4 className="text-white font-bold text-lg flex items-center gap-2">
                <FontAwesomeIcon icon={faCertificate} className="text-[#06b6d4] text-base" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#06b6d4] to-[#8b5cf6]">
                  资质证书
                </span>
              </h4>
              
              {/* 科技感证书卡片 */}
              <div 
                className="cursor-pointer group relative rounded-lg overflow-hidden
                          border border-[#1e40af]/40 shadow-lg shadow-[#06b6d4]/5
                          hover:border-[#06b6d4]/70 hover:shadow-[#06b6d4]/15
                          transition-all duration-500"
                onClick={() => setIsCertModalOpen(true)}
              >
                <div className="aspect-[16/9] p-2 bg-[#0f172a]/80">
                  <Image
                    src="/images/cert1.jpg"
                    alt="大连市人工智能产业协会会员单位荣誉证书"
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </div>
                {/* 科技感点击提示 */}
                <div className="absolute top-1 right-1 bg-[#06b6d4]/80 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  点击查看
                </div>
                {/* 科技感卡片光效 */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#06b6d4]/0 via-[#06b6d4]/5 to-[#06b6d4]/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              <p className="text-[#94a3b8] text-sm leading-tight text-center">
                大连市人工智能产业协会会员单位<br />
              </p>
            </div>
          </div>
          
          {/* 2. 快速链接列（科技感链接） */}
          <div className="flex flex-col h-full bg-[#0f172a]/50 backdrop-blur-sm rounded-xl border border-[#1e40af]/30 p-5 hover:border-[#8b5cf6]/50 transition-all duration-500">
            <div className="space-y-4 flex-grow">
              <h4 className="text-white font-bold text-lg flex items-center gap-2">
                <FontAwesomeIcon icon={faLink} className="text-[#8b5cf6] text-base" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">
                  快速链接
                </span>
              </h4>
              <ul className="space-y-3">
                {
                  [
                    { id: 'home', label: '首页' },
                    { id: 'about', label: '关于我们' },
                    { id: 'products', label: '产品中心' },
                    { id: 'cases', label: '应用场景' },
                    { id: 'news', label: '公司资讯' },
                  ].map((item) => (
                    <li key={item.id}>
                      <Link 
                        href={item.id === 'news' ? `/news` : (pathname === '/' ? `#${item.id}` : `/#${item.id}`)} 
                        className="text-[#94a3b8] hover:text-[#06b6d4] transition-colors text-sm flex items-center gap-2
                               relative group-hover:before:w-full before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-0 before:bg-gradient-to-r before:from-[#06b6d4] before:to-[#8b5cf6] before:transition-all before:duration-300"
                      >
                        <span className="w-1 h-1 bg-[#06b6d4] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                        {item.label}
                      </Link>
                    </li>
                  ))
                }
              </ul>
            </div>
          </div>
          
          {/* 3. 产品系列列（科技感产品展示） */}
          <div className="flex flex-col h-full bg-[#0f172a]/50 backdrop-blur-sm rounded-xl border border-[#1e40af]/30 p-5 hover:border-[#22c55e]/50 transition-all duration-500">
            <div className="space-y-4 flex-grow">
              <h4 className="text-white font-bold text-lg flex items-center gap-2">
                <FontAwesomeIcon icon={faCube} className="text-[#22c55e] text-base" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#22c55e] to-[#06b6d4]">
                  产品系列
                </span>
              </h4>
              <ul className="space-y-3">
                {[
                  '人形表演机器人',
                  '教育智能机器人',
                  '商用清洁机器人',
                  '安保巡检机器人',
                  '展厅导览机器人',
                ].map((product) => (
                  <li key={product}>
                    <a 
                      className="text-[#94a3b8] hover:text-[#22c55e] transition-colors text-sm flex items-center gap-2 cursor-pointer
                               relative group-hover:before:w-full before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-0 before:bg-gradient-to-r before:from-[#22c55e] before:to-[#06b6d4] before:transition-all before:duration-300"
                      onClick={() => {
                        // 导航到产品中心
                        const productsSection = document.getElementById('products');
                        if (productsSection) {
                          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      <span className="w-1 h-1 bg-[#22c55e] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {product}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* 4. 联系我们列（科技感联系方式） */}
          <div className="flex flex-col h-full bg-[#0f172a]/50 backdrop-blur-sm rounded-xl border border-[#1e40af]/30 p-5 hover:border-[#f59e0b]/50 transition-all duration-500">
            <div className="space-y-4 flex-grow">
              <h4 className="text-white font-bold text-lg flex items-center gap-2">
                <FontAwesomeIcon icon={faHeadset} className="text-[#f59e0b] text-base" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f59e0b] to-[#ef4444]">
                  联系我们
                </span>
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faMapMarker} className="text-[#06b6d4] mt-1 shrink-0 text-sm" />
                  <span className="text-[#94a3b8] leading-tight">
                    辽宁省大连高新技术产业园区黄浦路533号-海创国际产业大厦3002
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faPhone} className="text-[#22c55e] mt-1 shrink-0 text-sm" />
                  <a  className="text-[#94a3b8] hover:text-[#22c55e] transition-colors">
                    13795159537
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faEnvelope} className="text-[#8b5cf6] mt-1 shrink-0 text-sm" />
                  <a className="text-[#94a3b8] hover:text-[#8b5cf6] transition-colors">
                    noname@snzljcloud.cn
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faClock} className="text-[#f59e0b] mt-1 shrink-0 text-sm" />
                  <span className="text-[#94a3b8]">周一至周五: 9:00-17:00</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* 底部版权（科技感分割线） */}
        <div className="pt-8 border-t border-[#1e40af]/30 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[#64748b] text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} 森诺智联嘉(大连)高新产业技术研究有限公司. <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#06b6d4] to-[#8b5cf6]">All Rights Reserved</span>
          </p>
        </div>
      </div>

      {/* 科技感证书弹窗 */}
      {isCertModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e17]/90 backdrop-blur-md p-4"
          onClick={() => setIsCertModalOpen(false)}
        >
          <div 
            className="relative max-w-[90vw] max-h-[90vh] rounded-xl overflow-hidden border border-[#06b6d4]/50 shadow-xl shadow-[#06b6d4]/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 科技感关闭按钮 */}
            <button 
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-[#0f172a]/80 backdrop-blur-sm border border-[#06b6d4]/30 text-white hover:bg-[#06b6d4]/20 transition-colors z-10"
              onClick={() => setIsCertModalOpen(false)}
              aria-label="关闭证书预览"
            >
              <FontAwesomeIcon icon={faXmark} size="lg" className="text-[#06b6d4]" />
            </button>
            
            <Image
              src="/images/cert1.jpg"
              alt="大连市人工智能产业协会会员单位荣誉证书（放大）"
              width={1200}
              height={900}
              className="object-contain max-h-[85vh]"
              loading="eager"
            />
            {/* 弹窗科技感边框光效 */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#06b6d4]/0 via-[#06b6d4]/10 to-[#06b6d4]/0 pointer-events-none"></div>
          </div>
        </div>
      )}
    </footer>
  );
}