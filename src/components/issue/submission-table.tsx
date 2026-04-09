"use client";

import { useMemo, useState } from 'react';
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

type SubmissionGoodsItem = {
  title?: string
  price?: number
  quantity?: number
}

type SubmissionViewModel = {
  id: string
  name: string
  specificType: string
  projectCategory: string
  amount: string
  phone: string
  message: string
  unitPrice: string
  quantity: string
  time: string
  statusLabel: string
  formDataText: string
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

function readFormData(submission: Submission) {
  return ((submission.formData ?? {}) as Record<string, any>)
}

function pickFirstValue(source: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value
    }
  }
  return ''
}

function formatCellValue(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return '-'
  }
  return String(value)
}

function getGoodsItems(submission: Submission) {
  const formData = readFormData(submission)
  const goodsPayload = formData.goods

  if (!goodsPayload) {
    return [] as SubmissionGoodsItem[]
  }

  if (typeof goodsPayload === 'string') {
    try {
      const parsed = JSON.parse(goodsPayload)
      return Array.isArray(parsed?.items) ? parsed.items : []
    } catch {
      return []
    }
  }

  return Array.isArray(goodsPayload.items) ? goodsPayload.items : []
}

function joinGoodsValues(
  items: SubmissionGoodsItem[],
  getter: (item: SubmissionGoodsItem) => unknown
) {
  const values = items
    .map(item => getter(item))
    .filter(value => value !== undefined && value !== null && value !== '')

  if (values.length === 0) {
    return '-'
  }

  return values.join(' / ')
}

function formatFormData(submission: Submission) {
  const formData = readFormData(submission)

  return Object.entries(formData)
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `${key}: ${JSON.stringify(value)}`
      }
      return `${key}: ${value}`
    })
    .join(', ')
}

function buildSubmissionViewModel(submission: Submission): SubmissionViewModel {
  const formData = readFormData(submission)
  const goodsItems = getGoodsItems(submission)
  const statusConfig =
    PaymentStatusMap[submission.status as keyof typeof PaymentStatusMap] ||
    { label: submission.status, color: 'default' as const }
  const rawGoodsValue = formData.goods
  const unitPriceFromGoodsField =
    typeof rawGoodsValue === 'string' || typeof rawGoodsValue === 'number'
      ? formatCellValue(rawGoodsValue)
      : '-'

  const specificType = submission.goods1 || pickFirstValue(formData, ['goods1', '具体类型']) || goodsItems[0]?.title || ''
  const projectCategory = submission.goods2 || pickFirstValue(formData, ['goods2', '项目分类']) || goodsItems[1]?.title || ''
  const unitPrice =
    unitPriceFromGoodsField !== '-'
      ? unitPriceFromGoodsField
      : joinGoodsValues(goodsItems, item => (typeof item.price === 'number' ? item.price.toFixed(2) : '')) !== '-'
      ? joinGoodsValues(goodsItems, item => (typeof item.price === 'number' ? item.price.toFixed(2) : ''))
      : formatCellValue(pickFirstValue(formData, ['unitPrice', 'price', '单价']))
  const quantity =
    joinGoodsValues(goodsItems, item => item.quantity) !== '-'
      ? joinGoodsValues(goodsItems, item => item.quantity)
      : formatCellValue(pickFirstValue(formData, ['quantity', 'count', '数量']))
  const time = submission.paidAt || submission.createdAt

  return {
    id: submission.id,
    name: formatCellValue(pickFirstValue(formData, ['name', '姓名', '称呼'])),
    specificType: formatCellValue(specificType),
    projectCategory: formatCellValue(projectCategory),
    amount: Number(submission.amount || 0).toFixed(2),
    phone: formatCellValue(pickFirstValue(formData, ['tel', 'phone', 'mobile', '电话'])),
    message: formatCellValue(pickFirstValue(formData, ['wish', 'qifu', 'message', 'msg', 'remark', '留言'])),
    unitPrice,
    quantity,
    time: time ? formatDateTime(time) : '-',
    statusLabel: statusConfig.label,
    formDataText: formatFormData(submission),
  }
}

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
  const rows = useMemo(
    () => submissions.map(submission => ({ submission, view: buildSubmissionViewModel(submission) })),
    [submissions]
  )

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
      '姓名',
      '具体类型',
      '项目分类',
      '金额',
      '电话',
      '留言',
      '单价',
      '数量',
      '时间',
      '状态标签',
      '表单数据'
    ];

    const csvRows = [headers.join(',')];

    rows.forEach(({ view }) => {
      const row = [
        view.name,
        view.specificType,
        view.projectCategory,
        view.amount,
        view.phone,
        view.message,
        view.unitPrice,
        view.quantity,
        view.time,
        view.statusLabel,
        `"${view.formDataText.replace(/"/g, '""')}"`
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
              <TableHead>姓名</TableHead>
              <TableHead>具体类型</TableHead>
              <TableHead>项目分类</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>电话</TableHead>
              <TableHead>留言</TableHead>
              <TableHead>单价</TableHead>
              <TableHead>数量</TableHead>
              <TableHead>时间</TableHead>
              <TableHead>状态标签</TableHead>
              <TableHead className="w-[300px]">表单数据</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ submission, view }) => {
              const statusConfig =
                PaymentStatusMap[submission.status as keyof typeof PaymentStatusMap] ||
                { label: submission.status, color: 'default' as const };
              return (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{view.name}</TableCell>
                  <TableCell className="font-medium">{view.specificType}</TableCell>
                  <TableCell className="font-medium">{view.projectCategory}</TableCell>
                  <TableCell className="font-medium">{view.amount}</TableCell>
                  <TableCell className="font-medium">{view.phone}</TableCell>
                  <TableCell className="font-medium">{view.message}</TableCell>
                  <TableCell className="font-medium">{view.unitPrice}</TableCell>
                  <TableCell className="font-medium">{view.quantity}</TableCell>
                  <TableCell>{view.time}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.color}>{view.statusLabel}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{view.formDataText}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{view.formDataText}</p>
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
              <Label htmlFor="amount">金额</Label>
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
              <Label htmlFor="paidAt">时间</Label>
              <Input id="paidAt" type="datetime-local" value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goods1">具体类型</Label>
              <Input id="goods1" value={form.goods1} onChange={(e) => setForm({ ...form, goods1: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goods2">项目分类</Label>
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
