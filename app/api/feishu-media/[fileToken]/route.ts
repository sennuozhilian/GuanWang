import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 飞书配置
const FEISHU_CONFIG = {
  APP_ID: process.env.NEXT_PUBLIC_FEISHU_APP_ID || 'cli_a9a570397d79dbdb', // 你的APP_ID
  APP_SECRET: process.env.FEISHU_APP_SECRET || 'in4sya6G3rQ8p5LTfMfFqcan2sQedbew', // 你的APP_SECRET（必填）
  TENANT_ID: process.env.FEISHU_TENANT_ID || 'FBMNY8V05E4', // 你的TENANT_ID
};

/**
 * 获取飞书Token（复用feishuApi的逻辑）
 */
const getFeishuToken = async () => {
  try {
    // 优先租户令牌
    if (FEISHU_CONFIG.TENANT_ID) {
      const res = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        app_id: FEISHU_CONFIG.APP_ID,
        app_secret: FEISHU_CONFIG.APP_SECRET,
        tenant_id: FEISHU_CONFIG.TENANT_ID,
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.data.code === 0 && res.data.tenant_access_token) {
        return res.data.tenant_access_token;
      }
    }

    // 降级应用令牌
    const res = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
      app_id: FEISHU_CONFIG.APP_ID,
      app_secret: FEISHU_CONFIG.APP_SECRET,
    }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.data.code === 0 && res.data.app_access_token) {
      return res.data.app_access_token;
    }

    throw new Error(`Token获取失败：${res.data.msg}`);
  } catch (error) {
    console.error('飞书Token错误:', error);
    return null;
  }
};

/**
 * 飞书媒体文件代理
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { fileToken: string } }
) {
  try {
    console.log('飞书媒体代理API被调用');
    console.log('请求参数:', params);
    console.log('环境变量配置:', {
      TENANT_ID: FEISHU_CONFIG.TENANT_ID,
      APP_ID: FEISHU_CONFIG.APP_ID,
      APP_SECRET: FEISHU_CONFIG.APP_SECRET ? '****' : '空'
    });

    const fileToken = params.fileToken;
    if (!fileToken) {
      console.log('缺少 fileToken');
      return NextResponse.json({ error: '缺少 fileToken' }, { status: 400 });
    }
    
    // 处理包含媒体类型信息的URL（去除__video__后缀）
    const cleanFileToken = fileToken.replace('__video__', '');

    // 1. 获取Token
    const token = await getFeishuToken();
    console.log('获取到的Token:', token ? '****' : 'null');
    if (!token) {
      return NextResponse.json({ error: 'Token 失效' }, { status: 500 });
    }

    // 2. 请求下载接口，允许自动跟随重定向
    console.log(`尝试下载媒体 ${cleanFileToken}...`);
    const downloadRes = await axios.get(
      `https://open.feishu.cn/open-apis/drive/v1/medias/${cleanFileToken}/download`,
      {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: (status) => status >= 200 && status < 400,
        timeout: 10000,
        responseType: 'arraybuffer', // 处理二进制文件内容
      }
    );
    
    console.log(`下载响应状态: ${downloadRes.status}`);
    console.log(`下载响应头:`, JSON.stringify(downloadRes.headers));
    console.log(`下载内容长度: ${downloadRes.data ? downloadRes.data.length : 'null'}`);

    // 3. 处理响应：直接返回文件内容
    if (downloadRes.status === 200) {
      // 确保下载的数据不为null
      if (!downloadRes.data || !(downloadRes.data instanceof Buffer) || downloadRes.data.length === 0) {
        throw new Error('下载的媒体内容为空或无效');
      }
      
      // 自动检测或使用响应头中的Content-Type
      let contentType = downloadRes.headers['content-type'] || 'application/octet-stream';
      
      // 检测媒体类型
      const contentLength = downloadRes.data.length;
      const fileData = downloadRes.data;
      
      // 使用魔术数字检测文件类型
      const isJPEG = contentLength >= 2 && fileData[0] === 0xFF && fileData[1] === 0xD8;
      const isPNG = contentLength >= 8 && fileData[0] === 0x89 && fileData[1] === 0x50 && fileData[2] === 0x4E && fileData[3] === 0x47;
      const isGIF = contentLength >= 6 && fileData[0] === 0x47 && fileData[1] === 0x49 && fileData[2] === 0x46;
      const isWebP = contentLength >= 12 && fileData[8] === 0x57 && fileData[9] === 0x45 && fileData[10] === 0x42 && fileData[11] === 0x50;
      const isVideo = contentLength >= 12 && fileData[4] === 0x66 && fileData[5] === 0x74 && fileData[6] === 0x79 && fileData[7] === 0x70;
      
      // 根据魔术数字设置Content-Type
      if (isJPEG) {
        contentType = 'image/jpeg';
      } else if (isPNG) {
        contentType = 'image/png';
      } else if (isGIF) {
        contentType = 'image/gif';
      } else if (isWebP) {
        contentType = 'image/webp';
      } else if (isVideo) {
        // MP4是最常见的视频格式
        contentType = 'video/mp4';
      } else if (contentType === 'application/octet-stream') {
        // 如果文件大小较大且没有明确的Content-Type，可能是视频
        if (contentLength > 1000000) {
          contentType = 'video/mp4'; // 默认使用mp4
        } else {
          // 否则假设是图片
          contentType = 'image/jpeg';
        }
      }
      
      console.log('返回文件内容，Content-Type:', contentType);
      
      // 为视频添加适当的响应头以优化流传输
      const headers: HeadersInit = {
        'Content-Type': contentType,
        'Content-Length': String(contentLength),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable'
      };
      
      // 对于视频文件，添加额外的优化头
      if (contentType.startsWith('video/')) {
        headers['Content-Disposition'] = 'inline';
        headers['X-Content-Type-Options'] = 'nosniff';
      }
      
      return new NextResponse(downloadRes.data, {
        status: 200,
        headers
      });
    }

    throw new Error('未获取到有效下载链接或文件内容');

  } catch (error) {
    const err = error as any;
    console.error('媒体下载失败:', {
      fileToken: params.fileToken,
      message: err.message,
      stack: err.stack
    });
    return NextResponse.json(
      { error: '媒体权限不足或文件不存在' },
      { status: 404 }
    );
  }
}