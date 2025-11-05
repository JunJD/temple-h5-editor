"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button, Input, Textarea, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'

type Good = {
  id: string
  title: string
  description?: string | null
  imageUrl?: string | null
  price: number
  currency: string
  quantity: number
  createdAt?: string
}

export default function GoodsManager({ issueId, initial }: { issueId: string; initial?: Good[] }) {
  const [goods, setGoods] = useState<Good[]>(initial || [])
  const [loading, setLoading] = useState(false)

  // form state for create/update
  const [form, setForm] = useState<Omit<Good, 'id'>>({
    title: '',
    description: '',
    imageUrl: '',
    price: 0,
    currency: 'CNY',
    quantity: 0,
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const isValid = useMemo(() => form.title && form.price >= 0 && Number.isFinite(form.price) && Number.isInteger(form.quantity), [form])

  useEffect(() => {
    if (!initial) {
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueId])

  async function refresh() {
    setLoading(true)
    try {
      const res = await fetch(`/api/issues/${issueId}/goods`)
      const data = await res.json()
      setGoods(data || [])
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ title: '', description: '', imageUrl: '', price: 0, currency: 'CNY', quantity: 0 })
    setEditingId(null)
  }

  async function handleSubmit() {
    if (!isValid) return
    setLoading(true)
    try {
      if (editingId) {
        const res = await fetch(`/api/issues/${issueId}/goods/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error('Update failed')
      } else {
        const res = await fetch(`/api/issues/${issueId}/goods`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error('Create failed')
      }
      resetForm()
      await refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit(g: Good) {
    setEditingId(g.id)
    setForm({
      title: g.title,
      description: g.description || '',
      imageUrl: g.imageUrl || '',
      price: g.price,
      currency: g.currency,
      quantity: g.quantity,
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('确认删除该商品？')) return
    setLoading(true)
    try {
      await fetch(`/api/issues/${issueId}/goods/${id}`, { method: 'DELETE' })
      await refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
        <div>
          <label className="block mb-1 text-sm text-muted-foreground">标题</label>
          <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder='商品标题' />
        </div>
        <div>
          <label className="block mb-1 text-sm text-muted-foreground">图片 URL</label>
          <Input value={form.imageUrl || ''} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder='https://...' />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm text-muted-foreground">描述</label>
          <Textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder='商品描述' />
        </div>
        <div>
          <label className="block mb-1 text-sm text-muted-foreground">价格</label>
          <Input type='number' value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block mb-1 text-sm text-muted-foreground">币种</label>
          <Input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
        </div>
        <div>
          <label className="block mb-1 text-sm text-muted-foreground">库存数量</label>
          <Input type='number' value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value || '0', 10) })} />
        </div>
        <div className="flex items-end gap-2">
          <Button disabled={!isValid || loading} onClick={handleSubmit}>{editingId ? '保存修改' : '新增商品'}</Button>
          {editingId && (
            <Button variant='outline' onClick={resetForm}>取消编辑</Button>
          )}
        </div>
      </div>

      <Table>
        <TableCaption>商品列表</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>图片</TableHead>
            <TableHead>标题</TableHead>
            <TableHead>价格</TableHead>
            <TableHead>库存</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goods.map(g => (
            <TableRow key={g.id}>
              <TableCell>
                {g.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.imageUrl} alt={g.title} className='w-12 h-12 object-cover rounded' />
                ) : (
                  <span className='text-muted-foreground'>无</span>
                )}
              </TableCell>
              <TableCell>{g.title}</TableCell>
              <TableCell>{g.price} {g.currency}</TableCell>
              <TableCell>{g.quantity}</TableCell>
              <TableCell className='space-x-2'>
                <Button size='sm' variant='outline' onClick={() => handleEdit(g)}>编辑</Button>
                <Button size='sm' variant='destructive' onClick={() => handleDelete(g.id)}>删除</Button>
              </TableCell>
            </TableRow>
          ))}
          {goods.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <div className='text-center text-sm text-muted-foreground'>暂无商品</div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

