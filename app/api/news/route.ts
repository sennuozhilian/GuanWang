import { NextResponse } from 'next/server';
import { getFeishuBitableData, adaptFeishuDataToFrontend, FrontendNewsItem } from '@/lib/feishu-service';

// GET请求处理（核心接口）
export async function GET() {
  try {
    // 1. 获取飞书原始数据
    const newsList = await getFeishuBitableData();

    // 2. 适配前端字段格式
    const adaptedNewsList: FrontendNewsItem[] = adaptFeishuDataToFrontend(newsList);

    // 3. 排序：置顶优先 → 发布日期降序
    adaptedNewsList.sort((a, b) => {
      if (a.is_top && !b.is_top) return -1;
      if (!a.is_top && b.is_top) return 1;
      return b.publish_date.localeCompare(a.publish_date);
    });

    // 4. 返回数据
    return NextResponse.json(adaptedNewsList);
  } catch (error) {
    console.error('新闻接口处理失败：', error);
    // 兜底返回空数组，避免前端崩溃
    return NextResponse.json([], { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}