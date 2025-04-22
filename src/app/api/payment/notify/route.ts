import { getWechatPayService } from '@/lib/payment'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const body = await req.text()
        const payService = getWechatPayService()

        // TEMPORARY DEBUG LOGGING - REMOVE IMMEDIATELY AFTER TESTING
        console.log("DEBUG: API Key used for verification:", process.env.WECHAT_PAY_API_KEY); // Or however you access the key

        console.log("--- Raw Notification Body START ---");
        console.log(body);
        console.log("--- Raw Notification Body END ---");
        
        // 验证回调通知签名
        const notification = payService.verifyNotification(body)

        
        // 处理支付结果
        if (notification.return_code === 'SUCCESS' && notification.result_code === 'SUCCESS') {
            // 查找支付记录
            const submission = await prisma.submission.findFirst({
                where: { paymentId: notification.out_trade_no },
            })

            if (!submission) {
                return new Response(
                    `<xml>
            <return_code><![CDATA[FAIL]]></return_code>
            <return_msg><![CDATA[Order not found]]></return_msg>
          </xml>`,
                    { headers: { 'Content-Type': 'text/xml' } }
                )
            }

            // 更新支付状态
            await prisma.submission.update({
                where: { id: submission.id },
                data: {
                    status: 'PAID',
                    tradeNo: notification.transaction_id,
                    paidAt: new Date(),
                    wxPayInfo: notification,
                },
            })

            // 记录支付日志
            await prisma.paymentLog.create({
                data: {
                    submissionId: submission.id,
                    type: 'NOTIFY',
                    content: notification,
                },
            })

            // 返回成功
            return new Response(
                `<xml>
          <return_code><![CDATA[SUCCESS]]></return_code>
          <return_msg><![CDATA[OK]]></return_msg>
        </xml>`,
                { headers: { 'Content-Type': 'text/xml' } }
            )
        }

        // 返回失败
        return new Response(
            `<xml>
        <return_code><![CDATA[FAIL]]></return_code>
        <return_msg><![CDATA[Payment failed]]></return_msg>
      </xml>`,
            { headers: { 'Content-Type': 'text/xml' } }
        )
    } catch (error) {
        console.error('Payment notification failed:', error)
        return new Response(
            `<xml>
        <return_code><![CDATA[FAIL]]></return_code>
        <return_msg><![CDATA[Internal server error]]></return_msg>
      </xml>`,
            { headers: { 'Content-Type': 'text/xml' } }
        )
    }
}