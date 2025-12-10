'use client';
import Image from 'next/image';
import { useEffect, useRef, useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, faRobot, faGraduationCap, 
  faBroom, faShieldAlt, faMapMarkerAlt,
  faChevronDown, faChevronUp
} from '@fortawesome/free-solid-svg-icons';

// 案例数据类型定义
interface CaseItem {
  id: number;
  name: string;
  category: string;
  categoryName: string;
  image: string;
  description: string;
  highlight: string[]; // 案例亮点
  client: string; // 客户名称
  delay: string;
}

// 筛选选项类型
interface FilterOption {
  value: string;
  label: string;
  icon: any; // 分类图标
}

// 机器人案例数据（每个分类4个案例，总计20个）
const cases: CaseItem[] = [
 

  // 教育智能机器人 (4个)
  {
    id: 5,
    name: '中小学智能教育机器人教室',
    category: 'education',
    categoryName: '教育智能机器人',
    image: '/images/edurobot/case1.png',
    description: '为某重点小学打造智能机器人教室，配备30台教育智能机器人，支持互动教学、编程学习和AI问答，学生编程兴趣提升65%',
    highlight: ['AI智能问答', '图形化编程', '多学科适配', '学情数据分析'],
    client: '某市教育局装备中心',
    delay: '0.4s'
  },
  {
    id: 6,
    name: '职业院校机器人教学实训基地',
    category: 'education',
    categoryName: '教育智能机器人',
    image: '/images/edurobot/case2.png',
    description: '为某职业院校建设机器人教学实训基地，配备40台教育智能机器人，覆盖编程、控制、维护全流程教学，实训效率提升70%',
    highlight: ['多人协作学习', '故障模拟训练', '校企课程共建', '证书考核适配'],
    client: '某职业技术学院',
    delay: '0.5s'
  },
  {
    id: 7,
    name: '少儿编程教育机器人实验室',
    category: 'education',
    categoryName: '教育智能机器人',
    image: '/images/edurobot/case3.png',
    description: '为某青少年活动中心打造编程教育机器人实验室，配备50台入门级编程机器人，覆盖8-16岁年龄段，学员续课率提升45%',
    highlight: ['趣味化编程', '分级教学', '作品展示', '家长监控'],
    client: '某青少年科技教育机构',
    delay: '0.6s'
  },
  {
    id: 8,
    name: '特殊教育智能陪伴机器人',
    category: 'education',
    categoryName: '教育智能机器人',
    image: '/images/edurobot/case4.png',
    description: '为某特殊教育学校定制15台智能陪伴机器人，具备情绪识别和个性化教学功能，特殊儿童学习参与度提升60%',
    highlight: ['情绪识别', '个性化教学', '语音安抚', '数据记录'],
    client: '某特殊教育学校',
    delay: '0.7s'
  },

  // 商用清洁机器人 (4个)
  {
    id: 9,
    name: '大型商场智能清洁机器人系统',
    category: 'cleaning',
    categoryName: '商用清洁机器人',
    image: '/images/cleanrobot/case1.png',
    description: '为全国连锁商场部署50台商用清洁机器人，具备SLAM自主导航和多模式清洁功能，夜间无人清洁覆盖率达100%，人力成本降低50%',
    highlight: ['激光自主导航', '多模式清洁', '远程监控', '12小时续航'],
    client: '某商业综合体管理集团',
    delay: '0.8s'
  },
  {
    id: 10,
    name: '机场智能清洁解决方案',
    category: 'cleaning',
    categoryName: '商用清洁机器人',
    image: '/images/cleanrobot/case2.png',
    description: '为某机场部署60台商用清洁机器人，分区域智能调度，实现航站楼全覆盖清洁，清洁效率提升3倍，能耗降低20%',
    highlight: ['机场专用导航', '油污深度清洁', '航班信息联动', '自动充电'],
    client: '某国际机场运营公司',
    delay: '0.9s'
  },
  {
    id: 11,
    name: '高铁站智能清洁机器人',
    category: 'cleaning',
    categoryName: '商用清洁机器人',
    image: '/images/cleanrobot/case3.png',
    description: '为某大型高铁站部署40台智能清洁机器人，适配高铁到站高峰时段的快速清洁需求，候车区清洁效率提升2.5倍',
    highlight: ['高峰时段适配', '快速清洁模式', '人流避让', '垃圾识别'],
    client: '某铁路运营公司',
    delay: '1.0s'
  },
  {
    id: 12,
    name: '写字楼智能清洁机器人',
    category: 'cleaning',
    categoryName: '商用清洁机器人',
    image: '/images/cleanrobot/case4.png',
    description: '为某甲级写字楼部署25台智能清洁机器人，夜间集中清洁办公区域，白天定点清洁公共区域，清洁成本降低35%',
    highlight: ['静音设计', '分时段清洁', '地毯专用模式', '智能调度'],
    client: '某写字楼物业管理公司',
    delay: '1.1s'
  },

  // 安保巡检机器人 (4个)
  {
    id: 13,
    name: '工业园区安保巡检机器人',
    category: 'security',
    categoryName: '安保巡检机器人',
    image: '/images/securityrobot/case1.png',
    description: '为某工业园区部署15台安保巡检机器人，配备高清摄像头和智能识别系统，24小时不间断巡逻，安全隐患响应时间缩短至3分钟',
    highlight: ['红外热成像', '智能语音告警', '人脸识别', '防入侵检测'],
    client: '某智能制造产业园',
    delay: '1.2s'
  },
  {
    id: 14,
    name: '智慧社区安保巡检机器人',
    category: 'security',
    categoryName: '安保巡检机器人',
    image: '/images/securityrobot/case2.png',
    description: '为某高端智慧社区部署20台安保巡检机器人，覆盖社区公共区域和停车场，安全事件发生率降低40%，业主满意度提升85%',
    highlight: ['车牌识别', '陌生人预警', '紧急呼叫', 'APP联动'],
    client: '某智慧社区运营公司',
    delay: '1.3s'
  },
  {
    id: 15,
    name: '大型厂区防爆巡检机器人',
    category: 'security',
    categoryName: '安保巡检机器人',
    image: '/images/securityrobot/case3.png',
    description: '为某化工园区部署8台防爆型安保巡检机器人，适应易燃易爆环境，实现危险区域无人巡检，安全事故率降为0',
    highlight: ['防爆设计', '气体检测', '远程操控', '耐高温'],
    client: '某化工集团',
    delay: '1.4s'
  },
  {
    id: 16,
    name: '仓储园区安保巡检机器人',
    category: 'security',
    categoryName: '安保巡检机器人',
    image: '/images/securityrobot/case4.png',
    description: '为某大型仓储园区部署30台安保巡检机器人，实现仓库外围和内部通道全覆盖巡检，货物丢失率降低90%',
    highlight: ['夜视功能', '物品识别', '路径优化', '集群管理'],
    client: '某物流仓储公司',
    delay: '1.5s'
  },

  // 展厅导览机器人 (4个)
  {
    id: 17,
    name: '博物馆智能导览机器人',
    category: 'guide',
    categoryName: '展厅导览机器人',
    image: '/images/guiderobot/case1.png',
    description: '为某博物馆定制8台展厅导览机器人，提供多语种语音讲解、智能路径规划和互动问答，游客停留时间增加35%，讲解满意度达98%',
    highlight: ['多语种讲解', 'AR互动展示', '智能避障', '客流分析'],
    client: '某省级博物馆',
    delay: '1.6s'
  },
  {
    id: 18,
    name: '科技馆智能导览机器人',
    category: 'guide',
    categoryName: '展厅导览机器人',
    image: '/images/guiderobot/case2.png',
    description: '为某科技馆定制12台智能导览机器人，结合展品特点提供互动式讲解，青少年游客参与度提升50%，科普效果显著增强',
    highlight: ['互动实验讲解', '科学知识问答', '展品联动', '趣味引导'],
    client: '某省级科技馆',
    delay: '1.7s'
  },
  {
    id: 19,
    name: '企业展厅智能导览机器人',
    category: 'guide',
    categoryName: '展厅导览机器人',
    image: '/images/guiderobot/case3.png',
    description: '为某公司企业展厅部署6台智能导览机器人，提供企业历程、产品介绍、技术优势等讲解服务，接待效率提升70%',
    highlight: ['定制化内容', '数据实时更新', '客户信息收集', '多终端联动'],
    client: '某上市公司品牌部',
    delay: '1.8s'
  },
  {
    id: 20,
    name: '文旅小镇智能导览机器人',
    category: 'guide',
    categoryName: '展厅导览机器人',
    image: '/images/guiderobot/case4.png',
    description: '为某文旅特色小镇部署15台户外型导览机器人，提供景点讲解、路径指引、特色推荐等服务，游客体验评分提升80%',
    highlight: ['户外防水', 'GPS导航', '方言讲解', '商户联动'],
    client: '某文旅小镇运营公司',
    delay: '1.9s'
  },
 // 人形表演机器人 (4个)
  {
    id: 1,
    name: '文旅景区人形表演机器人',
    category: 'performance',
    categoryName: '人形表演机器人',
    image: '/images/manrobot/case1.png',
    description: '为某5A级文旅景区部署10台人形表演机器人，搭载精准律动控制与仿生关节设计，每日完成8场主题舞蹈表演，游客体验评分提升40%',
    highlight: ['16自由度仿生关节', '多机协同编队', '自定义动作编程', '8小时续航'],
    client: '某文旅景区运营公司',
    delay: '0s'
  },
  {
    id: 2,
    name: '主题乐园人形机器人互动表演',
    category: 'performance',
    categoryName: '人形表演机器人',
    image:  '/images/manrobot/case2.png',
    description: '为某主题乐园定制20台定制化人形表演机器人，结合乐园IP打造专属舞蹈和互动节目，节假日游客接待量提升25%',
    highlight: ['IP定制动作', '观众互动感应', '防水防尘设计', '快速换装'],
    client: '某主题乐园集团',
    delay: '0.1s'
  },
  {
    id: 3,
    name: '商业综合体人形迎宾表演机器人',
    category: 'performance',
    categoryName: '人形表演机器人',
    image: '/images/manrobot/case3.png',
    description: '为某高端商业综合体部署8台人形迎宾表演机器人，兼具迎宾接待和小型舞台表演功能，商场人气提升30%',
    highlight: ['语音交互迎宾', '场景化表演', '客流引导', '自动充电'],
    client: '某商业地产集团',
    delay: '0.2s'
  },
  {
    id: 4,
    name: '大型展会人形表演机器人',
    category: 'performance',
    categoryName: '人形表演机器人',
    image: '/images/manrobot/case4.png',
    description: '为某科技展会定制6台人形表演机器人，展示前沿机器人技术，吸引观展人数提升50%，品牌曝光度显著增加',
    highlight: ['科技感动作编排', '多语言解说', '展台引流', '远程控制'],
    client: '某会展服务公司',
    delay: '0.3s'
  }
];

