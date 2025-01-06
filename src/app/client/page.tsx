import Link from 'next/link'
import { GoPlus } from 'react-icons/go'
import { FaWpforms } from 'react-icons/fa'
import { MdPayments } from 'react-icons/md'
import { BsListUl } from 'react-icons/bs'
import { HiTemplate } from 'react-icons/hi'

import { Button } from '@/components/ui'

export default function Page() {
  return (
    <>
      <section className='space-y-6 pb-8 py-8 md:py-16 lg:py-20'>
        <div className='container flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto'>
          <h1 className='font-bold leading-normal text-3xl sm:text-5xl md:text-6xl lg:text-7xl'>
            H5 页面生成器
          </h1>
          <p className='text-xl text-muted-foreground'>快速创建支持支付和表单的营销落地页</p>
          <div className='flex gap-x-2'>
            <Link href='/client/issues/create'>
              <Button>
                <GoPlus className="mr-2" />
                创建页面
              </Button>
            </Link>
            <Link href='/client/issues'>
              <Button variant='outline'>
                <BsListUl className="mr-2" />
                我的页面
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <section className='container space-y-6 py-8 dark:bg-transparent md:py-12 lg:py-24 mx-auto'>
        <div className='mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center'>
          <h2 className='font-bold text-2xl leading-[1.1] sm:text-2xl md:text-4xl'>
            核心功能
          </h2>
        </div>
        <div className='mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3'>
          <div className='relative overflow-hidden rounded-lg border bg-background p-2'>
            <div className='flex h-[180px] flex-col justify-center gap-y-4 items-center rounded-md p-6'>
              <HiTemplate size={40} />
              <div className='space-y-2'>
                <h3 className='font-bold'>可视化编辑</h3>
                <p className='text-sm text-muted-foreground'>
                  拖拽式编辑器，所见即所得
                </p>
              </div>
            </div>
          </div>
          <div className='relative overflow-hidden rounded-lg border bg-background p-2'>
            <div className='flex h-[180px] flex-col justify-center gap-y-4 items-center rounded-md p-6'>
              <FaWpforms size={40} />
              <div className='space-y-2'>
                <h3 className='font-bold'>智能表单</h3>
                <p className='text-sm text-muted-foreground'>
                  支持联动逻辑的动态表单
                </p>
              </div>
            </div>
          </div>
          <div className='relative overflow-hidden rounded-lg border bg-background p-2'>
            <div className='flex h-[180px] flex-col justify-center gap-y-4 items-center rounded-md p-6'>
              <MdPayments size={40} />
              <div className='space-y-2'>
                <h3 className='font-bold'>支付功能</h3>
                <p className='text-sm text-muted-foreground'>
                  集成微信支付，轻松收款
                </p>
              </div>
            </div>
          </div>
          <div className='relative overflow-hidden rounded-lg border bg-background p-2'>
            <div className='flex h-[180px] flex-col justify-center gap-y-4 items-center rounded-md p-6'>
              <BsListUl size={40} />
              <div className='space-y-2'>
                <h3 className='font-bold'>订单管理</h3>
                <p className='text-sm text-muted-foreground'>
                  自定义列表视图，订单一目了然
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
