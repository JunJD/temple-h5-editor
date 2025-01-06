'use client'

import { DynamicForm } from '@/components/DynamicForm'
import { useFormStore } from '@/store/form'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import React from 'react'

export default function IssuePage() {
  const params = useParams()
  const id = params.id as string
  const setConfig = useFormStore(state => state.setConfig)

  useEffect(() => {
    // 从 API 获取表单配置
    async function fetchConfig() {
      const response = await fetch(`/api/client/issues/${id}`)
      const data = await response.json()
      setConfig(data.formConfig)
    }
    fetchConfig()
  }, [id, setConfig])

  return (
    <div className="container mx-auto p-4">
      <DynamicForm />
    </div>
  )
} 