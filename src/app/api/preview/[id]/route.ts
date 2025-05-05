import { getIssue } from "@/actions/issue"
import { Issue } from "@/schemas"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const searchParams = request.nextUrl.searchParams
        const isPreview = searchParams.get('preview') === '1'
        const openid = searchParams.get('openid')

        if (!openid && !isPreview) {
            return new NextResponse('openid not found' + request.url, { status: 404 })
        }

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
        const htmlContent = content.html || '';
        let firstImageUrl: string | null = null;
        const siteUrl = 'https://kls.wxkltx.cn';
        const pageUrl = `${siteUrl}${request.nextUrl.pathname}${request.nextUrl.search}`;
        const shareTitle = data.title || '分享标题';

        const imageMatch = htmlContent.match(/<img[^>]+src=\"((?!data:image)[^\"]+)\"/);
        if (imageMatch && imageMatch[1]) {
            let rawImageUrl = imageMatch[1];
            if (rawImageUrl && !rawImageUrl.startsWith('http')) {
                if (rawImageUrl.startsWith('/')) {
                    firstImageUrl = siteUrl + rawImageUrl;
                } else {
                    firstImageUrl = siteUrl + '/' + rawImageUrl;
                }
            } else {
                firstImageUrl = rawImageUrl;
            }
        }
        console.log('firstImageUrl', firstImageUrl)

        // 如果提取到了图片，加上 OSS 参数，否则使用备用 URL
        const shareImageUrl = 'https://promptport.ai/_next/image?url=%2Fimages%2Flogo%2Fh5-logo.png&w=48&q=75'
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${data.title || '预览'}</title>
    <meta property="og:title" content="${data.title || '分享标题'}og:title" />
    ${firstImageUrl ? `<meta property="og:image" content="${firstImageUrl}?x-oss-process=image/resize,w_120,m_lfit/format,png/quality,q_80" />` : ''} 
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:type" content="article" /> 
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
    <!-- VConsole -->
    <script src="https://unpkg.com/vconsole@latest/dist/vconsole.min.js"></script>
    <script>
        // 初始化 VConsole
        var vConsole = new VConsole();
        window.vConsole = vConsole;
    </script>
    <script>
         // 获取 JSSDK 配置
        const frontendUrlForConfig = location.href.split('#')[0];
        console.log('>>>>> Frontend URL for config:', frontendUrlForConfig);
        fetch('/api/wechat/jsconfig?url=' + encodeURIComponent(frontendUrlForConfig))
            .then(response => response.json())
            .then(config => {
                wx.config({
                    debug: true, // 保持 debug 模式方便观察
                    appId: config.appId,
                    timestamp: config.timestamp,
                    nonceStr: config.nonceStr,
                    signature: config.signature,
                    jsApiList: [
                        'chooseWXPay',
                        'updateAppMessageShareData',
                        'updateTimelineShareData',
                        'onMenuShareAppMessage', // 保留旧接口声明（如果需要兼容）
                        'onMenuShareTimeline',  // 保留旧接口声明
                        'checkJsApi',
                    ]
                });

                wx.ready(function() {
                    console.log('wx.ready triggered'); // 确认 ready 执行

                    const shareConfig = {
                        title: '${shareTitle}', // 使用动态标题
                        link: '${pageUrl}',    // 使用动态链接
                        // imgUrl: '${shareImageUrl}',
                        imgUrl: "",
                        success: function () {
                            // 使用 console.log 记录成功
                            console.log('分享设置成功 (updateAppMessageShareData/updateTimelineShareData)');
                        },
                        cancel: function () {
                            console.log('用户取消分享');
                        },
                        fail: function (res) {
                            // 使用 console.error 记录失败详情，移除 alert
                            console.error('分享接口调用失败:', JSON.stringify(res));
                            // alert('分享设置失败: ' + JSON.stringify(res)); // 移除 alert
                        }
                    };

                    console.log('Share config prepared:', JSON.stringify(shareConfig, null, 2));
                    // alert(JSON.stringify(shareConfig, null, 2)) // <-- 移除 alert

                    wx.updateAppMessageShareData(shareConfig);
                    console.log('Called updateAppMessageShareData');

                    // updateTimelineShareData 需要单独设置，参数可能略有不同（例如朋友圈不显示 desc）
                    wx.updateTimelineShareData({
                        title: shareConfig.title, // 朋友圈通常只显示标题
                        link: shareConfig.link,
                        imgUrl: "",
                        success: shareConfig.success,
                        cancel: shareConfig.cancel,
                        fail: shareConfig.fail
                    });
                    console.log('Called updateTimelineShareData');

                     // 可选：检查接口是否可用
                     wx.checkJsApi({
                        jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'],
                        success: function(res) {
                            console.log('checkJsApi result:', JSON.stringify(res));
                        }
                     });
                });

                wx.error(function(res) {
                    // 移除 alert，保留 console.error
                    console.error('微信 JSSDK 初始化失败 (wx.error):', JSON.stringify(res));
                    // alert('JSSDK 初始化失败: ' + JSON.stringify(res)); // 移除 alert
                });
            })
            .catch(error => {
                // 移除 alert，保留 console.error
                console.error('获取微信 JSSDK 配置失败 (fetch error):', error);
                // alert('获取微信配置失败:' + error); // 移除 alert
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