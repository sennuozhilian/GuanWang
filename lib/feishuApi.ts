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

// 完整类型定义（恢复tags + 新增content1/photo1 + 修复details）
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  tags: string[]; // 恢复标签字段
  image: string; // 封面图
  cover_type?: 'image' | 'video'; // 封面类型
  date: string;
  isTop?: boolean;
  content1: string; // 正文文本
  photo1: string; // 正文图片
  mediaUrl: string;
  mediaType: 'image' | 'video';
  details: Array<{
    image?: string;
    type: 'image' | 'video';
    text?: string;
  }>; // 新闻详情内容
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

// 解析飞书媒体（图片/视频，适配富文本entities/标准附件两种格式）
const parseFeishuMedia = (mediaField: any): { url: string; type: 'image' | 'video' } => {
  // 支持的视频格式列表
  const VIDEO_EXTENSIONS = /\.(mp4|avi|mov|wmv|flv|mkv|webm|mpeg|mpg|3gp|m4v|ogg)$/i;
  // 支持的图片格式列表
  const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
  
  // 情况1：标准附件格式（文件上传）
  if (Array.isArray(mediaField) && mediaField.length > 0) {
    const media = mediaField[0];
    const fileToken = media.file_token;
    const fileName = media.file_name || '';
    const fileType = media.file_type || '';
    
    // 使用媒体代理API
    const url = fileToken ? `/api/feishu-media/${fileToken}` : '';
    
    // 优先根据文件类型判断
    if (fileType.includes('video')) {
      return { url, type: 'video' };
    }
    if (fileType.includes('image')) {
      return { url, type: 'image' };
    }
    
    // 其次根据文件名后缀判断
    if (VIDEO_EXTENSIONS.test(fileName)) {
      return { url, type: 'video' };
    }
    if (IMAGE_EXTENSIONS.test(fileName)) {
      return { url, type: 'image' };
    }
    
    // 默认返回图片类型
    return { url, type: 'image' };
  }
  
  // 情况2：富文本entities格式（富文本中的图片/视频）
  if (mediaField?.entities && Array.isArray(mediaField.entities)) {
    // 查找所有媒体实体（图片和视频）
    const mediaEntity = mediaField.entities.find(item => 
      (item.entity_type === 2 && item.entity_content?.image) || // 图片实体
      (item.entity_type === 3 && item.entity_content?.video)   // 视频实体
    );
    
    if (mediaEntity) {
      // 处理视频实体
      if (mediaEntity.entity_type === 3 && mediaEntity.entity_content?.video) {
        const videoUrl = mediaEntity.entity_content.video.video_ori?.url || 
                         mediaEntity.entity_content.video.video_preview?.url || '';
        return { url: videoUrl, type: 'video' };
      }
      // 处理图片实体
      if (mediaEntity.entity_type === 2 && mediaEntity.entity_content?.image) {
        const imageUrl = mediaEntity.entity_content.image.image_ori?.url || '';
        // 额外检查图片URL是否实际为视频
        if (VIDEO_EXTENSIONS.test(imageUrl)) {
          return { url: imageUrl, type: 'video' };
        }
        return { url: imageUrl, type: 'image' };
      }
    }
  }
  
  // 情况3：直接URL格式
  if (typeof mediaField === 'string' && (mediaField.startsWith('http://') || mediaField.startsWith('https://'))) {
    if (VIDEO_EXTENSIONS.test(mediaField)) {
      return { url: mediaField, type: 'video' };
    }
    if (IMAGE_EXTENSIONS.test(mediaField)) {
      return { url: mediaField, type: 'image' };
    }
  }
  
  return { url: '', type: 'image' };
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
  
  // 解析封面媒体（图片或视频）
  const coverMedia = parseFeishuMedia(fields.image);
  const photo1Media = parseFeishuMedia(fields.photo1);
  
  // 构建详情数组
  const details: Array<{ image?: string; type: 'image' | 'video'; text?: string }> = [];
  
  // 添加正文图片（如果有）
  if (photo1Media.url) {
    details.push({
      image: photo1Media.url,
      type: photo1Media.type,
    });
  }
  
  // 添加正文文本（如果有）
  if (fields.content1) {
    details.push({
      text: fields.content1,
      type: 'image', // 默认类型，因为主要是文本
    });
  }
  
  return {
    id: feishuRecord.record_id || '',
    title: fields.title || '',
    summary: fields.summary || '',
    tags: parseFeishuTags(fields.tags), // 恢复标签解析
    image: coverMedia.url, // 封面图URL
    cover_type: coverMedia.type, // 封面类型（image或video）
    date: formatTimestamp(fields.date),
    isTop: fields.isTop === true || fields.isTop === '是',
    content1: fields.content1 || '', // 正文文本
    photo1: photo1Media.url, // 正文图片URL
    mediaUrl: coverMedia.url,
    mediaType: coverMedia.type,
    details, // 新闻详情内容
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