import axios from 'axios';
import process from 'process';

// ======================== 飞书API核心逻辑（内联，无外部导入） ========================
// 抑制url.parse()废弃警告
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('url.parse()')) return;
  console.warn(warning);
});

// 【请替换为你的飞书实际配置】
const FEISHU_CONFIG = {
  APP_ID: process.env.NEXT_PUBLIC_FEISHU_APP_ID || 'cli_a9a570397d79dbdb', // 你的APP_ID
  APP_SECRET: process.env.FEISHU_APP_SECRET || '请填写你的APP_SECRET', // 你的APP_SECRET（必填）
  APP_TOKEN: process.env.NEXT_PUBLIC_FEISHU_APP_TOKEN || 'HnBubHiWKaFMWJsOElmcRdLUnwg', // 你的APP_TOKEN
  TABLE_ID: process.env.NEXT_PUBLIC_FEISHU_TABLE_ID || 'tblrwK3X3prUYztV', // 你的TABLE_ID
  TENANT_ID: process.env.FEISHU_TENANT_ID || 'FBMNY8V05E4', // 你的TENANT_ID
};

// 飞书原始数据类型定义
export interface FeishuNewsItem {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  image: string;
  date: string;
  isTop?: boolean;
  [key: string]: any; // 支持动态字段如content1, photo1, content2, photo2等
  mediaUrl: string;
  mediaType: 'image' | 'unknown';
}

// 前端最终接收的新闻类型
export interface FrontendNewsItem {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  cover_image: string;
  is_top: boolean;
  publish_date: string;
  details: Array<{ 
    image: string;   // 图片URL
    text: string;    // 文本内容
    type?: 'image' | 'content'; // 内容类型
  }>;
}

// 日期格式化工具函数
const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return '';
  const ts = Number(timestamp);
  if (isNaN(ts)) return '';
  const finalTs = ts.toString().length === 10 ? ts * 1000 : ts;
  const date = new Date(finalTs);
  return date.toString() === 'Invalid Date' ? '' : date.toISOString().split('T')[0];
};

// 获取飞书Token（租户Token优先，降级应用Token）
const getFeishuToken = async () => {
  const { APP_ID, APP_SECRET, TENANT_ID } = FEISHU_CONFIG;
  if (!APP_ID || !APP_SECRET) throw new Error('飞书配置缺失：APP_ID/APP_SECRET 必填');

  // 1. 尝试获取租户Token
  if (TENANT_ID) {
    try {
      const res = await axios.post(
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        { app_id: APP_ID, app_secret: APP_SECRET, tenant_id: TENANT_ID },
        { timeout: 10000, headers: { 'Content-Type': 'application/json' } }
      );
      if (res.data.code === 0 && res.data.tenant_access_token) {
        console.log('成功获取租户Token');
        return res.data.tenant_access_token;
      }
    } catch (err) {
      console.warn('租户Token获取失败，降级到应用Token：', (err as Error).message);
    }
  }

  // 2. 降级获取应用Token
  const res = await axios.post(
    'https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal',
    { app_id: APP_ID, app_secret: APP_SECRET },
    { timeout: 10000, headers: { 'Content-Type': 'application/json' } }
  );
  if (res.data.code !== 0 || !res.data.app_access_token) {
    throw new Error(`应用Token获取失败：${res.data.msg || '未知错误'}（错误码：${res.data.code}）`);
  }
  console.log('成功获取应用Token');
  return res.data.app_access_token;
};

// 解析飞书图片（适配富文本entities/标准附件两种格式）
const parseFeishuImage = (imageField: any): string => {
  // 格式1：飞书标准附件字段（数组）
  if (Array.isArray(imageField) && imageField.length > 0) {
    return imageField[0].file_token 
      ? `https://open.feishu.cn/open-apis/drive/v1/medias/${imageField[0].file_token}/download` 
      : '';
  }
  // 格式2：富文本entities图片（你提供的格式）
  if (imageField?.entities && Array.isArray(imageField.entities)) {
    const imageEntity = imageField.entities.find(
      (item: any) => item.entity_type === 2 && item.entity_content?.image?.image_ori?.url
    );
    return imageEntity?.entity_content?.image?.image_ori?.url || '';
  }
  return '';
};

// 解析飞书标签（兼容单选/多选字段）
const parseFeishuTags = (tagsField: any): string[] => {
  if (!tagsField) return [];
  return Array.isArray(tagsField) ? tagsField : [tagsField];
};

