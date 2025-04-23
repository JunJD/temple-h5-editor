import { WechatPayV2Service } from '@/lib/payment'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

export async function POST(req: NextRequest) {
    console.log("支付通知接收开始");
    let body = ''; 

    try {
        body = await req.text();

        // 直接创建实例，避免依赖 getWechatPayService
        const currentApiKey = process.env.WECHAT_PAY_KEY;
        if (!currentApiKey) {
             console.error("错误: WECHAT_PAY_KEY 环境变量未设置!");
             return new Response(
                `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[服务配置错误：缺少API密钥]]></return_msg></xml>`,
                { headers: { 'Content-Type': 'text/xml' } }
            );
        }

        const payService = new WechatPayV2Service({
            appId: process.env.WECHAT_PAY_APP_ID!,
            mchId: process.env.WECHAT_PAY_MCH_ID!,
            key: currentApiKey,
            pfxPath: process.env.WECHAT_PAY_PFX_PATH,
            notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL!,
        });

        // 验证回调通知签名
        const notification = payService.verifyNotification(body);

        // 处理支付结果
        if (notification.return_code === 'SUCCESS' && notification.result_code === 'SUCCESS') {
            console.log("支付成功通知处理中，订单号:", notification.out_trade_no);
            
            // 查找支付记录
            const submission = await prisma.submission.findFirst({
                where: { paymentId: notification.out_trade_no },
            });

            if (!submission) {
                 console.error("找不到对应订单:", notification.out_trade_no);
                return new Response(
                    `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`,
                    { headers: { 'Content-Type': 'text/xml' } }
                );
            }

            // 更新支付状态 - 仅在状态不是 PAID 时更新，防止重复处理
            if (submission.status !== 'PAID') {
                await prisma.submission.update({
                    where: { id: submission.id },
                    data: {
                        status: 'PAID',
                        tradeNo: notification.transaction_id,
                        paidAt: new Date(),
                        wxPayInfo: notification,
                    },
                });
                console.log("订单状态已更新为已支付。");

                // 记录支付日志
                await prisma.paymentLog.create({
                    data: {
                        submissionId: submission.id,
                        type: 'NOTIFY_SUCCESS',
                        content: notification,
                    },
                });
            } else {
                console.log("订单已经是已支付状态，忽略重复通知。");
            }

            // 返回成功给微信
            return new Response(
                `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`,
                { headers: { 'Content-Type': 'text/xml' } }
            );
        } else {
             console.log("支付未成功:", notification.return_msg || '未知原因');
             
             // 尝试查找订单以记录日志
             const submission = await prisma.submission.findFirst({
                 where: { paymentId: notification.out_trade_no },
                 select: { id: true }
             });

            // 记录失败日志
             await prisma.paymentLog.create({
                 data: {
                     submissionId: submission?.id || `UNKNOWN_${notification.out_trade_no || 'NO_OUT_TRADE_NO'}`,
                     type: 'NOTIFY_FAIL',
                     content: notification,
                 },
             });
            return new Response(
                 `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[支付结果未成功]]></return_msg></xml>`,
                 { headers: { 'Content-Type': 'text/xml' } }
             );
        }

    } catch (error: any) {
        console.error('支付通知处理失败:', error.message);
        
        // 尝试记录错误日志
        try {
             const notificationData = error?.data || error?.response?.data || body || '无数据';
             // 尝试从错误中解析 out_trade_no
             let outTradeNo = 'UNKNOWN_ERROR';
             try {
                 if (body) {
                     const parsedBody = new XMLParser({ ignoreAttributes: true }).parse(body);
                     outTradeNo = parsedBody?.xml?.out_trade_no || outTradeNo;
                 }
             } catch (parseError) {
                 console.error("无法解析XML内容");
             }

             await prisma.paymentLog.create({
                 data: {
                     submissionId: outTradeNo,
                     type: 'NOTIFY_ERROR',
                     content: {
                         errorMessage: error.message,
                         errorStack: error.stack,
                         requestBody: notificationData
                     },
                 },
             });
        } catch (logError) {
             console.error("写入错误日志失败");
        }

        // 返回失败给微信
        return new Response(
            `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[服务器内部错误]]></return_msg></xml>`,
            { headers: { 'Content-Type': 'text/xml' } }
        );
    }
}