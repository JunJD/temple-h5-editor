import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Submission } from '@/schemas';
import { formatDateTime } from '@/lib/date';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubmissionTableProps {
  submissions: Submission[];
}

const PaymentStatusMap = {
  PENDING: { label: '待支付', color: 'default' },
  NOTPAY: { label: '未支付', color: 'secondary' },
  CLOSED: { label: '已关闭', color: 'secondary' },
  PAID: { label: '支付成功', color: 'outline' },
  FAILED: { label: '支付失败', color: 'destructive' },
  REFUNDING: { label: '退款中', color: 'destructive' },
  REFUNDED: { label: '已退款', color: 'destructive' },
} as const;

export function SubmissionTable({ submissions }: SubmissionTableProps) {
  return (
    <div className="w-full">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>支付金额</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>商品</TableHead>
              <TableHead>电话</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>支付时间</TableHead>
              <TableHead>过期时间</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="w-[300px]">表单数据</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => {
              const statusConfig = PaymentStatusMap[submission.status] || { label: submission.status, color: 'default' };
              // 将 formData 对象的所有键值对转换为字符串
              const formDataStr = Object.entries(submission.formData as Record<string, any>)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');

              return (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    {submission.amount.toFixed(2)} {submission.currency}
                  </TableCell>
                  <TableCell className="font-medium">
                    {submission.formData.name} 
                  </TableCell>
                  <TableCell className="font-medium">
                    {submission.goods1}/{submission.goods2} 
                  </TableCell>
                  <TableCell className="font-medium">
                    {submission.formData.tel ? submission.formData.tel : submission.formData.phone} 
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.color}>{statusConfig.label}{submission.status}</Badge>
                  </TableCell>
                  <TableCell>{submission.paidAt ? formatDateTime(submission.paidAt) : '-'}</TableCell>
                  <TableCell>{submission.expiredAt ? formatDateTime(submission.expiredAt) : '-'}</TableCell>
                  <TableCell>{formatDateTime(submission.createdAt)}</TableCell>
                  <TableCell>{formatDateTime(submission.updatedAt)}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{formDataStr}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{formDataStr}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
  );
}