'use client'

import { useState, useEffect } from 'react'
import { Button, ScrollArea } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Plus, Trash2, Upload, Loader2, Copy, Check, FileAudio } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'

interface AudioAsset {
  id: string
  name: string
  url: string
  createdAt: string
}

export const AudioLibrary = () => {
  const [audios, setAudios] = useState<AudioAsset[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [newAudioName, setNewAudioName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { toast } = useToast()

  // 获取音频列表
  const fetchAudios = async () => {
    try {
      const response = await fetch('/api/audio-assets')
      if (!response.ok) throw new Error('获取音频列表失败')
      const data = await response.json()
      setAudios(data)
    } catch (error) {
      toast({
        title: '获取音频列表失败',
        description: '请刷新页面重试',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchAudios()
  }, [])

  // 复制URL
  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      toast({
        title: '复制成功',
        description: '音频URL已复制到剪贴板',
      })
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

    if (!file.type.startsWith('audio/')) {
      toast({
        title: '文件类型错误',
        description: '请选择音频文件',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: '文件过大',
        description: '音频大小不能超过 10MB',
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)
  }

  // 上传音频
  const handleUpload = async () => {
    if (!selectedFile || !newAudioName) {
      toast({
        title: '上传失败',
        description: '请填写音频名称并选择文件',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('name', newAudioName)

      const response = await fetch('/api/audio-assets', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('上传失败')

      const newAudio = await response.json()
      setAudios(prev => [newAudio, ...prev])
      setNewAudioName('')
      setSelectedFile(null)
      
      toast({
        title: '上传成功',
        description: '音频已成功上传',
      })
    } catch (error) {
      toast({
        title: '上传失败',
        description: '音频上传失败，请重试',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // 删除音频
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/audio-assets?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('删除失败')

      setAudios(prev => prev.filter(audio => audio.id !== id))
      
      toast({
        title: '删除成功',
        description: '音频已删除',
      })
    } catch (error) {
      toast({
        title: '删除失败',
        description: '音频删除失败，请重试',
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
            上传音频
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>上传音频</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="audio-name">音频名称</Label>
              <Input
                id="audio-name"
                value={newAudioName}
                onChange={(e) => setNewAudioName(e.target.value)}
                placeholder="请输入音频名称"
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audio-file">选择音频</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="audio-file"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('audio-file')?.click()}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  选择文件
                </Button>
              </div>
              {selectedFile && (
                <div className="text-sm text-muted-foreground">
                  已选择: {selectedFile.name}
                </div>
              )}
            </div>
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
              disabled={!selectedFile || !newAudioName || isUploading}
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

      {/* 音频列表 */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {audios.map((audio) => (
            <div key={audio.id} className="group relative flex items-center gap-4 rounded-lg border p-2">
              <FileAudio className="h-6 w-6 text-muted-foreground" />
              <div className="flex-1 truncate">
                <div className="text-sm font-medium">{audio.name}</div>
                <audio src={audio.url} controls className="w-full h-10 mt-1" />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopyUrl(audio.url, audio.id)}
                  className="h-8 w-8"
                >
                  {copiedId === audio.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(audio.id)}
                  className="h-8 w-8 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 