"use client";

import React, { useMemo, useState } from 'react';
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
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui";
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [current, setCurrent] = useState<Submission | null>(null)
  const [form, setForm] = useState({
    amount: '',
    currency: 'CNY',
    status: 'PENDING',
    goods1: '',
    goods2: '',
    paidAt: '',
    formData: '' as string,
  })

  const statusOptions = useMemo(() => ([
    'PENDING', 'NOTPAY', 'CLOSED', 'PAID', 'FAILED', 'REFUNDING', 'REFUNDED'
  ] as const), [])

  const onEdit = (s: Submission) => {
    setCurrent(s)
    setForm({
      amount: String(s.amount ?? ''),
      currency: s.currency ?? 'CNY',
      status: (s.status as any) ?? 'PENDING',
      goods1: (s as any).goods1 ?? '',
      goods2: (s as any).goods2 ?? '',
      paidAt: s.paidAt ? new Date(s.paidAt).toISOString().slice(0, 16) : '', // yyyy-MM-ddTHH:mm
      formData: JSON.stringify(s.formData ?? {}, null, 2),
    })
    setOpen(true)
  }

  const onDelete = async (s: Submission) => {
    if (!confirm('确定删除该提交记录？此操作不可撤销')) return
    try {
      const resp = await fetch(`/api/submissions/${s.id}`, { method: 'DELETE' })
      const json = await resp.json()
      if (!resp.ok || !json?.success) throw new Error(json?.error || '删除失败')
      toast({ title: '删除成功' })
      router.refresh()
    } catch (e: any) {
      toast({ title: '删除失败', description: e?.message || '请稍后重试', variant: 'destructive' })
    }
  }

  const onSave = async () => {
    if (!current) return
    setSaving(true)
    try {
      let parsedFormData: Record<string, any> = {}
      if (form.formData?.trim()) {
        try {
          parsedFormData = JSON.parse(form.formData)
        } catch (e) {
          throw new Error('表单数据 JSON 解析失败')
        }
      }

      const body: Record<string, any> = {
        amount: Number(form.amount) || 0,
        currency: form.currency,
        status: form.status,
        goods1: form.goods1,
        goods2: form.goods2,
        formData: parsedFormData,
      }
      if (form.paidAt) body.paidAt = new Date(form.paidAt).toISOString()

      const resp = await fetch(`/api/submissions/${current.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await resp.json()
      if (!resp.ok || !json?.success) throw new Error(json?.error || '更新失败')
      toast({ title: '保存成功' })
      setOpen(false)
      setCurrent(null)
      router.refresh()
    } catch (e: any) {
      toast({ title: '保存失败', description: e?.message || '请稍后重试', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const exportToCSV = () => {
    if (!submissions || submissions.length === 0) {
      alert('没有数据可以导出');
      return;
    }

    const headers = [
      '支付金额',
      '货币',
      '姓名',
      '商品1',
      '商品2',
      '电话',
      '状态标签',
      '状态值',
      '支付时间',
      '创建时间',
      '更新时间',
      '表单数据'
    ];

    const csvRows = [headers.join(',')];

    submissions.forEach(submission => {
      const statusConfig = PaymentStatusMap[submission.status] || { label: submission.status, color: 'default' };
      const formDataStr = Object.entries(submission.formData as Record<string, any>)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');

      const row = [
        submission.amount.toFixed(2),
        submission.currency,
        submission.formData.name || '',
        submission.goods1 || '',
        submission.goods2 || '',
        submission.formData.tel || submission.formData.phone || '',
        statusConfig.label,
        submission.status,
        submission.paidAt ? formatDateTime(submission.paidAt) : '-',
        formatDateTime(submission.createdAt),
        formatDateTime(submission.updatedAt),
        `"${formDataStr.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'submissions.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-end">
        <Button onClick={exportToCSV}>导出 CSV</Button>
      </div>
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
              <TableHead>创建时间</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="w-[300px]">表单数据</TableHead>
              <TableHead>操作</TableHead>
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
                  <TableCell className="space-x-2 whitespace-nowrap">
                    <Button size="sm" variant="outline" onClick={() => onEdit(submission)}>编辑</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(submission)}>删除</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TooltipProvider>

      {/* 编辑弹窗 */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setCurrent(null) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑提交记录</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="amount">支付金额</Label>
              <Input id="amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">货币</Label>
              <Input id="currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidAt">支付时间</Label>
              <Input id="paidAt" type="datetime-local" value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goods1">商品1</Label>
              <Input id="goods1" value={form.goods1} onChange={(e) => setForm({ ...form, goods1: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goods2">商品2</Label>
              <Input id="goods2" value={form.goods2} onChange={(e) => setForm({ ...form, goods2: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="formData">表单数据(JSON)</Label>
              <Textarea id="formData" rows={8} value={form.formData} onChange={(e) => setForm({ ...form, formData: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>取消</Button>
            <Button onClick={onSave} disabled={saving}>{saving ? '保存中...' : '保存'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
