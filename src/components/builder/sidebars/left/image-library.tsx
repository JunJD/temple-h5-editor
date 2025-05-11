'use client'

import { useState, useEffect } from 'react'
import { Button, ScrollArea } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Plus, Trash2, Upload, Loader2, Copy, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'

interface ImageAsset {
  id: string
  name: string
  url: string
  createdAt: string
  previewUrl: string
}

export const ImageLibrary = () => {
  const [images, setImages] = useState<ImageAsset[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [newImageName, setNewImageName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
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

  // 复制URL
  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(`https://kls.wxkltx.cn${url}`)
      setCopiedId(id)
      toast({
        title: '复制成功',
        description: '图片URL已复制到剪贴板',
      })
      // 2秒后重置复制状态
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast({
        title: '复制失败',
        description: '请手动复制URL',
        variant: 'destructive',
      })
    }
  }

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: '文件类型错误',
        description: '请选择图片文件',
        variant: 'destructive',
      })
      return
    }

    // 验证文件大小（限制为 5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '文件过大',
        description: '图片大小不能超过 5MB',
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // 上传图片
  const handleUpload = async () => {
    if (!selectedFile || !newImageName) {
      toast({
        title: '上传失败',
        description: '请填写图片名称并选择文件',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('name', newImageName)

      const response = await fetch('/api/image-assets', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('上传失败')

      const newImage = await response.json()
      setImages(prev => [newImage, ...prev])
      setNewImageName('')
      setSelectedFile(null)
      setPreviewUrl(null)
      
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
      setUploadProgress(0)
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
    <div className="space-y-4 h-full flex flex-col">
      {/* 上传按钮 */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            上传图片
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>上传图片</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">图片名称</Label>
              <Input
                id="name"
                value={newImageName}
                onChange={(e) => setNewImageName(e.target.value)}
                placeholder="请输入图片名称"
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">选择图片</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('file')?.click()}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  选择图片
                </Button>
              </div>
              {selectedFile && (
                <div className="text-sm text-muted-foreground">
                  已选择: {selectedFile.name}
                </div>
              )}
            </div>
            {previewUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <img
                  src={previewUrl}
                  alt="预览"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <div className="text-sm text-muted-foreground">
                  正在上传... {uploadProgress}%
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !newImageName || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  上传中...
                </>
              ) : (
                '上传'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 图片列表 */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {images.map((image) => (
            <div key={image.id} className="group relative">
              <div className="aspect-square w-full overflow-hidden rounded-lg border bg-muted">
              <img
                src={image.previewUrl}
                alt={image.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleCopyUrl(image.previewUrl, image.id)}
                  className="h-8 w-8 rounded-full"
                >
                  {copiedId === image.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(image.id)}
                  className="h-8 w-8 rounded-full"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-sm font-medium truncate flex-1">{image.name}</div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleCopyUrl(image.previewUrl, image.id)}
              >
                {copiedId === image.id ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        ))}
        </div>
      </ScrollArea>
    </div>
  )
} 