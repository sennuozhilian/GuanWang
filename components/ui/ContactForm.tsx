'use client';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { validatePhone, validateEmail } from '../../lib/utils';

export default function ContactForm() {
  // 表单状态管理
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // 输入框变化处理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除对应字段的错误提示
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入姓名';
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入联系电话';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = '请输入有效的电话号码';
    }
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    if (!formData.message.trim()) newErrors.message = '请输入咨询内容';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交到飞书
  const submitToFeishu = async () => {
    // 从环境变量获取飞书机器人Webhook地址
    const FEISHU_WEBHOOK = process.env.NEXT_PUBLIC_FEISHU_WEBHOOK;
    
    // 检查环境变量是否已配置
    if (!FEISHU_WEBHOOK) {
      console.error('飞书机器人Webhook地址未配置，请在.env.local文件中设置NEXT_PUBLIC_FEISHU_WEBHOOK');
      return false;
    }
    
    // 构造飞书消息格式（卡片形式）
    const feishuMessage = {
      msg_type: 'interactive',
      card: {
        config: {
          wide_screen_mode: true
        },
        elements: [
          {
            tag: 'div',
            text: {
              content: `**新咨询提交**\n姓名：${formData.name}\n电话：${formData.phone}\n邮箱：${formData.email || '未提供'}\n咨询内容：${formData.message}`,
              tag: 'lark_md'
            }
          }
        ],
        header: {
          title: {
            content: '网站咨询表单',
            tag: 'plain_text'
          },
          template: 'blue'
        }
      }
    };

    try {
      const response = await fetch(FEISHU_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feishuMessage)
      });

      if (!response.ok) throw new Error('提交失败');
      return true;
    } catch (error) {
      console.error('飞书提交失败：', error);
      return false;
    }
  };

  // 表单提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const success = await submitToFeishu();
      if (success) {
        setSubmitSuccess(true);
        // 重置表单
        setFormData({ name: '', phone: '', email: '', message: '' });
        // 3秒后隐藏成功提示
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        alert('提交失败，请稍后重试');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitSuccess && (
        <div className="bg-success/20 border border-success/30 text-success p-4 rounded-lg">
          提交成功！我们会尽快与您联系
        </div>
      )}

      {/* 姓名字段 */}
      <div>
        <label htmlFor="name" className="block text-white font-medium mb-2">
          姓名 <span className="text-error">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-dark/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
            errors.name ? 'border-error' : ''
          }`}
          placeholder="请输入您的姓名"
        />
        {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
      </div>

      {/* 电话字段 */}
      <div>
        <label htmlFor="phone" className="block text-white font-medium mb-2">
          联系电话 <span className="text-error">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-dark/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
            errors.phone ? 'border-error' : ''
          }`}
          placeholder="请输入您的联系电话"
        />
        {errors.phone && <p className="text-error text-sm mt-1">{errors.phone}</p>}
      </div>

      {/* 邮箱字段 */}
      <div>
        <label htmlFor="email" className="block text-white font-medium mb-2">
          电子邮箱
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-dark/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
            errors.email ? 'border-error' : ''
          }`}
          placeholder="请输入您的邮箱（选填）"
        />
        {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
      </div>

      {/* 留言字段 */}
      <div>
        <label htmlFor="message" className="block text-white font-medium mb-2">
          咨询内容 <span className="text-error">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-3 bg-dark/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none ${
            errors.message ? 'border-error' : ''
          }`}
          placeholder="请输入您的咨询内容"
        ></textarea>
        {errors.message && <p className="text-error text-sm mt-1">{errors.message}</p>}
      </div>

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span>提交咨询</span>
        <FontAwesomeIcon icon={faPaperPlane} />
        {isSubmitting && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        )}
      </button>
    </form>
  );
}