// 筛选选项（对应5类机器人）
const filters: FilterOption[] = [
  { value: 'cleaning', label: '商用清洁机器人', icon: faBroom },
  { value: 'security', label: '安保巡检机器人', icon: faShieldAlt },
  { value: 'education', label: '教育智能机器人', icon: faGraduationCap },
  { value: 'guide', label: '展厅导览机器人', icon: faMapMarkerAlt },
  { value: 'performance', label: '人形表演机器人', icon: faRobot },
 { value: 'all', label: '全部案例', icon: faCheckCircle }
];

export default function Cases() {
  const casesRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredCases, setFilteredCases] = useState<CaseItem[]>(cases);
  const [isExpanded, setIsExpanded] = useState(false); // 展开/收起状态

  // 计算需要展示的案例：默认展示4个，展开显示全部
  const displayCases = useMemo(() => {
    // 非全部分类或已展开：显示全部筛选结果
    if (activeFilter !== 'all' || isExpanded) {
      return filteredCases;
    }
    // 全部分类且未展开：只显示前4个
    return filteredCases.slice(0, 4);
  }, [filteredCases, activeFilter, isExpanded]);

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

    if (casesRef.current) {
      const elements = casesRef.current.querySelectorAll('.animate-on-scroll');
      elements.forEach((el) => observer.observe(el));
    }

    return () => {
      if (casesRef.current) {
        const elements = casesRef.current.querySelectorAll('.animate-on-scroll');
        elements.forEach((el) => observer.unobserve(el));
      }
    };
  }, []);

  // 筛选案例（切换筛选时重置展开状态）
  const handleFilterChange = (filterValue: string) => {
    setActiveFilter(filterValue);
    setIsExpanded(false); // 切换分类时自动收起
    
    if (filterValue === 'all') {
      setFilteredCases(cases);
    } else {
      setFilteredCases(cases.filter(caseItem => caseItem.category === filterValue));
    }
    
    // 重新触发动画
    setTimeout(() => {
      const caseElements = document.querySelectorAll('.case-item .animate-on-scroll');
      caseElements.forEach(el => {
        el.classList.remove('visible');
        setTimeout(() => el.classList.add('visible'), 100);
      });
    }, 10);
  };

  // 切换展开/收起状态
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    
    // 展开后重新触发动画
    if (!isExpanded) {
      setTimeout(() => {
        const caseElements = document.querySelectorAll('.case-item .animate-on-scroll');
        caseElements.forEach(el => {
          el.classList.remove('visible');
          setTimeout(() => el.classList.add('visible'), 100);
        });
      }, 100);
    }
  };

  return (
    <section 
      id="cases" 
      className="py-20 bg-dark bg-secondary relative overflow-hidden" 
      ref={casesRef}
    >
      {/* 科技感背景装饰 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-1/4 left-1/5 w-80 h-80 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/5 w-80 h-80 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-transparent to-gray-950"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 标题区域 */}
        <div className="text-center max-w-4xl mx-auto mb-16 animate-on-scroll">
          <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
            智能机器人应用场景
          </h2>
          
          <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
            人形表演、教育智能、商用清洁、安保巡检、展厅导览机器人<br/>
            已成功应用于文旅、教育、商业、园区、展馆等多个场景
          </p>
          
          {/* 科技感分割线 */}
          <div className="mt-2 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-cyan-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-cyan-500/50"></div>
          </div>
        </div>
        
        {/* 筛选按钮 */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-on-scroll">
          {filters.map((filter) => (
            <button
              key={filter.value}
              className={`case-filter px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeFilter === filter.value
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                  : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800/70 border border-cyan-500/10 hover:border-cyan-500/20'
              }`}
              data-filter={filter.value}
              onClick={() => handleFilterChange(filter.value)}
            >
              <FontAwesomeIcon icon={filter.icon} className="text-xs" />
              {filter.label}
            </button>
          ))}
        </div>
        
        {/* 案例卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {displayCases.map((caseItem) => (
            <div 
              key={caseItem.id}
              className="case-item group"
              data-category={caseItem.category}
            >
              <div 
                className="bg-gray-900/30 backdrop-blur-sm rounded-xl overflow-hidden border border-cyan-500/10 shadow-[0_0_30px_rgba(0,255,255,0.05)] hover:shadow-[0_0_40px_rgba(0,255,255,0.1)] transition-all duration-500 transform hover:-translate-y-3 animate-on-scroll"
                style={{ transitionDelay: caseItem.delay }}
              >
                {/* 案例图片 - 已移除分类标签 */}
                <div className="relative h-48 overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image 
                      src={caseItem.image} 
                      alt={caseItem.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      style={{ filter: 'sepia(5%) brightness(90%) contrast(105%)' }}
                    />
                  </div>
                  {/* 渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent mix-blend-overlay"></div>
                  {/* 网格纹理 */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                </div>
                
                {/* 案例内容 */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 group-hover:from-cyan-400 group-hover:to-blue-400 transition-all">
                    {caseItem.name}
                  </h3>
                  
                  {/* 案例亮点 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {caseItem.highlight.map((item, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-800/60 text-cyan-300 text-xs rounded-md">
                        {item}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {caseItem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 展开/收起按钮（仅全部案例时显示，移至案例下方） */}
        {activeFilter === 'all' && (
          <div className="text-center animate-on-scroll">
            <button
              onClick={toggleExpand}
              className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 mx-auto bg-gray-900/50 text-cyan-400 hover:bg-cyan-900/30 border border-cyan-500/20"
            >
              {isExpanded ? (
                <>
                  收起全部 <FontAwesomeIcon icon={faChevronUp} className="text-xs" />
                </>
              ) : (
                <>
                  展开全部案例 <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}