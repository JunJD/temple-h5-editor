import { getIssue } from "@/actions/issue"
import { Issue } from "@/schemas"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log(request.url, '<==request.url')
        console.log(request.nextUrl, '<==request.nextUrl')
        // 获取预览参数
        const searchParams = request.nextUrl.searchParams
        const isPreview = searchParams.get('preview') === '1'
        const openid = searchParams.get('openid')

        if (!openid && !isPreview) {
            return new NextResponse('openid not found' + request.url, { status: 404 })
        }
        
        // 数据库查询前
        console.log('尝试获取Issue数据:', params.id);

        const result = await getIssue(params.id)
        if (!('data' in result) || !result.data) {
            return new NextResponse('Not Found', { status: 404 })
        }

        const data: Issue = result.data as Issue
        const content = data.content || {}
        
        // 只在非预览模式下检查发布状态
        if (!isPreview && data.status !== 'published') {
            return new NextResponse('Not Found', { status: 404 })
        }
    
        // 获取Issue后
        console.log('Issue数据结果:', JSON.stringify(result));

        const submissions = await prisma.submission.findMany({
            where: { 
                issueId: params.id,
                status: 'PAID'
            },
            orderBy: { createdAt: 'desc' }
          })
          
          if (!submissions) {
            return new NextResponse('Not Found', { status: 404 })
          }
          
        // 提交查询前
        console.log('尝试查询提交数据');

        // 提交查询后
        console.log('提交数据结果:', JSON.stringify(submissions));
    
        // 生成完整的 HTML
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${data.title || '预览'}</title>
    <!-- 添加微信 JSSDK -->
    <script src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js"></script>
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="/bootstrap-5.3.3-dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="/bootstrap-5.3.3-dist/css/fix.css">
    <style>
        ${content.css || ''}
        ${isPreview ? `
        /* 预览模式水印 */
        body::before {
            content: "预览模式";
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(255, 0, 0, 0.1);
            color: red;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 9999;
        }
        ` : ''}
    </style>
</head>

<body>
    <!-- 先加载关键变量声明 -->
    <script>
        var is_h5 = true
        var submissionData = ${JSON.stringify(submissions)}
    </script>
    
    ${content.html || ''}
    ${isPreview ? `
    <div class="preview-banner" style="
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        text-align: center;
        padding: 8px;
        font-size: 14px;
    ">
        预览模式 - 该内容尚未发布
    </div>
    ` : ''}
    <!-- Bootstrap JS -->
    <script src="/bootstrap-5.3.3-dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // 获取 JSSDK 配置
        fetch('/api/wechat/jsconfig?url=' + encodeURIComponent(location.href.split('#')[0]))
            .then(response => response.json())
            .then(config => {
                wx.config({
                    debug: false,
                    appId: config.appId,
                    timestamp: config.timestamp,
                    nonceStr: config.nonceStr,
                    signature: config.signature,
                    jsApiList: [
                        'chooseWXPay'
                    ]
                });

                wx.ready(function() {
                    console.log('微信 JSSDK 初始化成功');
                });

                wx.error(function(res) {
                    console.error('微信 JSSDK 初始化失败:', res);
                });
            })
            .catch(error => {
                alert('获取微信配置失败:' + error)
                console.error('获取微信配置失败:', error);
            });
    </script>
</body>
</html>`

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            }
        })
    } catch (error) {
        console.error('Preview error:', error)
        return new NextResponse(`
        <!DOCTYPE html>
        <html>
        <head><title>测试 - 出错</title></head>
        <body>
          <h1 style="color:red">加载成功 ${new Date().toISOString()}</h1>
          <div>ID: ${params.id}</div>
          <div>openid:  '无'}</div>
          <div>error: ${JSON.stringify(error, null, 2)}</div>
        </body>
        </html>
        `, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    }
} 