// 映射飞书原始数据到标准格式
const mapFeishuData = (feishuRecord: any): FeishuNewsItem => {
  const fields = feishuRecord.fields || {};
  const newsItem: any = {
    id: feishuRecord.record_id || '',
    title: fields.title || '',
    summary: fields.summary || '',
    tags: parseFeishuTags(fields.tags),
    image: parseFeishuImage(fields.image),
    date: formatTimestamp(fields.date),
    isTop: fields.isTop === true || fields.isTop === '是',
    mediaUrl: parseFeishuImage(fields.image),
    mediaType: 'image',
  };
  
  // 动态添加所有content和photo字段
  for (const key in fields) {
    if (key.startsWith('content') || key.startsWith('photo')) {
      if (key.startsWith('photo')) {
        newsItem[key] = parseFeishuImage(fields[key]);
      } else {
        newsItem[key] = fields[key] || '';
      }
    }
  }
  
  return newsItem;
};

// 获取飞书多维表格数据
export const getFeishuBitableData = async (): Promise<FeishuNewsItem[]> => {
  try {
    // 1. 校验配置完整性
    const missingConfig = [];
    if (!FEISHU_CONFIG.APP_ID) missingConfig.push('APP_ID');
    if (!FEISHU_CONFIG.APP_SECRET) missingConfig.push('APP_SECRET');
    if (!FEISHU_CONFIG.APP_TOKEN) missingConfig.push('APP_TOKEN');
    if (!FEISHU_CONFIG.TABLE_ID) missingConfig.push('TABLE_ID');
    if (missingConfig.length > 0) {
      throw new Error(`飞书配置缺失：${missingConfig.join('、')}（请补充配置）`);
    }

    // 2. 获取Token
    const token = await getFeishuToken();

    // 3. 请求表格数据
    console.log('开始请求飞书表格数据：', {
      APP_TOKEN: FEISHU_CONFIG.APP_TOKEN,
      TABLE_ID: FEISHU_CONFIG.TABLE_ID,
    });
    const res = await axios.get(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_CONFIG.APP_TOKEN}/tables/${FEISHU_CONFIG.TABLE_ID}/records`,
      {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        params: { page_size: 100 }, // 最多获取100条数据
        timeout: 20000,
      }
    );

    // 4. 处理响应
    if (res.data.code !== 0) {
      throw new Error(`飞书接口错误：${res.data.msg}（错误码：${res.data.code}）`);
    }
    const items = res.data.data?.items || [];
    console.log(`成功获取${items.length}条飞书表格数据`);

    // 5. 映射并过滤有效数据
    const newsList = items.map(mapFeishuData).filter(item => item.title);
    return newsList;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : '未知错误';
    console.error('获取飞书数据失败：', errMsg);
    return [];
  }
};

// 替换图片URL为代理URL
export const getProxyUrl = (imageUrl: string) => {
  if (!imageUrl) return '';
  // 提取fileToken，适配两种格式：
  // 1. https://open.feishu.cn/open-apis/drive/v1/medias/{fileToken}/download
  // 2. /api/feishu-media/{fileToken}
  const match = imageUrl.match(/medias\/(.*?)\//) || imageUrl.match(/feishu-media\/(.*?)$/);
  if (match && match[1]) {
    return `/api/feishu-media/${match[1]}`;
  }
  return imageUrl;
};

// 适配前端字段格式
export const adaptFeishuDataToFrontend = (newsList: FeishuNewsItem[]): FrontendNewsItem[] => {
  return newsList.map(item => {
    // 创建详情列表，先添加封面图
    const details = [
      { image: getProxyUrl(item.image), text: '', type: 'image' as const }
    ];
    
    // 按顺序添加content1, photo1, content2, photo2...
    let i = 1;
    while (true) {
      const contentKey = `content${i}`;
      const photoKey = `photo${i}`;
      
      // 检查是否有更多内容
      const hasContent = item.hasOwnProperty(contentKey) && item[contentKey];
      const hasPhoto = item.hasOwnProperty(photoKey) && item[photoKey];
      
      if (!hasContent && !hasPhoto) {
        break; // 没有更多内容，退出循环
      }
      
      // 添加文本内容（如果有）
      if (hasContent) {
        details.push({
          image: '',
          text: item[contentKey],
          type: 'content' as const
        });
      }
      
      // 添加图片内容（如果有）
      if (hasPhoto) {
        details.push({
          image: getProxyUrl(item[photoKey]),
          text: '',
          type: 'image' as const
        });
      }
      
      i++;
    }
    
    return {
      id: item.id,
      title: item.title,
      summary: item.summary,
      tags: item.tags,
      cover_image: getProxyUrl(item.image),
      is_top: item.isTop || false,
      publish_date: item.date,
      details: details.filter(item => item.image || item.text) // 过滤空内容
    };
  });
};