'use client';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LoadingAnimation from './LoadingAnimation';
import { 
  faChevronLeft, faChevronRight, 
  faBrain, faShieldAlt, faBroom, faGraduationCap,
  faMapMarkerAlt, faRobot, faStar,
  faCogs, faWifi, faEye, faHandshake
} from '@fortawesome/free-solid-svg-icons';

// 扩展产品数据类型定义
interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  features: string[]; // 核心特性
  scenarios: string[]; // 应用场景
  icon: any; // 产品图标
}

// 静态产品数据（补充特性、场景、图标）
const staticProducts: Product[] = [
  {
    id: '1',
    name: '人形表演机器人',
    description: '搭载精准律动控制与仿生关节设计的人形机器人，可完成灵动舞蹈、创意姿态等多元化舞台表演，带来沉浸式视觉体验。',
    image: '/images/man-robot.png',
    features: [
      '16+自由度仿生关节',
      '精准动作捕捉与复刻',
      '多机协同编队表演',
      '自定义动作编程',
      '超长续航可达8小时'
    ],
    scenarios: ['商业演出', '主题乐园', '品牌活动', '文旅景区'],
    icon: faRobot
  },
  {
    id: '2',
    name: '教育智能机器人',
    description: '专为教育场景设计的智能机器人，支持互动教学、编程教育、智能答疑等功能，助力校园数字化转型，激发学生创新思维。',
    image: '/images/edu-robot.png',
    features: [
      'AI智能问答系统',
      '图形化编程教学',
      '多学科课程适配',
      '学情数据分析',
      '多人协作学习模式'
    ],
    scenarios: ['中小学教育', '职业院校', '科技馆', '培训机构'],
    icon: faGraduationCap
  },
  {
    id: '3',
    name: '商用清洁机器人',
    description: '适用于商场、写字楼、机场等大型公共场所的智能清洁机器人，具备自主导航、智能避障、多模式清洁功能，大幅提升清洁效率。',
    image: '/images/clean-robot.png',
    features: [
      'SLAM激光自主导航',
      '多模式清洁系统',
      '自动充电续航12小时',
      '清洁覆盖率99.8%',
      '远程监控与调度'
    ],
    scenarios: ['商业综合体', '交通枢纽', '写字楼', '工业园区'],
    icon: faBroom
  },
  {
    id: '4',
    name: '安保巡检机器人',
    description: '全天候智能安保巡检机器人，搭载高清摄像头、红外检测、语音告警等功能，实现无人化巡检，保障园区、厂区安全。',
    image: '/images/security-robot.png',
    features: [
      '24小时无人值守巡检',
      '红外热成像检测',
      '智能语音告警',
      '人脸识别与追踪',
      '防入侵检测系统'
    ],
    scenarios: ['工业园区', '物流园区', '住宅小区', '政府大院'],
    icon: faShieldAlt
  },
  {
    id: '5',
    name: '展厅导览机器人',
    description: '为展馆、展厅、科技馆定制的智能导览机器人，支持语音讲解、路径规划、互动问答，提升参观体验和服务效率。',
    image: '/images/guide-robot.png',
    features: [
      '多语种语音讲解',
      '自主路径规划',
      '智能避障导航',
      'AR互动展示',
      '大数据客流分析'
    ],
    scenarios: ['博物馆', '企业展厅', '科技馆', '会展中心'],
    icon: faMapMarkerAlt
  }
];

// 核心技术优势数据
const coreTechnologies = [
  {
    icon: faBrain,
    title: 'AI智能算法',
    desc: '自研核心算法，具备自主学习和智能决策能力'
  },
  {
    icon: faCogs,
    title: '精密运动控制',
    desc: '毫米级精准控制，实现复杂动作与稳定运行'
  },
  {
    icon: faWifi,
    title: '多模通信技术',
    desc: '5G+WiFi6双模式，保障数据传输稳定低延迟'
  },
  {
    icon: faEye,
    title: '机器视觉识别',
    desc: '多传感器融合，精准识别环境与目标物体'
  }
];

