'use client';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

// 导航链接类型定义
interface NavLink {
  id: string;
  label: string;
}

// 常量定义
const SCROLL_THRESHOLD = 50; // 滚动阈值
const SECTIONS_OFFSET = 100; // section 偏移量

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const sectionsRef = useRef<NodeListOf<HTMLElement> | null>(null);

  // 平滑滚动到指定区域
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // 考虑导航栏高度
        behavior: 'smooth'
      });
    }
  };

  // 监听滚动事件
  useEffect(() => {
    // 初始化 sections 引用
    sectionsRef.current = document.querySelectorAll('section[id]');

    const handleScroll = () => {
      // 导航栏滚动样式变化
      setNavbarScrolled(window.scrollY > SCROLL_THRESHOLD);
      
      // 高亮当前section对应的导航链接
      let current = 'home';
      
      sectionsRef.current?.forEach(section => {
        const sectionTop = section.offsetTop - SECTIONS_OFFSET;
        const sectionHeight = section.offsetHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          current = section.id || 'home';
        }
      });
      
      if (current !== activeSection) {
        setActiveSection(current);
      }
    };

    // 使用 passive 优化滚动性能
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  // 关闭移动菜单
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // 导航链接数据
  const navLinks: NavLink[] = [
    { id: 'home', label: '首页' },
    { id: 'about', label: '关于我们' },
    { id: 'products', label: '产品中心' },
    { id: 'cases', label: '应用场景' },
  ];

  return (
    <header 
      id="navbar" 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        navbarScrolled 
          ? 'bg-dark/90 backdrop-blur-md shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}
      role="banner"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button 
            onClick={() => scrollToSection('home')}
            className="flex items-center space-x-2 cursor-pointer"
            aria-label="返回首页"
          >
            <div className="w-10 h-10 relative">
              <Image 
                src="/images/logo.png" 
                alt="森诺智联Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              森诺智联+
            </span>
          </button>
          
          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="主导航">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`font-medium transition-colors nav-link ${
                  activeSection === link.id 
                    ? 'nav-active text-white' 
                    : 'text-gray-300 hover:text-primary'
                }`}
                aria-current={activeSection === link.id ? 'page' : undefined}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('contact')}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all transform hover:scale-105 nav-link no-highlight"
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
      
      {/* 移动端导航菜单 */}
      <div 
        id="mobileMenu" 
        className={`md:hidden absolute top-full left-0 right-0 z-40 w-full bg-secondary shadow-lg transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        role="navigation"
        aria-label="移动导航"
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-5">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                scrollToSection(link.id);
                closeMobileMenu();
              }}
              className={`font-medium py-3 border-b border-gray-700 nav-link transition-colors ${
                activeSection === link.id 
                  ? 'nav-active text-white' 
                  : 'text-gray-300 hover:text-primary'
              }`}
              aria-current={activeSection === link.id ? 'page' : undefined}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => {
              scrollToSection('contact');
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