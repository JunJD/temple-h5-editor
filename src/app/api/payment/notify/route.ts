import { WechatPayV2Service } from '@/lib/payment'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'


export async function POST(req: NextRequest) {
    let body = '';

    try {

        body = await req.text();

        const currentApiKey = process.env.WECHAT_PAY_KEY;

        if (!currentApiKey) {
             console.error("FATAL ERROR: WECHAT_PAY_KEY is undefined or empty in process.env!");
             return new Response(
                `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[Server configuration error: Missing API Key]]></return_msg></xml>`,
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
        const notification = payService.verifyNotification(body);

        console.log('notification', JSON.stringify(notification, null, 2));
        
        if (notification.return_code === 'SUCCESS' && notification.result_code === 'SUCCESS') {
            console.log("Processing successful WeChat payment notification for out_trade_no:", notification.out_trade_no);
            
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
                console.log(`Submission ${submission.id} status updated to PAID.`);

                await prisma.paymentLog.create({
                    data: {
                        submissionId: submission.id,
                        type: 'NOTIFY_SUCCESS',
                        content: notification,
                    },
                });

                // 如果订单包含商品明细（create-customer 流程），则更新库存与已支付数量
                try {
                    const formData: any = submission.formData as any
                    const goodsPayload = formData?.goods
                    const items = Array.isArray(goodsPayload?.items) ? goodsPayload.items : []
                    if (items.length > 0) {
                        await prisma.$transaction(async (tx) => {
                            for (const it of items) {
                                const gid = String(it.id || '')
                                const qty = Math.max(0, Number(it.quantity || 0))
                                if (!gid || qty <= 0) continue
                                const res = await tx.good.updateMany({
                                    where: {
                                        id: gid,
                                        issueId: submission.issueId,
                                        quantity: { gte: qty },
                                    },
                                    data: {
                                        quantity: { decrement: qty },
                                        sold: { increment: qty },
                                    },
                                })
                                if (res.count === 0) {
                                    // 库存不足或商品不存在，记录日志但不影响通知成功返回
                                    await tx.paymentLog.create({
                                        data: {
                                            submissionId: submission.id,
                                            type: 'STOCK_SHORTAGE',
                                            content: { goodId: gid, quantity: qty, message: 'Insufficient stock or good not found' },
                                        },
                                    })
                                }
                            }
                        })
                    }
                } catch (stockErr) {
                    console.error('更新库存/已支付数量失败:', stockErr)
                    // 不中断流程，仅记录错误，避免影响微信回调应答
                    try {
                        await prisma.paymentLog.create({
                            data: {
                                submissionId: submission.id,
                                type: 'STOCK_UPDATE_ERROR',
                                content: { error: (stockErr as any)?.message || String(stockErr) },
                            },
                        })
                    } catch {}
                }
            } else {
                console.log(`Submission ${submission.id} status already PAID. Ignoring duplicate notification.`); // 保留重复通知日志
            }
            return new Response(
                `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`,
                { headers: { 'Content-Type': 'text/xml' } }
            );
        } else {
             console.warn("Received non-SUCCESS WeChat notification:", JSON.stringify(notification)); // 保留警告日志
             
             const submission = await prisma.submission.findFirst({
                 where: { paymentId: notification.out_trade_no },
                 select: { id: true }
             });

             await prisma.paymentLog.create({
                 data: {
                     submissionId: submission?.id || `UNKNOWN_${notification.out_trade_no || 'NO_OUT_TRADE_NO'}`,
                     type: 'NOTIFY_FAIL',
                     content: notification,
                 },
             });
            return new Response(
                 `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[Payment result not SUCCESS]]></return_msg></xml>`,
                 { headers: { 'Content-Type': 'text/xml' } }
             );
        }

    } catch (error: any) {
        console.error('Payment notification processing failed:', error); // 保留异常日志
        
        try {
             const notificationData = error?.data || error?.response?.data || body || 'No body data available';
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
             console.error("Failed to write error PaymentLog:", logError);
        }

        return new Response(
            `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[Internal server error]]></return_msg></xml>`,
            { headers: { 'Content-Type': 'text/xml' } }
        );
    }
}
