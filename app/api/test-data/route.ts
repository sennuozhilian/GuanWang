import { NextResponse } from 'next/server';
import { getFeishuBitableData, adaptFeishuDataToFrontend, FrontendNewsItem } from '@/lib/feishu-service';

// 禁用API路由缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET请求处理（测试数据接口）
export async function GET(request: Request) {
  try {
    // 获取飞书原始数据
    const newsList = await getFeishuBitableData();

    // 适配前端字段格式（包含详情）
    const adaptedNewsList = adaptFeishuDataToFrontend(newsList, true);

    // 返回所有新闻的完整数据
    return NextResponse.json(adaptedNewsList, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('测试数据接口处理失败：', error);
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
