import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

interface AudioConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (config: { enabled: boolean; url: string }) => void
  initialConfig: {
    enabled: boolean
    url: string
  }
}

export function AudioConfigDialog({
  open,
  onOpenChange,
  onSave,
  initialConfig,
}: AudioConfigDialogProps) {
  const [enabled, setEnabled] = useState(initialConfig.enabled)
  const [url, setUrl] = useState(initialConfig.url)

  const handleSave = () => {
    onSave({ enabled, url })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>背景音乐设置</DialogTitle>
          <DialogDescription>
            设置页面的背景音乐，支持自动播放
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="audio-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label htmlFor="audio-enabled">启用背景音乐</Label>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="audio-url" className="col-span-4">
              音频链接
            </Label>
            <Input
              id="audio-url"
              className="col-span-4"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="请输入音频文件链接"
              disabled={!enabled}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            保存设置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 