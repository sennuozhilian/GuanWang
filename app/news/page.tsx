import NewsPage from '../../components/ui/NewsPage';
import { getFeishuBitableData, adaptFeishuDataToFrontend } from '@/lib/feishu-service';

// 禁用页面静态缓存，确保每次请求都获取最新数据
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function News() {
  // 服务器端获取新闻数据
  const newsList = await getFeishuBitableData();
  const adaptedNewsList = adaptFeishuDataToFrontend(newsList);

  // 排序：置顶优先 → 发布日期降序
  adaptedNewsList.sort((a, b) => {
    if (a.is_top && !b.is_top) return -1;
    if (!a.is_top && b.is_top) return 1;
    return b.publish_date.localeCompare(a.publish_date);
  });

  return <NewsPage initialNewsData={adaptedNewsList} />;
}