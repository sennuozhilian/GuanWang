'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLightbulb, 
  faShieldHalved, 
  faChartLine, 
  faCogs 
} from '@fortawesome/free-solid-svg-icons';

// 处理文本换行
const formatText = (text: string) => {
  return text.replace(/\n/g, '<br/>').replace(/\r/g, '');
};

// 静态数据 - 替代接口返回内容
const staticAboutData = {
  coreIntro: `专注于智能机器人研发与应用的高新技术企业，深耕于工业与农业智能化领域，以“技术创新驱动产业升级”为核心使命，致力于通过机器人技术与人工智能的深度融合，为各行业提供高效、安全、精准的智能化解决方案。`,
  companyMission: `作为高新技术产业的重要参与者，森诺智联嘉始终以技术创新为引擎，以产业需求为导向，深度与高校、科研院所、产业伙伴合作，加速技术成果转化，致力于成为智能机器人领域协同创新的典范，为推动产业智能化升级 贡献核心力量。`,
  backgroundImage: '/images/company_bg.png' // 替换为实际项目中的图片路径
};

export default function About() {
  const aboutRef = useRef<HTMLDivElement>(null);

  // 从静态数据解构内容
  const { coreIntro, companyMission, backgroundImage: bgImageUrl } = staticAboutData;

  return (
    <section 
      id="about" 
      className="py-20 bg-dark bg-secondary relative overflow-hidden" 
      ref={aboutRef}
    >
      {/* 科技感背景装饰 - 与Products保持一致 */}
      <div className="absolute inset-0 z-0">
        {/* 网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* 动态光晕 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-transparent to-gray-950"></div>
        
        {/* 科技线条装饰 */}
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* 标题区域 - 移除图标，优化间距 */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
            关于我们
          </h2>
          
          <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">
            深耕智能科技领域，以创新驱动发展，用技术赋能未来
          </p>
          
          {/* 科技感分割线 - 与Products一致 */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-cyan-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-cyan-500/50"></div>
          </div>
        </div>

        {/* 内容主体 - 调整样式与Products统一 */}
        <div className="flex flex-col md:flex-row rounded-2xl overflow-hidden border border-cyan-500/20 shadow-[0_0_50px_rgba(0,255,255,0.1)] bg-gray-900/30 backdrop-blur-sm mb-20">
          {/* 左侧图片区域 */}
          <div className="md:w-[55%]">
            <div className="h-full w-full relative">
              <Image
                src={bgImageUrl}
                alt="公司环境"
                fill
                sizes="(min-width: 768px) 55vw, 100vw"
                className="object-cover w-full h-full transition-all duration-1000 ease-out hover:scale-105 hover:brightness-110"
                style={{ filter: 'sepia(10%) brightness(85%) contrast(105%)' }}
              />
              {/* 图片覆盖层 - 与Products风格统一 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none"></div>
              
              {/* 科技感装饰角标 */}
              <div className="absolute -bottom-6 -right-6 w-20 h-20 border-r-2 border-b-2 border-cyan-500/20 rounded-bl-full pointer-events-none"></div>
            </div>
          </div>

          {/* 右侧文字区域 */}
          <div className="md:w-[45%] p-6 md:p-10 lg:p-12 flex flex-col">
            <div className="flex-grow flex flex-col justify-center">
              <div className="space-y-8">
                {/* 公司介绍卡片 - 调整样式 */}
                <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-5 border border-cyan-500/10 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all duration-300">
                  <h3 className="text-white font-semibold text-lg lg:text-xl mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-cyan-400 rounded-full"></span>
                    公司介绍
                  </h3>
                  <p 
                    className="text-gray-300 text-sm md:text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatText(coreIntro) }}
                  />
                </div>

                {/* 企业使命卡片 - 调整样式 */}
                <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-5 border border-blue-500/10 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300">
                  <h3 className="text-white font-semibold text-lg lg:text-xl mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-400 rounded-full"></span>
                    企业使命
                  </h3>
                  <p 
                    className="text-gray-300 text-sm md:text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatText(companyMission) }}
                  />
                </div>

                {/* 核心优势卡片 - 优化图标样式 */}
                <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-5 border border-purple-500/10 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all duration-300">
                  <h3 className="text-white font-semibold text-lg lg:text-xl mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-purple-400 rounded-full"></span>
                    核心优势
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { 
                        icon: faLightbulb, 
                        color: 'cyan', 
                        text: '技术创新',
                        gradient: 'from-cyan-900/40 to-cyan-800/40',
                        glow: 'shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                      },
                      { 
                        icon: faShieldHalved, 
                        color: 'blue', 
                        text: '安全可靠',
                        gradient: 'from-blue-900/40 to-blue-800/40',
                        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                      },
                      { 
                        icon: faChartLine, 
                        color: 'purple', 
                        text: '高效智能',
                        gradient: 'from-purple-900/40 to-purple-800/40',
                        glow: 'shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                      },
                      { 
                        icon: faCogs, 
                        color: 'teal', 
                        text: '定制服务',
                        gradient: 'from-teal-900/40 to-teal-800/40',
                        glow: 'shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                      }
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-4 group cursor-pointer transition-all duration-300 hover:translate-x-1"
                      >
                        {/* 优化后的图标容器 */}
                        <div className={`
                          w-10 h-10 rounded-full 
                          bg-gradient-to-br ${item.gradient} 
                          flex items-center justify-center 
                          border border-${item.color}-500/30 
                          ${item.glow}
                          group-hover:border-${item.color}-400/60 
                          group-hover:shadow-[0_0_20px_rgba(var(--tw-shadow-color),0.4)]
                          transition-all duration-300
                          relative overflow-hidden
                        `}>
                          {/* 内部发光效果 */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* 图标 */}
                          <FontAwesomeIcon 
                            icon={item.icon} 
                            className={`
                              text-${item.color}-400 
                              text-lg 
                              group-hover:scale-110 
                              group-hover:rotate-6
                              transition-all duration-300
                            `} 
                          />
                          
                          {/* 脉冲动画效果 */}
                          <div className={`
                            absolute inset-0 rounded-full 
                            border-2 border-${item.color}-400/30 
                            animate-ping 
                            opacity-0 group-hover:opacity-100
                            transition-opacity duration-300
                          `}></div>
                        </div>
                        
                        {/* 文字 */}
                        <h4 className="text-white text-sm font-medium group-hover:text-opacity-100 transition-all duration-300">
                          {item.text}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* 底部装饰线 - 调整为渐变风格 */}
            <div className="mt-8 w-full h-0.5 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/20"></div>
          </div>
        </div>
      </div>
    </section>
  );
}