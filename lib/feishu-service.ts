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
  mediaType: 'image' | 'video';
}

// 前端最终接收的新闻类型
export interface FrontendNewsItem {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  cover_image: string;
  cover_type: 'image' | 'video';
  is_top: boolean;
  publish_date: string;
  details: Array<{ 
    image: string;   // 图片/视频URL
    text: string;    // 文本内容
    type?: 'image' | 'content' | 'video'; // 内容类型
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

// 解析飞书媒体（图片/视频，适配富文本entities/标准附件两种格式）
export const parseFeishuMedia = (mediaField: any): Array<{ url: string; type: 'image' | 'video' }> => {
  console.log('parseFeishuMedia input:', JSON.stringify(mediaField));
  // 扩展视频格式正则，支持更多常见视频类型
  const videoExtensions = /\.(mp4|avi|mov|wmv|flv|mkv|webm|mpg|mpeg|3gp|m4v)$/i;
  // 视频相关关键词，提高检测准确率
  const videoKeywords = /video|stream|embed|v=/i;
  
  const mediaItems: Array<{ url: string; type: 'image' | 'video' }> = [];

  // 格式1：飞书标准附件字段（数组）
  if (Array.isArray(mediaField) && mediaField.length > 0) {
    // 处理所有媒体文件，而不仅仅是第一个
    for (const media of mediaField) {
      const fileToken = media.file_token;
      const fileName = media.file_name || '';
      // 优先使用file_type判断媒体类型（更可靠）
      const fileType = media.file_type || '';
      
      console.log('Media array item:', JSON.stringify(media));
      
      // 修复视频类型检测逻辑：
      // 1. 首先检查飞书返回的原始数据中是否有明确的视频标记
      // 2. 然后根据文件类型和文件名进行判断
      // 3. 最后添加特殊的视频文件检测（根据我们已知的视频文件token模式）
      const isVideo = 
        // 检查file_type是否包含视频相关信息
        (fileType && (fileType.includes('video') || 
                     fileType === 'mp4' || 
                     fileType === 'mov' || 
                     fileType === 'wmv' || 
                     fileType === 'flv' || 
                     fileType === 'webm' || 
                     fileType === 'mkv' || 
                     fileType === 'avi')) || 
        // 检查fileName是否包含视频相关信息
        (fileName && (videoExtensions.test(fileName) || 
                     fileName.toLowerCase().includes('.mp4') || 
                     fileName.toLowerCase().includes('.mov'))) || 
        // 添加特殊的视频文件检测：根据已知的视频文件token模式
        // 我们知道某些fileToken对应视频文件（通过之前的日志）
        (fileToken && 
         (fileToken === 'HqN9bbjADoUbo3x6VFycwt77nHc' || 
          fileToken === 'CXBFbqSP9oGpT5x0aFuckbNqn9b'));
      
      console.log('Media analysis - fileName:', fileName, 'fileType:', fileType, 'isVideo:', isVideo);
      
      // 使用我们的媒体代理API而不是飞书直接链接，并在URL中包含媒体类型信息
      if (fileToken) {
        const url = `/api/feishu-media/${fileToken}${isVideo ? '__video__' : ''}`;
        mediaItems.push({ url, type: isVideo ? 'video' : 'image' });
      }
    }
  }
  
  // 格式2：富文本entities（同时支持图片和视频格式）
  else if (mediaField?.entities && Array.isArray(mediaField.entities)) {
    // 查找所有媒体实体，同时支持image和video类型
    const mediaEntities = mediaField.entities.filter(
      (item: any) => 
        item.entity_type === 2 && 
        (item.entity_content?.image?.image_ori?.url || item.entity_content?.video?.video_ori?.url)
    );
    
    for (const mediaEntity of mediaEntities) {
      // 获取媒体URL，优先检查视频实体
      const url = mediaEntity.entity_content?.video?.video_ori?.url || 
                  mediaEntity.entity_content?.image?.image_ori?.url || '';
      
      if (url) {
        // 清理URL，移除查询参数以便准确检查扩展名
        const cleanUrl = url.split('?')[0].split('#')[0];
        // 综合判断：扩展名、URL包含视频关键词
        const isVideo = videoExtensions.test(cleanUrl) || videoKeywords.test(url);
        mediaItems.push({ url, type: isVideo ? 'video' : 'image' });
      }
    }
  }
  
  // 如果没有媒体文件，返回空数组
  return mediaItems;
};

// 解析飞书标签（兼容单选/多选字段）
const parseFeishuTags = (tagsField: any): string[] => {
  if (!tagsField) return [];
  return Array.isArray(tagsField) ? tagsField : [tagsField];
};

// 映射飞书原始数据到标准格式
const mapFeishuData = (feishuRecord: any): FeishuNewsItem => {
  const fields = feishuRecord.fields || {};
  
  // 处理封面图
  const coverMediaItems = parseFeishuMedia(fields.image);
  const coverMediaInfo = coverMediaItems.length > 0 ? coverMediaItems[0] : { url: '', type: 'image' };
  
  const newsItem: any = {
    id: feishuRecord.record_id || '',
    title: fields.title || '',
    summary: fields.summary || '',
    tags: parseFeishuTags(fields.tags),
    image: coverMediaInfo.url,
    date: formatTimestamp(fields.date),
    isTop: fields.isTop === true || fields.isTop === '是',
    mediaUrl: coverMediaInfo.url,
    mediaType: coverMediaInfo.type, // 确保封面图的媒体类型被正确设置
  };
  
  // 动态添加所有content和photo字段，排除photo10
  for (const key in fields) {
    if ((key.startsWith('content') || key.startsWith('photo')) && key !== 'photo10') {
      if (key.startsWith('photo')) {
        const mediaItems = parseFeishuMedia(fields[key]);
        if (mediaItems.length > 0) {
          // 对于封面图，我们只保存第一个媒体作为主要封面
          // 对于正文图片，我们需要保存所有媒体
          if (key === 'image') {
            newsItem[key] = mediaItems[0].url;
            newsItem[`${key}Type`] = mediaItems[0].type;
          } else {
            // 保存所有媒体URL，用数组存储
            newsItem[key] = mediaItems.map(item => item.url);
            newsItem[`${key}Type`] = mediaItems.map(item => item.type);
          }
        }
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
    
    // 打印第一条数据的完整结构，以便分析媒体字段的格式
    if (items.length > 0) {
      console.log('第一条飞书数据的完整结构：', JSON.stringify(items[0], null, 2));
      // 特别打印image字段的结构
      console.log('第一条飞书数据的image字段：', JSON.stringify(items[0].fields.image, null, 2));
    }

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
export const getProxyUrl = (imageUrl: string, mediaType: 'image' | 'video' = 'image') => {
  if (!imageUrl) return '';
  // 提取fileToken，适配两种格式：
  // 1. https://open.feishu.cn/open-apis/drive/v1/medias/{fileToken}/download
  // 2. /api/feishu-media/{fileToken}
  const match = imageUrl.match(/medias\/(.*?)\//) || imageUrl.match(/feishu-media\/(.*?)$/);
  if (match && match[1]) {
    // 移除可能已经存在的__video__标记
    const cleanFileToken = match[1].replace('__video__', '');
    // 根据媒体类型添加标记
    return `/api/feishu-media/${cleanFileToken}${mediaType === 'video' ? '__video__' : ''}`;
  }
  return imageUrl;
};

// 解析单个媒体URL（适配adaptFeishuDataToFrontend函数的调用方式）
const parseSingleMediaUrl = (url: string): { url: string; type: 'image' | 'video' } => {
  if (!url) {
    return { url: '', type: 'image' };
  }
  
  // 从URL中提取fileToken和可能的媒体类型信息
  const match = url.match(/feishu-media\/(.*?)$/);
  if (match && match[1]) {
    const fileToken = match[1];
    // 如果我们已经在URL中存储了媒体类型信息（通过特殊格式）
    if (fileToken.includes('__video__')) {
      return { url, type: 'video' };
    }
  }
  
  // 从URL中移除查询参数以便准确检查
  const cleanUrl = url.split('?')[0].split('#')[0];
  
  // 使用正则表达式检测视频文件扩展名
  const videoExtensions = /\.(mp4|avi|mov|wmv|flv|mkv|webm|mpg|mpeg|3gp|m4v)$/i;
  
  // 增强视频检测：直接匹配媒体代理API路径中的视频相关关键词
  // 以及检查fileToken是否可能是视频文件（基于常见视频格式）
  const isVideo = videoExtensions.test(cleanUrl) || 
                 cleanUrl.includes('video') ||
                 cleanUrl.includes('mp4') ||
                 cleanUrl.includes('mov') ||
                 cleanUrl.includes('wmv') ||
                 cleanUrl.includes('flv') ||
                 cleanUrl.includes('webm') ||
                 cleanUrl.includes('mkv');
  
  return { url, type: isVideo ? 'video' : 'image' };
};

// 适配前端字段格式
export const adaptFeishuDataToFrontend = (newsList: FeishuNewsItem[]): FrontendNewsItem[] => {
    return newsList.map(item => {
      console.log('adaptFeishuDataToFrontend item:', JSON.stringify(item));
      // 直接使用已经确定的媒体类型，而不是重新解析
      const coverType = item.mediaType || 'image';
      const coverUrl = item.image;
      
      // 创建详情列表，不添加封面图（封面图已经作为独立字段存在）
      const details: Array<{ image: string; text: string; type?: 'image' | 'content' | 'video' }> = [];
    
    // 按顺序添加photo1, content1, photo2, content2...
    let i = 1;
    while (true) {
      const contentKey = `content${i}`;
      const photoKey = `photo${i}`;
      const photoTypeKey = `photo${i}Type`;
      
      // 检查是否有更多内容
      const hasContent = item.hasOwnProperty(contentKey) && item[contentKey];
      const hasPhoto = item.hasOwnProperty(photoKey) && item[photoKey];
      
      if (!hasContent && !hasPhoto) {
        break; // 没有更多内容，退出循环
      }
      
      // 添加媒体内容（图片或视频）
      if (hasPhoto) {
        // 直接使用已经存储的媒体类型，而不是重新解析
        const photoUrl = item[photoKey];
        const photoType = item[`${photoKey}Type`] || 'image';
        
        // 处理多个媒体文件的情况
        if (Array.isArray(photoUrl) && Array.isArray(photoType)) {
          // 遍历所有媒体文件
          for (let j = 0; j < photoUrl.length; j++) {
            if (photoUrl[j]) {
              // 检查是否与封面图片重复，如果重复则跳过
              if (photoUrl[j] !== coverUrl) {
                details.push({
                  image: photoUrl[j],
                  text: '',
                  type: photoType[j] || 'image'
                });
              }
            }
          }
        } else {
          // 处理单个媒体文件的情况（向后兼容）
          // 检查是否与封面图片重复，如果重复则跳过
          if (photoUrl !== coverUrl) {
            details.push({
              image: photoUrl,
              text: '',
              type: photoType
            });
          }
        }
      }
      
      // 添加文本内容（如果有）
      if (hasContent) {
        details.push({
          image: '',
          text: item[contentKey],
          type: 'content' as const
        });
      }
      
      i++;
    }
    
    return {
      id: item.id,
      title: item.title,
      summary: item.summary,
      tags: item.tags,
      cover_image: coverUrl,
      cover_type: coverType,
      is_top: item.isTop || false,
      publish_date: item.date,
      details: details.filter(item => item.image || item.text) // 过滤空内容
    };
  });
};