export default function ProductsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const products = staticProducts;

  // 初始化时为所有产品图片设置加载状态为true
  const initialMediaLoading = products.reduce((acc, product) => {
    acc[product.image] = true;
    return acc;
  }, {} as Record<string, boolean>);

  const [mediaLoading, setMediaLoading] = useState<Record<string, boolean>>(initialMediaLoading);

  // 媒体加载状态管理
  const startMediaLoading = (mediaUrl: string) => {
    setMediaLoading(prev => ({ ...prev, [mediaUrl]: true }));
  };

  const handleMediaLoad = (mediaUrl: string) => {
    setMediaLoading(prev => ({ ...prev, [mediaUrl]: false }));
  };

  // 添加超时机制，防止图片加载状态永远为true
  useEffect(() => {
    // 为每个图片设置5秒超时
    const timers = products.map(product => {
      return setTimeout(() => {
        setMediaLoading(prev => ({ ...prev, [product.image]: false }));
      }, 5000);
    });

    // 清理定时器
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [products]);

  // 当切换产品时，重置当前产品图片的加载状态
  useEffect(() => {
    if (products.length > 0) {
      startMediaLoading(products[currentIndex].image);
    }
  }, [currentIndex, products]);

  // 自动轮播逻辑
  useEffect(() => {
    if (products.length <= 1) return;
    
    const interval = setInterval(() => {
      if (!isHovered) {
        setCurrentIndex(prev => (prev + 1) % products.length);
      }
    }, 6000);
    
    return () => clearInterval(interval);
  }, [products.length, isHovered]);

  // 轮播控制
  const nextSlide = () => setCurrentIndex(prev => (prev + 1) % products.length);
  const prevSlide = () => setCurrentIndex(prev => (prev - 1 + products.length) % products.length);
  const goToSlide = (index: number) => setCurrentIndex(index);

  // 当前展示的产品
  const currentProduct = products[currentIndex];

  return (
    <section 
      id="products" 
      className="py-20 bg-dark bg-secondary relative overflow-hidden"
    >
      {/* 科技感背景装饰 */}
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 标题区域 - 移除图标，优化间距 */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
            智能机器人产品矩阵
          </h2>
          
          <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">
            覆盖教育、清洁、安保、导览、演艺等多场景的智能机器人解决方案<br/>
            以核心技术创新，赋能千行百业数字化升级
          </p>
          
          {/* 科技感分割线 */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-cyan-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-cyan-500/50"></div>
          </div>
        </div>

        {/* 轮播主体 */}
        <div 
          className="relative max-w-6xl mx-auto mb-20"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* 轮播内容容器 */}
          <div className="rounded-2xl overflow-hidden border border-cyan-500/20 shadow-[0_0_50px_rgba(0,255,255,0.1)] bg-gray-900/30 backdrop-blur-sm">
            <div className="relative aspect-[16/9]">
              {/* 产品图片层 */}
              <div className="absolute inset-0 overflow-hidden">
                {/* 图片加载动画 */}
                {mediaLoading[currentProduct.image] && (
                  <div className="absolute inset-0 bg-dark/80 flex items-center justify-center z-10">
                    <LoadingAnimation size="lg" color="cyan-500" />
                  </div>
                )}
                <img
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover transition-all duration-1000 ease-out hover:scale-105 hover:brightness-110"
                  loading="eager"
                  style={{ filter: 'sepia(10%) brightness(85%) contrast(105%)' }}
                  onLoadStart={() => startMediaLoading(currentProduct.image)}
                  onLoad={() => handleMediaLoad(currentProduct.image)}
                  onError={() => handleMediaLoad(currentProduct.image)}
                />
                
                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none"></div>
              </div>

              {/* 产品信息层 */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12 z-10">
                <div className="max-w-3xl">
                  {/* 产品图标+名称 */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-900/40 flex items-center justify-center border border-cyan-500/30">
                      <FontAwesomeIcon icon={currentProduct.icon} className="text-cyan-400 text-xl" />
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-wide">
                      {currentProduct.name}
                    </h3>
                  </div>
                  
                  {/* 产品描述 */}
                  <div className="relative pl-4 border-l-2 border-cyan-400/50 bg-black/30 backdrop-blur-sm rounded-r-lg p-3 md:p-4 mb-6">
                    <p className="text-gray-100 text-sm md:text-base leading-relaxed text-shadow-sm" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                      {currentProduct.description}
                    </p>
                  </div>
                  
                  {/* 核心特性标签 */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {currentProduct.features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-900/30 text-cyan-300 text-xs rounded-full border border-blue-500/20">
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  {/* 科技感装饰角标 */}
                  <div className="absolute -bottom-6 -right-6 w-20 h-20 border-r-2 border-b-2 border-cyan-500/20 rounded-bl-full pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 翻页按钮 */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 
                      bg-gray-900/70 backdrop-blur-md rounded-full border border-cyan-500/30 
                      flex items-center justify-center text-cyan-400 
                      hover:bg-cyan-900/40 hover:border-cyan-400 hover:text-white 
                      hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] hover:scale-110
                      active:scale-95
                      transition-all duration-300 ease-in-out z-20"
            aria-label="上一个产品"
          >
            <FontAwesomeIcon icon={faChevronLeft} size="lg" className="ml-1" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 
                      bg-gray-900/70 backdrop-blur-md rounded-full border border-cyan-500/30 
                      flex items-center justify-center text-cyan-400 
                      hover:bg-cyan-900/40 hover:border-cyan-400 hover:text-white 
                      hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] hover:scale-110
                      active:scale-95
                      transition-all duration-300 ease-in-out z-20"
            aria-label="下一个产品"
          >
            <FontAwesomeIcon icon={faChevronRight} size="lg" className="mr-1" />
          </button>

          {/* 指示器 */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-20">
            {products.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className="w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 relative group"
                aria-label={`查看产品${idx+1}`}
              >
                <span className={`absolute inset-0 rounded-full ${idx === currentIndex 
                  ? 'bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)] scale-100' 
                  : 'bg-gray-700/50 group-hover:bg-gray-500/70 scale-80'}`}></span>
                
                {idx === currentIndex && (
                  <>
                    <span className="absolute inset-0 bg-white animate-ping rounded-full opacity-30"></span>
                    <span className="absolute inset-1/2 w-1 h-1 bg-cyan-300 rounded-full animate-pulse"></span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 新增：产品核心特性展示区 */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              核心产品特性
            </h3>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <div 
                key={product.id}
                className="bg-gray-900/40 backdrop-blur-sm rounded-xl border border-cyan-500/10 p-6 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-900/40 to-blue-900/40 flex items-center justify-center border border-cyan-500/20 mb-4 group-hover:border-cyan-400/50 transition-all">
                  <FontAwesomeIcon icon={product.icon} className="text-cyan-400 text-2xl" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">{product.name}</h4>
                <ul className="space-y-2 mb-4">
                  {product.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faStar} className="text-cyan-400 text-xs mt-1 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-4 border-t border-gray-800">
                  <div className="flex flex-wrap gap-2">
                    {product.scenarios.slice(0, 2).map((scenario, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-800/60 text-gray-300 text-xs rounded-md">
                        {scenario}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 新增：核心技术优势 */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              核心技术优势
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              以自主研发的核心技术为基础，打造高性能、高稳定、高智能的机器人产品
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreTechnologies.map((tech, idx) => (
              <div 
                key={idx}
                className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-sm rounded-xl border border-cyan-500/10 p-6 hover:border-cyan-500/30 hover:shadow-[0_0_25px_rgba(0,255,255,0.08)] transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-900/30 to-blue-900/30 flex items-center justify-center border border-cyan-500/20 mb-6">
                  <FontAwesomeIcon icon={tech.icon} className="text-cyan-400 text-2xl" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">{tech.title}</h4>
                <p className="text-gray-300 text-sm">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}