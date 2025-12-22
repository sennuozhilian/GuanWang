import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 飞书配置
const FEISHU_CONFIG = {
  APP_ID: process.env.NEXT_PUBLIC_FEISHU_APP_ID || '',
  APP_SECRET: process.env.FEISHU_APP_SECRET || '',
  TENANT_ID: process.env.FEISHU_TENANT_ID || '',
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
    const fileToken = params.fileToken;
    if (!fileToken) {
      return NextResponse.json({ error: '缺少 fileToken' }, { status: 400 });
    }

    // 1. 获取Token
    const token = await getFeishuToken();
    if (!token) {
      return NextResponse.json({ error: 'Token 失效' }, { status: 500 });
    }

    // 2. 直接请求下载接口，获取重定向URL
    const downloadRes = await axios.get(
      `https://open.feishu.cn/open-apis/drive/v1/medias/${fileToken}/download`,
      {
        headers: { Authorization: `Bearer ${token}` },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
        timeout: 10000,
        responseType: 'arraybuffer', // 处理二进制文件内容
      }
    );

    // 3. 处理响应：如果是重定向，直接返回重定向；否则返回文件内容
    if (downloadRes.status === 302 && downloadRes.headers.location) {
      const redirectUrl = downloadRes.headers.location;
      return NextResponse.redirect(redirectUrl);
    } else if (downloadRes.status === 200) {
      // 如果直接返回文件内容，构造响应
      const contentType = downloadRes.headers['content-type'] || 'image/jpeg';
      const contentLength = downloadRes.headers['content-length'] || '0';
      
      return new NextResponse(downloadRes.data, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': contentLength,
        },
      });
    }

    throw new Error('未获取到有效下载链接或文件内容');

  } catch (error) {
    const err = error as any;
    console.error(`图片 ${params.fileToken} 下载失败:`, err.message);
    return NextResponse.json(
      { error: '图片权限不足或文件不存在' },
      { status: 404 }
    );
  }
}