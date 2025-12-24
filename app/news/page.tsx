import NewsPage from '@/components/ui/NewsPage';
import { getFeishuBitableData, adaptFeishuDataToFrontend } from '@/lib/feishu-service';

// 使用自动动态渲染并设置60秒缓存时间
export const dynamic = 'auto';
export const revalidate = 60;

export default async function News() {
  // 服务器端获取新闻数据
  const newsList = await getFeishuBitableData();
  const adaptedNewsList = adaptFeishuDataToFrontend(newsList, false);

  // 排序：置顶优先 → 发布日期降序
  adaptedNewsList.sort((a, b) => {
    if (a.is_top && !b.is_top) return -1;
    if (!a.is_top && b.is_top) return 1;
    return b.publish_date.localeCompare(a.publish_date);
  });

  return <NewsPage initialNewsData={adaptedNewsList} />;
}