'use client'

import { Search, Calendar, X, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui'
import { Calendar as CalendarComponent } from '@/components/ui'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui'
import { Input } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

export function IssueSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [mounted, setMounted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [searchState, setSearchState] = useState({
        keyword: searchParams.get('keyword') ?? '',
        startDate: searchParams.get('startDate') ?? '',
        endDate: searchParams.get('endDate') ?? '',
        status: searchParams.get('status') ?? 'all'
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSearch = async (params: URLSearchParams) => {
        setIsLoading(true)
        try {
            await router.push(`/client/issues?${params.toString()}`)
        } finally {
            setTimeout(() => {
                setIsLoading(false)
            }, 200)
        }
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const params = new URLSearchParams()

        if (searchState.keyword) {
            params.set('keyword', searchState.keyword)
        }
        if (searchState.startDate) {
            params.set('startDate', searchState.startDate)
        }
        if (searchState.endDate) {
            params.set('endDate', searchState.endDate)
        }
        if (searchState.status && searchState.status !== 'all') {
            params.set('status', searchState.status)
        }

        handleSearch(params)
    }

    const onDateSelect = (name: 'startDate' | 'endDate', date: Date | undefined) => {
        setSearchState(prev => ({
            ...prev,
            [name]: date ? format(date, 'yyyy-MM-dd') : ''
        }))
    }

    const clearKeyword = () => {
        setSearchState(prev => ({ ...prev, keyword: '' }))
    }

    const clearSearch = () => {
        setSearchState({
            keyword: '',
            startDate: '',
            endDate: '',
            status: 'all'
        })
        handleSearch(new URLSearchParams())
    }

    const hasFilters = !!(searchState.keyword || searchState.startDate || searchState.endDate || (searchState.status && searchState.status !== 'all'))

    return (
        <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
                <Input
                    type="text"
                    name="keyword"
                    placeholder="搜索标题或描述..."
                    value={searchState.keyword}
                    onChange={(e) => setSearchState(prev => ({ ...prev, keyword: e.target.value }))}
                    className="w-full pr-8"
                />
                {mounted && searchState.keyword && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={clearKeyword}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className={cn(
                                'justify-start text-left font-normal min-w-[140px]',
                                !searchState.startDate && 'text-muted-foreground'
                            )}
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            {searchState.startDate ? format(new Date(searchState.startDate), 'yyyy-MM-dd') : '开始日期'}
                            {mounted && searchState.startDate && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="ml-auto h-5 w-5"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDateSelect('startDate', undefined)
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                            mode="single"
                            selected={searchState.startDate ? new Date(searchState.startDate) : undefined}
                            onSelect={(date) => onDateSelect('startDate', date)}
                        />
                    </PopoverContent>
                </Popover>
                <span className="text-muted-foreground">至</span>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className={cn(
                                'justify-start text-left font-normal min-w-[140px]',
                                !searchState.endDate && 'text-muted-foreground'
                            )}
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            {searchState.endDate ? format(new Date(searchState.endDate), 'yyyy-MM-dd') : '结束日期'}
                            {mounted && searchState.endDate && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="ml-auto h-5 w-5"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDateSelect('endDate', undefined)
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                            mode="single"
                            selected={searchState.endDate ? new Date(searchState.endDate) : undefined}
                            onSelect={(date) => onDateSelect('endDate', date)}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <Select
                value={searchState.status}
                onValueChange={(value) => setSearchState(prev => ({ ...prev, status: value }))}
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="发布状态" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">--是否发布--</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="draft">未发布</SelectItem>
                </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
                <Button type="submit" size="sm" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4 mr-2" />
                    )}
                    搜索
                </Button>
                {mounted && hasFilters && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        disabled={isLoading}
                    >
                        <X className="w-4 h-4 mr-2" />
                        清空
                    </Button>
                )}
            </div>
        </form>
    )
} 