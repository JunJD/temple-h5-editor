'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ImageAsset {
  id: string
  name: string
  url: string
  createdAt: string
}

export const ImageLibrary = () => {
  const [images, setImages] = useState<ImageAsset[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [newImageName, setNewImageName] = useState('')
  const { toast } = useToast()

  // 获取图片列表
  const fetchImages = async () => {
    try {
      const response = await fetch('/api/image-assets')
      if (!response.ok) throw new Error('获取图片列表失败')
      const data = await response.json()
      setImages(data)
    } catch (error) {
      toast({
        title: '获取图片列表失败',
        description: '请刷新页面重试',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  // 上传图片
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !newImageName) {
      toast({
        title: '上传失败',
        description: '请填写图片名称并选择文件',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', newImageName)

      const response = await fetch('/api/image-assets', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('上传失败')

      const newImage = await response.json()
      setImages(prev => [newImage, ...prev])
      setNewImageName('')
      
      toast({
        title: '上传成功',
        description: '图片已成功上传到图片库',
      })
    } catch (error) {
      toast({
        title: '上传失败',
        description: '图片上传失败，请重试',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  // 删除图片
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/image-assets?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('删除失败')

      setImages(prev => prev.filter(img => img.id !== id))
      
      toast({
        title: '删除成功',
        description: '图片已从图片库中删除',
      })
    } catch (error) {
      toast({
        title: '删除失败',
        description: '图片删除失败，请重试',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* 上传按钮 */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            上传图片
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上传图片</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">图片名称</Label>
              <Input
                id="name"
                value={newImageName}
                onChange={(e) => setNewImageName(e.target.value)}
                placeholder="请输入图片名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">选择图片</Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={isUploading}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 图片列表 */}
      <div className="grid grid-cols-2 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(image.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-1 text-sm truncate">{image.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
} 