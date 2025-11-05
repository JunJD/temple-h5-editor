'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { QRCodeSVG } from 'qrcode.react'

function getOrigin() {
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export default function QrcodeButton({ issueId, title }: { issueId: string; title?: string }) {
  const [open, setOpen] = useState(false)
  const qrUrl = useMemo(() => `${getOrigin()}/h5/${issueId}`, [issueId])

  const download = () => {
    const svgElement = document.getElementById('qr-code-goods') as unknown as SVGSVGElement
    if (!svgElement) return
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const serializer = new XMLSerializer()
      const svgStr = serializer.serializeToString(svgElement)
      const img = new Image()
      img.onload = function () {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const pngUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = pngUrl
        link.download = `${title || 'h5-page'}-qrcode.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)))
    } catch (e) {
      console.error('下载二维码失败', e)
    }
  }

  return (
    <>
      <Button size='sm' variant='outline' onClick={() => setOpen(true)}>二维码</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>页面二维码</DialogTitle>
            <DialogDescription>扫描下方二维码可访问该页面</DialogDescription>
          </DialogHeader>
          <div className='flex flex-col items-center justify-center p-4'>
            <div className='p-4 bg-white rounded-lg border border-gray-200'>
              <QRCodeSVG
                id='qr-code-goods'
                value={qrUrl}
                size={200}
                level={'H'}
                includeMargin
                title={`${title || '未命名页面'}的二维码`}
                bgColor={'#FFFFFF'}
                fgColor={'#000000'}
              />
            </div>
            <div className='mt-4 text-xs text-center text-muted-foreground break-all'>{qrUrl}</div>
          </div>
          <div className='flex justify-center mt-2'>
            <Button onClick={download}>下载二维码</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

