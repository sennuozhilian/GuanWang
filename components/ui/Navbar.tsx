'use client';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { usePathname, useRouter } from 'next/navigation'; // 新增 useRouter
import LoadingAnimation from './LoadingAnimation';

interface NavLink {
  id: string;
  label: string;
  isPage?: boolean;
}

const SCROLL_THRESHOLD = 50;
const SECTIONS_OFFSET = 100;

// 提前定义导航链接
const navLinks: NavLink[] = [
  { id: 'home', label: '首页' },
  { id: 'about', label: '关于我们' },
  { id: 'products', label: '产品中心' },
  { id: 'cases', label: '应用场景' },
  { id: 'news', label: '公司资讯', isPage: true }, // 目标路由：/news
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [mediaLoading, setMediaLoading] = useState<Record<string, boolean>>({});

  // 媒体加载状态管理
  const startMediaLoading = (mediaUrl: string) => {
    setMediaLoading(prev => ({ ...prev, [mediaUrl]: true }));
  };

  const handleMediaLoad = (mediaUrl: string) => {
    setMediaLoading(prev => ({ ...prev, [mediaUrl]: false }));
  };

  // 初始化logo加载状态
  useEffect(() => {
    startMediaLoading('/images/logo.png');
  }, []);
  const sectionsRef = useRef<NodeListOf<HTMLElement> | null>(null);
  const pathname = usePathname();
  const activeLinkRef = useRef<string | null>(null);
  const router = useRouter(); // 初始化 Next.js 路由

  // 标记客户端hydration完成（简化逻辑，避免禁用按钮）
  useEffect(() => {
    setHydrated(true);
    // 初始化激活态
    const initActiveSection = () => {
      const pageLink = navLinks.find(link => link.isPage && pathname === `/${link.id}`);
      if (pageLink) {
        activeLinkRef.current = pageLink.id;
        setActiveSection(pageLink.id);
        return;
      }
      if (pathname === '/') {
        activeLinkRef.current = 'home';
        setActiveSection('home');
      }
    };
    initActiveSection();
    // 确保页面加载后导航栏可见
    document.getElementById('navbar')?.classList.add('opacity-100', 'translate-y-0');
  }, [pathname]);

  // 滚动监听逻辑（仅首页生效）
  useEffect(() => {
    if (pathname !== '/') return;

    let scrollHandler: (() => void) | null = null;
    const updateScrollActive = () => {
      sectionsRef.current = document.querySelectorAll('section[id]');
      scrollHandler = () => {
        setNavbarScrolled(window.scrollY > SCROLL_THRESHOLD);
        let current = 'home';
        sectionsRef.current?.forEach(section => {
          const sectionTop = section.offsetTop - SECTIONS_OFFSET;
          const sectionHeight = section.offsetHeight;
          if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.id || 'home';
          }
        });
        if (current !== activeSection) {
          activeLinkRef.current = current;
          setActiveSection(current);
        }
      };
      window.addEventListener('scroll', scrollHandler, { passive: true });
      return () => scrollHandler && window.removeEventListener('scroll', scrollHandler);
    };
    updateScrollActive();
    window.addEventListener('popstate', updateScrollActive);
    return () => window.removeEventListener('popstate', updateScrollActive);
  }, [pathname, activeSection]);

  // 锚点跳转逻辑（仅首页生效）
  useEffect(() => {
    if (pathname !== '/' || !window.location.hash) return;
    const hash = window.location.hash.slice(1);
    const element = document.getElementById(hash);
    if (element) {
      setTimeout(() => window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' }), 100);
    }
  }, [pathname]);

  // 修复核心：简化导航点击逻辑，使用 Next.js 路由跳转
  const handleNavClick = (link: NavLink) => {
    // 调试日志（可选，验证点击触发）
    console.log('点击导航：', link);
    
    // 1. 路由页面跳转（如公司资讯 /news）
    if (link.isPage) {
      router.push(`/${link.id}`); // 替换 window.location.href，用 Next.js 路由
      closeMobileMenu();
      return;
    }

    // 2. 首页锚点跳转
    if (pathname === '/') {
      const element = document.getElementById(link.id);
      if (element) {
        window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' });
      }
      closeMobileMenu();
    } else {
      // 非首页跳转到首页锚点
      router.push(`/#${link.id}`);
      closeMobileMenu();
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // 激活态判断
  const getIsActive = (link: NavLink) => {
    if (link.isPage) return pathname === `/${link.id}`;
    return pathname === '/' && activeSection === link.id;
  };

  return (
    <header 
      id="navbar" 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        navbarScrolled ? 'bg-dark/90 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'
      }`}
      role="banner"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button 
            onClick={() => router.push('/')} // 改用路由跳转
            className="flex items-center space-x-2 cursor-pointer"
            aria-label="返回首页"
          >
            <div className="w-10 h-10 relative">
              {/* Logo加载动画 */}
              {mediaLoading['/images/logo.png'] && (
                <div className="absolute inset-0 bg-dark/80 flex items-center justify-center z-10">
                  <LoadingAnimation size="sm" color="cyan-500" />
                </div>
              )}
              <Image 
                src="/images/logo.png" 
                alt="森诺智联Logo" 
                fill 
                sizes="(max-width: 768px) 80px, 100px"
                className="object-contain"
                priority
                onLoadStart={() => startMediaLoading('/images/logo.png')}
                onLoad={() => handleMediaLoad('/images/logo.png')}
                onError={() => handleMediaLoad('/images/logo.png')}
              />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              森诺智联+
            </span>
          </button>
          
          {/* 桌面端导航（确保按钮正常显示） */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="主导航">
            {navLinks.map((link) => {
              const isActive = getIsActive(link);
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link)}
                  className={`font-medium transition-colors nav-link ${isActive ? 'nav-active text-white' : 'text-gray-300 hover:text-primary'}`}
                  aria-current={isActive ? 'page' : undefined}
                  style={{ opacity: 1, visibility: 'visible' }} // 强制显示
                >
                  {link.label}
                </button>
              );
            })}
            <button
              onClick={() => handleNavClick({ id: 'contact', label: '联系我们' })}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all transform hover:scale-105 nav-link no-highlight"
              style={{ opacity: 1, visibility: 'visible' }} // 强制显示
            >
              联系我们
            </button>
          </nav>
          
          {/* 移动端汉堡菜单 */}
          <button
            id="menuBtn"
            className="md:hidden text-white text-2xl focus:outline-none cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={mobileMenuOpen}
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
          </button>
        </div>
      </div>
      
      {/* 移动端导航菜单（移除disabled） */}
      <div 
        id="mobileMenu" 
        className={`md:hidden absolute top-full left-0 right-0 z-40 w-full bg-secondary shadow-lg transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        role="navigation"
        aria-label="移动导航"
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-5">
          {navLinks.map((link) => {
            const isActive = getIsActive(link);
            return (
              <button
                key={link.id}
                onClick={() => {
                  handleNavClick(link);
                  closeMobileMenu();
                }}
                className={`font-medium py-3 border-b border-gray-700 nav-link transition-colors ${
                  isActive ? 'nav-active text-white' : 'text-gray-300 hover:text-primary'
                }`}
                aria-current={isActive ? 'page' : undefined}
                // 移除 disabled
              >
                {link.label}
              </button>
            );
          })}
          <button
            onClick={() => {
              handleNavClick({ id: 'contact', label: '联系我们' });
              closeMobileMenu();
            }}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-center transition-all nav-link no-highlight"
          >
            联系我们
          </button>
        </div>
      </div>
    </header>
  );
}