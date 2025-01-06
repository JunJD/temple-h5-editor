'use client'

import { DynamicForm } from '@/components/DynamicForm'
import { useFormStore } from '@/store/form'
import { useEffect } from 'react'

export default function IssuePage({ params }: { params: { id: string } }) {
  const setConfig = useFormStore(state => state.setConfig)

  useEffect(() => {
    // 从 API 获取表单配置
    async function fetchConfig() {
      const response = await fetch(`/api/client/issues/${params.id}`)
      const data = await response.json()
      setConfig(data.formConfig)
    }
    fetchConfig()
  }, [params.id, setConfig])

  return (
    <div className="container mx-auto p-4">
      <DynamicForm />
    </div>
  )
} 