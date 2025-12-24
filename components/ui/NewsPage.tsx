'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image'; // 导入Next.js图片组件
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt, faChevronRight,
  faArrowUp, faTimes, faChevronLeft, faChevronRight as faChevronRightIcon
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { FrontendNewsItem as NewsItem } from '../../lib/feishu-service';
import LoadingAnimation from './LoadingAnimation'; // 导入科技感加载动画组件

// 类型定义增强（添加缺失的类型）
interface NewsDetailItem {
  image: string; 
  text: string; 
  type?: 'image' | 'content' | 'video';
}

// 模糊占位符base64（优化图片加载体验）
const BLUR_PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJ5gMm5/gAAAABJRU5ErkJggg==';

// 媒体加载状态管理（使用Map存储不同媒体的加载状态）
interface MediaLoadingState {
  [key: string]: boolean;
}

interface NewsPageProps {
  initialNewsData: NewsItem[];
}

export default function NewsPage({ initialNewsData }: NewsPageProps) {
  // 状态定义
  const [currentTopNewsIndex, setCurrentTopNewsIndex] = useState(0);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [loading, setLoading] = useState(false); // 不再需要加载状态，因为数据在服务器端获取
  const [newsData, setNewsData] = useState<NewsItem[]>(initialNewsData);
  const [mediaLoading, setMediaLoading] = useState<MediaLoadingState>({}); // 媒体加载状态
  
  // Ref定义
  const backToTopRef = useRef<HTMLButtonElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const detailModalRef = useRef<HTMLDivElement>(null);
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null); // 用ref存储interval，避免闭包问题

  // 分离置顶/普通新闻
  const topNewsList = [...newsData].filter(item => item.is_top).sort((a, b) => 
    new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
  );
  const normalNewsList = [...newsData].filter(item => !item.is_top).sort((a, b) => 
    new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
  );

  // 不再需要客户端数据获取，数据已从服务器端获取

  // 轮播逻辑（修复内存泄漏）
  useEffect(() => {
    if (topNewsList.length <= 1) return;
    
    // 启动轮播
    const startCarousel = () => {
      carouselIntervalRef.current = setInterval(() => {
        if (!isHovering) {
          setCurrentTopNewsIndex(prev => (prev + 1) % topNewsList.length);
        }
      }, 5000);
    };
    
    startCarousel();
    
    // 组件卸载时清除定时器
    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, [isHovering, topNewsList.length]);

  // 回到顶部按钮逻辑
  useEffect(() => {
    const handleScroll = () => {
      if (!backToTopRef.current) return;
      
      if (window.scrollY > 300) {
        backToTopRef.current.classList.remove('opacity-0', 'pointer-events-none');
        backToTopRef.current.classList.add('opacity-100');
      } else {
        backToTopRef.current.classList.add('opacity-0', 'pointer-events-none');
        backToTopRef.current.classList.remove('opacity-100');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 详情弹窗滚动控制
  useEffect(() => {
    if (showDetail) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showDetail]);

  // 轮播控制方法
  const handleCarouselPrev = () => {
    setCurrentTopNewsIndex(prev => (prev - 1 + topNewsList.length) % topNewsList.length);
    // 重置定时器
    if (carouselIntervalRef.current) clearInterval(carouselIntervalRef.current);
    carouselIntervalRef.current = setInterval(() => {
      if (!isHovering) {
        setCurrentTopNewsIndex(prev => (prev + 1) % topNewsList.length);
      }
    }, 5000);
  };
  
  const handleCarouselNext = () => {
    setCurrentTopNewsIndex(prev => (prev + 1) % topNewsList.length);
    // 重置定时器
    if (carouselIntervalRef.current) clearInterval(carouselIntervalRef.current);
    carouselIntervalRef.current = setInterval(() => {
      if (!isHovering) {
        setCurrentTopNewsIndex(prev => (prev + 1) % topNewsList.length);
      }
    }, 5000);
  };

  const handleIndicatorClick = (index: number) => {
    setCurrentTopNewsIndex(index);
    // 重置定时器
    if (carouselIntervalRef.current) clearInterval(carouselIntervalRef.current);
    carouselIntervalRef.current = setInterval(() => {
      if (!isHovering) {
        setCurrentTopNewsIndex(prev => (prev + 1) % topNewsList.length);
      }
    }, 5000);
  };

  // 工具方法
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewNewsDetail = (news: NewsItem) => {
    setSelectedNews(news);
    setShowDetail(true);
    scrollToTop();
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedNews(null);
  };



  const getNewsImageUrl = (news: NewsItem) => {
    // 确保只有有效的图片类型URL且非空值才会被返回
    return news.cover_type === 'image' && news.cover_image ? news.cover_image : '';
  };

  const getNewsVideoUrl = (news: NewsItem) => {
    // 确保只有有效的视频类型URL且非空值才会被返回
    return news.cover_type === 'video' && news.cover_image ? news.cover_image : '';
  };

  // 图片加载错误处理（适配Next/Image）
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.closest('.image-container');
    if (parent) {
      // 清除加载状态
      const mediaUrl = img.getAttribute('src') || '';
      if (mediaUrl) {
        setMediaLoading(prev => ({ ...prev, [mediaUrl]: false }));
      }
      parent.innerHTML = `
        <div class="w-full h-full bg-gray-800 flex items-center justify-center">
          <p class="text-gray-500 text-lg">图片加载失败</p>
        </div>
      `;
    }
  };

  // 媒体加载完成处理
  const handleMediaLoad = (mediaUrl: string) => {
    setMediaLoading(prev => ({ ...prev, [mediaUrl]: false }));
  };

  // 开始加载媒体
  const startMediaLoading = (mediaUrl: string) => {
    if (!mediaLoading[mediaUrl]) {
      setMediaLoading(prev => ({ ...prev, [mediaUrl]: true }));
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <section className="py-20 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-cyan-400 text-xl">加载资讯数据中...</p>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="news" 
      className="py-20 bg-gray-900 relative overflow-hidden min-h-screen"
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-1/4 left-1/5 w-80 h-80 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/5 w-80 h-80 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-transparent to-gray-950"></div>
      </div>

      {/* 回到顶部按钮 */}
      <button
        ref={backToTopRef}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-cyan-900/70 backdrop-blur-md rounded-full border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-800/90 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] transition-all duration-300 ease-in-out z-50 opacity-0 pointer-events-none"
        aria-label="回到顶部"
      >
        <FontAwesomeIcon icon={faArrowUp} size="lg" />
      </button>

      {/* 主内容容器 */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 标题区域 */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
            公司资讯
          </h2>
          
          <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
            关注森诺智联最新动态，了解智能机器人行业前沿资讯<br/>
            见证技术创新与行业发展的每一步
          </p>
          
          <div className="mt-2 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-cyan-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-cyan-500/50"></div>
          </div>
        </div>

        {/* 置顶新闻轮播 */}
        {topNewsList.length > 0 && (
          <div 
            className="mb-16 rounded-xl overflow-hidden relative" 
            ref={carouselRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div 
              className="relative h-[clamp(280px,50vw,500px)] overflow-hidden"
            >
              <div 
                className="flex h-full transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentTopNewsIndex * 100}%)`,
                }}
              >
                {topNewsList.map((news) => (
                  <div 
                    key={news.id}
                    className="min-w-full h-full relative"
                  >
                    {/* 轮播图片或视频 */}
                    <div className="image-container w-full h-full relative">
                      {(getNewsImageUrl(news) || getNewsVideoUrl(news)) ? (
                        news.cover_type === 'video' ? (
                          <>
                            {/* 视频加载动画 */}
                            {mediaLoading[getNewsVideoUrl(news)] && (
                              <div className="absolute inset-0 bg-dark/80 flex items-center justify-center z-10">
                                <LoadingAnimation size="lg" color="cyan-500" />
                              </div>
                            )}
                            <video
                              src={getNewsVideoUrl(news)}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="absolute inset-0 w-full h-full object-cover"
                              style={{ filter: 'sepia(5%) brightness(85%) contrast(105%)' }}
                              onLoadStart={() => startMediaLoading(getNewsVideoUrl(news))}
                              onLoadedData={() => handleMediaLoad(getNewsVideoUrl(news))}
                              onError={(e) => {
                                console.error('视频加载失败:', e);
                                handleMediaLoad(getNewsVideoUrl(news));
                              }}
                            >
                              您的浏览器不支持视频播放。
                            </video>
                          </>
                        ) : (
                          getNewsImageUrl(news) && !getNewsImageUrl(news).includes('__video__') && (
                            <>
                              {/* 图片加载动画 */}
                              {mediaLoading[getNewsImageUrl(news)] && (
                                <div className="absolute inset-0 bg-dark/80 flex items-center justify-center z-10">
                                  <LoadingAnimation size="lg" color="cyan-500" />
                                </div>
                              )}
                              <Image
                                src={getNewsImageUrl(news)}
                                alt={news.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                                placeholder="blur"
                                blurDataURL={BLUR_PLACEHOLDER}
                                className="object-cover"
                                style={{ filter: 'sepia(5%) brightness(85%) contrast(105%)' }}
                                onError={handleImageError}
                                priority // 首屏轮播图优先加载
                                onLoadStart={() => startMediaLoading(getNewsImageUrl(news))}
                                onLoad={() => handleMediaLoad(getNewsImageUrl(news))}
                              />
                            </>
                          )
                        )
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <p className="text-gray-500 text-lg">暂无图片</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent mix-blend-overlay"></div>
                    
                    {/* 置顶标记已移除 */}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                      <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-3 text-sm text-cyan-300">
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
                            {news.publish_date || '暂无日期'}
                          </span>
                        </div>
                        
                        {/* 标签展示 */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {news.tags.length > 0 ? (
                            news.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-800/60 text-cyan-300 text-xs rounded-md">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-1 bg-gray-800/60 text-gray-400 text-xs rounded-md">
                              无标签
                            </span>
                          )}
                          {news.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-800/60 text-gray-400 text-xs rounded-md">
                              +{news.tags.length - 3}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
                          {news.title || '暂无标题'}
                        </h3>
                        
                        <p className="text-lg text-gray-200 mb-6 line-clamp-2 md:line-clamp-3 max-w-3xl">
                          {news.summary || '暂无摘要'}
                        </p>
                        
                        <button 
                          onClick={() => viewNewsDetail(news)}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all flex items-center gap-2 w-fit"
                        >
                          查看详情
                          <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 轮播控制按钮 */}
            {topNewsList.length > 1 && (
              <>
                <button
                  onClick={handleCarouselPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-cyan-900/70 transition-all z-10"
                  aria-label="上一条"
                >
                  <FontAwesomeIcon icon={faChevronLeft} size="lg" />
                </button>
                <button
                  onClick={handleCarouselNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-cyan-900/70 transition-all z-10"
                  aria-label="下一条"
                >
                  <FontAwesomeIcon icon={faChevronRightIcon} size="lg" />
                </button>
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {topNewsList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleIndicatorClick(idx)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        idx === currentTopNewsIndex 
                          ? 'bg-cyan-400 w-8' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`切换到第${idx+1}条置顶新闻`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 普通新闻列表 */}
        {normalNewsList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {normalNewsList.map((news) => (
              <div 
                key={news.id}
                className="bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden border border-cyan-500/10 shadow-[0_0_30px_rgba(0,255,255,0.05)] hover:shadow-[0_0_40px_rgba(0,255,255,0.1)] hover:border-cyan-500/20 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col"
                onClick={() => viewNewsDetail(news)}
              >
                {/* 新闻封面图或视频 */}
                <div className="image-container relative h-48 overflow-hidden">
                  {(getNewsImageUrl(news) || getNewsVideoUrl(news)) ? (
                    news.cover_type === 'video' ? (
                      <>
                        {/* 视频加载动画 */}
                        {mediaLoading[getNewsVideoUrl(news)] && (
                          <div className="absolute inset-0 bg-dark/80 flex items-center justify-center z-10">
                            <LoadingAnimation size="md" color="cyan-500" />
                          </div>
                        )}
                        <video
                          src={getNewsVideoUrl(news)}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                          style={{ filter: 'sepia(5%) brightness(90%) contrast(105%)' }}
                          onLoadStart={() => startMediaLoading(getNewsVideoUrl(news))}
                          onLoadedData={() => handleMediaLoad(getNewsVideoUrl(news))}
                          onError={(e) => {
                            console.error('视频加载失败:', e);
                            handleMediaLoad(getNewsVideoUrl(news));
                          }}
                        >
                          您的浏览器不支持视频播放。
                        </video>
                      </>
                    ) : (
                        getNewsImageUrl(news) && !getNewsImageUrl(news).includes('__video__') && (
                          <>
                            {/* 图片加载动画 */}
                            {mediaLoading[getNewsImageUrl(news)] && (
                              <div className="absolute inset-0 bg-dark/80 flex items-center justify-center z-10">
                                <LoadingAnimation size="md" color="cyan-500" />
                              </div>
                            )}
                            <Image
                              src={getNewsImageUrl(news)}
                              alt={news.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              placeholder="blur"
                              blurDataURL={BLUR_PLACEHOLDER}
                              className="object-cover transition-transform duration-700 hover:scale-110"
                              style={{ filter: 'sepia(5%) brightness(90%) contrast(105%)' }}
                              loading="lazy"
                              onError={handleImageError}
                              onLoadStart={() => startMediaLoading(getNewsImageUrl(news))}
                              onLoad={() => handleMediaLoad(getNewsImageUrl(news))}
                            />
                          </>
                        )
                    )
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <p className="text-gray-500">暂无图片</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent mix-blend-overlay"></div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-cyan-500" />
                      {news.publish_date || '暂无日期'}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-white hover:text-cyan-300 transition-colors">
                    {news.title || '暂无标题'}
                  </h3>
                  
                  <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">
                    {news.summary || '暂无摘要'}
                  </p>
                  
                  {/* 标签展示 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {news.tags.length > 0 ? (
                      news.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-800/60 text-cyan-300 text-xs rounded-md">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-1 bg-gray-800/60 text-gray-400 text-xs rounded-md">
                        无标签
                      </span>
                    )}
                    {news.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-800/60 text-gray-400 text-xs rounded-md">
                        +{news.tags.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-auto">
                    <button className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
                      查看详情
                      <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-xl">暂无普通资讯数据</p>
          </div>
        )}

        {/* 空数据提示 */}
        {newsData.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-2xl mb-4">暂无任何资讯数据</p>
            <p className="text-gray-500">请检查飞书多维表格配置或数据</p>
          </div>
        )}
      </div>

      {/* 新闻详情弹窗 */}
      {showDetail && selectedNews && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 md:p-8">
          <div 
            ref={detailModalRef}
            className="bg-gray-900/98 backdrop-blur-md border border-cyan-500/20 shadow-[0_0_80px_rgba(0,255,255,0.3)] w-full max-w-6xl min-h-[90vh] md:min-h-[80vh] rounded-xl overflow-hidden transform transition-all duration-300 ease-out scale-100"
          >
            {/* 关闭按钮 */}
            <button
              onClick={closeDetail}
              className="absolute top-6 right-6 w-12 h-12 bg-gray-800/80 text-gray-300 hover:bg-red-900/70 hover:text-white rounded-full flex items-center justify-center transition-all z-30 border border-gray-700/50"
              aria-label="关闭详情"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
            
            {/* 详情头部图片或视频 */}
            <div className="image-container relative h-64 md:h-80 lg:h-96">
              {(getNewsImageUrl(selectedNews) || getNewsVideoUrl(selectedNews)) ? (
                  selectedNews.cover_type === 'video' ? (
                    <>
                      {/* 视频加载动画 */}
                      {mediaLoading[getNewsVideoUrl(selectedNews)] && (
                        <div className="absolute inset-0 bg-dark/80 flex items-center justify-center z-10">
                          <LoadingAnimation size="lg" color="cyan-500" />
                        </div>
                      )}
                      <video
                        src={getNewsVideoUrl(selectedNews)}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: 'sepia(5%) brightness(80%) contrast(105%)' }}
                        onLoadStart={() => startMediaLoading(getNewsVideoUrl(selectedNews))}
                        onLoadedData={() => handleMediaLoad(getNewsVideoUrl(selectedNews))}
                        onError={(e) => {
                          console.error('视频加载失败:', e);
                          handleMediaLoad(getNewsVideoUrl(selectedNews));
                        }}
                      >
                        您的浏览器不支持视频播放。
                      </video>
                    </>
                  ) : (
                    getNewsImageUrl(selectedNews) && !getNewsImageUrl(selectedNews).includes('__video__') && (
                      <>
                        {/* 图片加载动画 */}
                        {mediaLoading[getNewsImageUrl(selectedNews)] && (
                          <div className="absolute inset-0 bg-dark/80 flex items-center justify-center z-10">
                            <LoadingAnimation size="lg" color="cyan-500" />
                          </div>
                        )}
                        <Image
                          src={getNewsImageUrl(selectedNews)}
                          alt={selectedNews.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                          placeholder="blur"
                          blurDataURL={BLUR_PLACEHOLDER}
                          className="object-cover"
                          style={{ filter: 'sepia(5%) brightness(80%) contrast(105%)' }}
                          loading="eager"
                          onError={handleImageError}
                          onLoadStart={() => startMediaLoading(getNewsImageUrl(selectedNews))}
                          onLoad={() => handleMediaLoad(getNewsImageUrl(selectedNews))}
                        />
                      </>
                    )
                  )
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <p className="text-gray-500 text-xl">暂无图片</p>
                  </div>
                )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent mix-blend-overlay"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12">
                <div className="max-w-5xl mx-auto">
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-sm md:text-base text-cyan-300">
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-sm" />
                      {selectedNews.publish_date || '暂无日期'}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                    {selectedNews.title || '暂无标题'}
                  </h3>
                </div>
              </div>
            </div>
            
            {/* 详情内容 */}
            <div className="p-6 md:p-8 lg:p-12 max-w-5xl mx-auto">
              {/* 标签 */}
              <div className="flex flex-wrap gap-3 mb-8">
                {selectedNews.tags.length > 0 ? (
                  selectedNews.tags.map((tag, idx) => (
                    <span key={idx} className="px-4 py-2 bg-gray-800/60 text-cyan-300 text-sm rounded-full border border-gray-700/50 backdrop-blur-sm">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="px-4 py-2 bg-gray-800/60 text-gray-400 text-sm rounded-full border border-gray-700/50 backdrop-blur-sm">
                    无标签
                  </span>
                )}
              </div>
              
              {/* 正文内容 */}
              <div className="prose prose-invert max-w-none text-gray-200 text-lg md:text-xl leading-relaxed">
                <p className="text-xl md:text-2xl mb-8 text-gray-300 font-light">{selectedNews.summary || '暂无摘要'}</p>
                
                <div className="space-y-10 text-base md:text-lg leading-relaxed">
                  {selectedNews.details.length > 0 ? (
                    selectedNews.details.map((detail, idx) => (
                      <div key={idx} className="space-y-4">
                        {/* 详情媒体（图片或视频） */}
                        {detail.image && (
                          <div className="image-container rounded-xl overflow-hidden shadow-lg relative aspect-video">
                            {/* 媒体加载动画 */}
                            {mediaLoading[detail.image] && (
                              <div className="absolute inset-0 bg-dark/80 flex items-center justify-center z-10">
                                <LoadingAnimation size="lg" color="cyan-500" />
                              </div>
                            )}
                            {/* 根据媒体类型显示视频或图片 */}
                            {detail.type === 'video' ? (
                              <video
                                src={detail.image}
                                controls
                                autoPlay={false}
                                muted={false}
                                className="absolute inset-0 w-full h-full object-cover"
                                onLoadStart={() => startMediaLoading(detail.image)}
                                onLoadedData={() => handleMediaLoad(detail.image)}
                                onError={(e) => {
                                  console.error('视频加载失败:', e);
                                  handleMediaLoad(detail.image);
                                }}
                              >
                                您的浏览器不支持视频播放。
                              </video>
                            ) : detail.type === 'image' ? (
                              <Image
                                src={detail.image}
                                alt={`详情图片${idx+1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                                placeholder="blur"
                                blurDataURL={BLUR_PLACEHOLDER}
                                className="object-cover"
                                onLoadStart={() => startMediaLoading(detail.image)}
                                onLoadedData={() => handleMediaLoad(detail.image)}
                                onError={(e) => {
                                  handleImageError(e);
                                  handleMediaLoad(detail.image);
                                }}
                              />
                            ) : null}
                          </div>
                        )}
                        
                        {/* 详情文本 */}
                        {detail.text && <p className="text-gray-200">{detail.text}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">暂无正文内容</p>
                  )}
                  
                  <div className="pt-8 mt-8 border-t border-gray-800 text-base text-gray-400">
                    <p>发布时间：{selectedNews.publish_date || '暂无日期'}</p>
                  </div>
                </div>
              </div>
              
              {/* 关闭按钮 */}
              <div className="mt-12 pt-8 border-t border-gray-800 flex justify-end">
                <button
                  onClick={closeDetail}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-900/60 to-blue-900/60 hover:from-cyan-800/80 hover:to-blue-800/80 text-cyan-200 rounded-lg font-medium transition-all flex items-center gap-2 min-w-[120px] justify-center text-lg"
                >
                  关闭详情
                  <FontAwesomeIcon icon={faTimes} className="text-base" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 全局样式 */}
      <style jsx global>{`
        /* 基础样式重置 */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        /* 富文本样式 */
        .prose-invert p {
          color: #e5e7eb !important;
          line-height: 1.8 !important;
        }
        
        /* 文本截断 */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* 滚动条样式 */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        ::-webkit-scrollbar-track {
          background: #1f2937;
        }
        ::-webkit-scrollbar-thumb {
          background: #06b6d4;
          border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #0891b2;
        }
        .modal-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb {
          background: #06b6d4;
          border-radius: 4px;
        }
        
        /* 按钮样式 */
        button {
          cursor: pointer;
          outline: none;
          border: none;
        }
        
        /* 图片容器样式（适配Next/Image） */
        .image-container {
          position: relative !important;
          display: block !important;
        }
      `}</style>
    </section>
  );
}