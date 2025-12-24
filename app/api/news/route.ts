import { NextResponse } from 'next/server';
import { getFeishuBitableData, adaptFeishuDataToFrontend, FrontendNewsItem } from '@/lib/feishu-service';

// 禁用API路由缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET请求处理（核心接口）
export async function GET(request: Request) {
  // 1. 获取请求URL的查询参数
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  try {
    // 2. 获取飞书原始数据
    const newsList = await getFeishuBitableData();

    // 3. 适配前端字段格式
    // 如果有id参数，则只返回该新闻的完整数据；否则返回所有新闻的基本信息
    let adaptedNewsList: FrontendNewsItem[];
    if (id) {
      // 找到对应id的新闻
      const newsItem = newsList.find(item => item.id === id);
      if (newsItem) {
        // 返回完整数据（包含详情）
        adaptedNewsList = adaptFeishuDataToFrontend([newsItem], true);
      } else {
        // 没有找到对应id的新闻
        return NextResponse.json({ error: '新闻不存在' }, { status: 404 });
      }
    } else {
      // 返回所有新闻的基本信息（不包含详情）
      adaptedNewsList = adaptFeishuDataToFrontend(newsList, false);
      
      // 排序：置顶优先 → 发布日期降序
      adaptedNewsList.sort((a, b) => {
        if (a.is_top && !b.is_top) return -1;
        if (!a.is_top && b.is_top) return 1;
        return b.publish_date.localeCompare(a.publish_date);
      });
    }

    // 4. 返回数据，设置缓存控制头
    return NextResponse.json(id ? adaptedNewsList[0] : adaptedNewsList, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('新闻接口处理失败：', error);
    // 兜底返回空数组或错误信息，避免前端崩溃
    return NextResponse.json(id ? { error: '获取新闻失败' } : [], { 
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