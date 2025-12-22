import axios from 'axios';
import process from 'process';

// 抑制url.parse()警告
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('url.parse()')) return;
  console.warn(warning);
});

// 飞书配置
const FEISHU_CONFIG = {
  APP_ID: process.env.NEXT_PUBLIC_FEISHU_APP_ID || '',
  APP_SECRET: process.env.FEISHU_APP_SECRET || '',
  APP_TOKEN: process.env.NEXT_PUBLIC_FEISHU_APP_TOKEN || '',
  TABLE_ID: process.env.NEXT_PUBLIC_FEISHU_TABLE_ID || '',
  TENANT_ID: process.env.FEISHU_TENANT_ID || '',
};

// 完整类型定义（恢复tags + 新增content1/photo1）
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  tags: string[]; // 恢复标签字段
  image: string; // 封面图
  date: string;
  isTop?: boolean;
  content1: string; // 正文文本
  photo1: string; // 正文图片
  mediaUrl: string;
  mediaType: 'image' | 'unknown';
}

// 日期格式化
const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return '';
  const ts = Number(timestamp);
  if (isNaN(ts)) return '';
  const finalTs = ts.toString().length === 10 ? ts * 1000 : ts;
  const date = new Date(finalTs);
  return date.toString() === 'Invalid Date' ? '' : date.toISOString().split('T')[0];
};

// 获取飞书Token
const getFeishuToken = async () => {
  const { APP_ID, APP_SECRET, TENANT_ID } = FEISHU_CONFIG;
  if (!APP_ID || !APP_SECRET) throw new Error('飞书配置缺失');

  // 优先租户Token
  if (TENANT_ID) {
    try {
      const res = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        app_id: APP_ID,
        app_secret: APP_SECRET,
        tenant_id: TENANT_ID,
      }, { timeout: 10000, headers: { 'Content-Type': 'application/json' } });
      if (res.data.code === 0 && res.data.tenant_access_token) return res.data.tenant_access_token;
    } catch (err) {
      console.warn('租户Token获取失败，降级到应用Token');
    }
  }

  // 降级应用Token
  const res = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
    app_id: APP_ID,
    app_secret: APP_SECRET,
  }, { timeout: 10000, headers: { 'Content-Type': 'application/json' } });
  if (res.data.code !== 0 || !res.data.app_access_token) throw new Error(`应用Token获取失败：${res.data.msg}`);
  return res.data.app_access_token;
};

// 适配你提供的图片字段结构（解析entities中的图片URL）
const parseFeishuImage = (imageField: any): string => {
  // 情况1：标准附件格式
  if (Array.isArray(imageField) && imageField.length > 0) {
    return imageField[0].file_token ? `/api/feishu-media/${imageField[0].file_token}` : '';
  }
  // 情况2：富文本entities格式（你提供的结构）
  if (imageField?.entities && Array.isArray(imageField.entities)) {
    const imageEntity = imageField.entities.find(item => 
      item.entity_type === 2 && item.entity_content?.image?.image_ori?.url
    );
    return imageEntity?.entity_content?.image?.image_ori?.url || '';
  }
  return '';
};

// 解析tags（飞书多选/单选字段适配）
const parseFeishuTags = (tagsField: any): string[] => {
  if (!tagsField) return [];
  // 多选字段返回数组，单选返回字符串
  return Array.isArray(tagsField) ? tagsField : [tagsField];
};

// 核心：映射飞书表格数据
const mapFeishuData = (feishuRecord: any): NewsItem => {
  const fields = feishuRecord.fields || {};
  return {
    id: feishuRecord.record_id || '',
    title: fields.title || '',
    summary: fields.summary || '',
    tags: parseFeishuTags(fields.tags), // 恢复标签解析
    image: parseFeishuImage(fields.image), // 封面图（适配富文本/附件格式）
    date: formatTimestamp(fields.date),
    isTop: fields.isTop === true || fields.isTop === '是',
    content1: fields.content1 || '', // 正文文本
    photo1: parseFeishuImage(fields.photo1), // 正文图片（适配富文本/附件格式）
    mediaUrl: parseFeishuImage(fields.image),
    mediaType: 'image',
  };
};

// 获取飞书表格数据
export const getFeishuBitableData = async (): Promise<NewsItem[]> => {
  try {
    // 配置校验
    const configErrors: string[] = [];
    if (!FEISHU_CONFIG.APP_ID) configErrors.push('APP_ID');
    if (!FEISHU_CONFIG.APP_SECRET) configErrors.push('APP_SECRET');
    if (!FEISHU_CONFIG.APP_TOKEN) configErrors.push('APP_TOKEN');
    if (!FEISHU_CONFIG.TABLE_ID) configErrors.push('TABLE_ID');
    if (configErrors.length > 0) throw new Error(`飞书配置缺失：${configErrors.join('、')}`);

    // 获取Token
    const token = await getFeishuToken();
    if (!token) throw new Error('Token为空');

    // 请求表格数据
    const res = await axios.get(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_CONFIG.APP_TOKEN}/tables/${FEISHU_CONFIG.TABLE_ID}/records`,
      {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        params: { page_size: 100 },
        timeout: 20000,
      }
    );

    if (res.data.code !== 0) throw new Error(`接口错误：${res.data.msg}（错误码：${res.data.code}）`);
    const items = res.data.data?.items || [];
    console.log(`成功获取${items.length}条数据`);

    // 映射数据（过滤无标题）
    const newsList = items.map(mapFeishuData).filter(item => item.title);
    return newsList;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : '未知错误';
    console.error('获取飞书数据失败：', errMsg);
    return [];
  }
};