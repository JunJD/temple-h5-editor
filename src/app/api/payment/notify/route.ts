import { WechatPayV2Service } from '@/lib/payment'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

// 在函数外部打印一次，看模块加载时是否可用
console.log("Notify Route Module Load - WECHAT_PAY_KEY:", process.env.WECHAT_PAY_KEY);

export async function POST(req: NextRequest) {
    console.log("Notify Route POST Start - WECHAT_PAY_KEY:", process.env.WECHAT_PAY_KEY);
    console.log("Notify Route POST Start - All ENV Keys:", JSON.stringify(Object.keys(process.env).sort())); // 再次打印所有 Key
    let body = ''; // 在 try 外部声明 body

    try {
        console.log("Notify Route Try Block Start - WECHAT_PAY_KEY:", process.env.WECHAT_PAY_KEY);

        body = await req.text(); // 读取 body
        console.log("--- Raw Notification Body START ---");
        console.log(body);
        console.log("--- Raw Notification Body END ---");

        // 直接在这里创建实例，避免依赖 getWechatPayService
        const currentApiKey = process.env.WECHAT_PAY_KEY;
        console.log("Key before creating service instance:", currentApiKey); // 在创建实例前打印

        if (!currentApiKey) {
             console.error("FATAL ERROR: WECHAT_PAY_KEY is undefined or empty in process.env!");
             // 返回失败响应给微信
             return new Response(
                `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[Server configuration error: Missing API Key]]></return_msg></xml>`,
                { headers: { 'Content-Type': 'text/xml' } }
            );
        }

        const payService = new WechatPayV2Service({
            appId: process.env.WECHAT_PAY_APP_ID!,
            mchId: process.env.WECHAT_PAY_MCH_ID!,
            key: currentApiKey, // 使用我们刚刚检查过的变量
            pfxPath: process.env.WECHAT_PAY_PFX_PATH,
            notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL!,
        });
        
        // 注意：直接访问私有属性 'config' 可能不可靠或在未来版本中更改，仅用于调试
        try {
            console.log("Service instance created. Key used in config:", (payService as any)['config']?.key); 
        } catch (e) {
            console.log("Could not access service instance config key directly.");
        }


        // 验证回调通知签名
        console.log("Before calling verifyNotification...");
        const notification = payService.verifyNotification(body); // 这一步会使用内部的 key
        console.log("After calling verifyNotification. Result:", JSON.stringify(notification));


        // 处理支付结果
        if (notification.return_code === 'SUCCESS' && notification.result_code === 'SUCCESS') {
            console.log("Payment successful according to notification.");
            
            // 查找支付记录
            const submission = await prisma.submission.findFirst({
                where: { paymentId: notification.out_trade_no },
            });

            if (!submission) {
                 console.error("Order not found for out_trade_no:", notification.out_trade_no);
                return new Response(
                    `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[Order not found]]></return_msg></xml>`,
                    { headers: { 'Content-Type': 'text/xml' } }
                );
            }
             console.log("Found submission:", submission.id);

            // 更新支付状态 - 仅在状态不是 PAID 时更新，防止重复处理
            if (submission.status !== 'PAID') {
                await prisma.submission.update({
                    where: { id: submission.id },
                    data: {
                        status: 'PAID',
                        tradeNo: notification.transaction_id,
                        paidAt: new Date(), // 使用服务器时间
                        wxPayInfo: notification, // 使用解析后的 notification 对象
                    },
                });
                console.log("Submission status updated to PAID.");

                // 记录支付日志
                await prisma.paymentLog.create({
                    data: {
                        submissionId: submission.id,
                        type: 'NOTIFY_SUCCESS', // 更明确的类型
                        content: notification, // 使用解析后的 notification 对象
                    },
                });
                console.log("PaymentLog created for success.");
            } else {
                console.log("Submission status already PAID. Ignoring duplicate notification.");
            }


            // 返回成功给微信
            console.log("Returning SUCCESS response to WeChat.");
            return new Response(
                `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`,
                { headers: { 'Content-Type': 'text/xml' } }
            );
        } else {
             console.log("Payment failed or not successful according to notification:", JSON.stringify(notification));
             
             // 尝试查找订单以记录日志
             const submission = await prisma.submission.findFirst({
                 where: { paymentId: notification.out_trade_no },
                 select: { id: true } // 只需要 id
             });

            // 记录失败日志
             await prisma.paymentLog.create({
                 data: {
                     submissionId: submission?.id || `UNKNOWN_${notification.out_trade_no || 'NO_OUT_TRADE_NO'}`, // 尝试关联
                     type: 'NOTIFY_FAIL',
                     content: notification,
                 },
             });
             console.log("Failure PaymentLog created.");
             // 返回失败给微信
             console.log("Returning FAIL response to WeChat due to non-SUCCESS result code.");
            return new Response(
                 `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[Payment result not SUCCESS]]></return_msg></xml>`,
                 { headers: { 'Content-Type': 'text/xml' } }
             );
        }

    } catch (error: any) { // 类型设为 any 或 unknown
        console.error('Payment notification processing failed:', error);
        
        // 尝试记录错误日志
        try {
             // 尝试从错误对象中获取更多信息，如果失败则使用 body
             const notificationData = error?.data || error?.response?.data || body || 'No body data available';
             // 尝试从错误中解析 out_trade_no
             let outTradeNo = 'UNKNOWN_ERROR';
             try {
                 if (body) {
                     const parsedBody = new XMLParser({ ignoreAttributes: true }).parse(body);
                     outTradeNo = parsedBody?.xml?.out_trade_no || outTradeNo;
                 }
             } catch (parseError) {
                 console.error("Could not parse body in error handler:", parseError);
             }

             await prisma.paymentLog.create({
                 data: {
                     submissionId: outTradeNo, // 使用解析出的或默认的错误标记
                     type: 'NOTIFY_ERROR',
                     content: {
                         errorMessage: error.message,
                         errorStack: error.stack,
                         requestBody: notificationData // 记录解析后的或原始 body
                     },
                 },
             });
             console.log("Error PaymentLog created.");
        } catch (logError) {
             console.error("Failed to write error PaymentLog:", logError);
        }

        // 返回失败给微信
        console.log("Returning FAIL response to WeChat due to exception.");
        return new Response(
            `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[Internal server error]]></return_msg></xml>`,
            { headers: { 'Content-Type': 'text/xml' } }
        );
    }
}