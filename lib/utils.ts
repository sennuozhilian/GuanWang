// 直接导入具体函数（避免 tree-shaking 导致的导出问题）
import format from 'date-fns/format';
// 使用命名导入 zhCN（适配模块导出规范）
import { zhCN } from 'date-fns/locale/zh-CN';

/**
 * 格式化日期
 * @param date - 日期对象或时间戳
 * @param formatStr - 格式化字符串，默认 'yyyy-MM-dd HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (
  date: Date | number | string,
  formatStr: string = 'yyyy-MM-dd HH:mm:ss'
): string => {
  try {
    const targetDate = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    // v2+ 中 format 支持第三个参数（options），传递 locale
    return format(targetDate, formatStr, { locale: zhCN });
  } catch (error) {
    console.error('日期格式化失败:', error);
    return '';
  }
};

/**
 * 验证手机号码
 * @param phone - 手机号码
 * @returns 是否有效
 */
export const validatePhone = (phone: string): boolean => {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
};

/**
 * 验证邮箱
 * @param email - 邮箱地址
 * @returns 是否有效
 */
export const validateEmail = (email: string): boolean => {
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return reg.test(email);
};

/**
 * 生成随机字符串
 * @param length - 字符串长度，默认10
 * @param type - 类型：all(字母+数字)、letter(纯字母)、number(纯数字)
 * @returns 随机字符串
 */
export const generateRandomStr = (
  length: number = 10,
  type: 'all' | 'letter' | 'number' = 'all'
): string => {
  let chars = '';
  switch (type) {
    case 'letter':
      chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      break;
    case 'number':
      chars = '0123456789';
      break;
    default:
      chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  }
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 防抖函数
 * @param func - 目标函数
 * @param delay - 延迟时间(ms)
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
};

/**
 * 节流函数
 * @param func - 目标函数
 * @param interval - 时间间隔(ms)
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  interval: number
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    if (currentTime - lastTime >= interval) {
      func(...args);
      lastTime = currentTime;
    }
  };
};

/**
 * 处理数字千分位格式化
 * @param num - 数字或数字字符串
 * @returns 格式化后的字符串
 */
export const formatNumberWithCommas = (num: number | string): string => {
  if (num === '' || num === null || num === undefined) return '0';
  
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) return '0';
  
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 截取字符串，超出部分用省略号代替
 * @param str - 目标字符串
 * @param length - 最大长度
 * @returns 处理后的字符串
 */
export const truncateStr = (str: string, length: number): string => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

/**
 * 获取URL中的查询参数
 * @param url - 目标URL，默认当前页面URL
 * @returns 查询参数对象
 */
export const getQueryParams = (url: string = window.location.href): Record<string, string> => {
  const params: Record<string, string> = {};
  const queryString = url.split('?')[1];
  
  if (!queryString) return params;
  
  queryString.split('&').forEach(param => {
    const [key, value] = param.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  });
  
  return params;
};

/**
 * 深拷贝对象
 * @param obj - 目标对象
 * @returns 拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) return new Date(obj) as unknown as T;
  if (obj instanceof Array) return [...obj.map(item => deepClone(item))] as unknown as T;
  if (obj instanceof Object) {
    const clonedObj: Record<string, any> = {};
    Object.keys(obj).forEach(key => {
      clonedObj[key] = deepClone((obj as Record<string, any>)[key]);
    });
    return clonedObj as T;
  }
  
  return obj;
};