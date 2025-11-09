import React from 'react'
import type { RenderOptions } from '../h5-sdk'
import { ModalShell, InputItem, TextareaItem } from '../common/form'

type Props = Partial<RenderOptions>

export default function Template(props: Props) {
  const goodsTitle = props.goodsTitle ?? '点灯时间2'
  return (
    <>
      {/* 顶部：独占大图 + 右上角音乐图标 */}
      <section id='hero' className='hero' aria-label='封面图'>
        <img
          id='hero-img'
          className='hero-img'
          src={'./assets/hero.png'}
          alt='封面'
        />
        <div id='music' className='stopped' data-url='https://tyfy.oss-cn-beijing.aliyuncs.com/香云赞.mp3'>
          <audio id='audio' loop preload='auto' autoPlay playsInline src='https://tyfy.oss-cn-beijing.aliyuncs.com/香云赞.mp3' />
          <div className='control'>
            <div className='control_after' />
          </div>
        </div>
      </section>

      {/* 顶部：点灯时间（商品） */}
      <section id='slots' className='slots-section' aria-label='点灯时间'>
        <div className='h5-header'>
          <div className='section-label'>
            <img src='./assets/icon-03.png' alt='' className='label-icon' />
            <span className='label-text'>{goodsTitle}</span>
          </div>
        </div>
        <div id='msg' className='h5-message'>加载中...</div>
        <div id='slots-grid' className='slots-grid hidden' />

        {/* 提供给外部表单/支付读取的隐藏字段 */}
        <input type='hidden' id='goods' name='goods' defaultValue='' />
        <input type='hidden' id='amount' name='amount' defaultValue='' />
      </section>

      {/* 名单登记榜（参考 formatTempList） */}
      <section id='board' className='board-list'>
        <div className='board-title'>名单登记榜</div>
        <div
          id='format-list'
          className='format-temp-list'
          data-auto-scroll='true'
          data-template='<span class="temp-item-date">${date2}</span>｜<span class="temp-item-name">${name}</span>｜<span class="temp-item-goods">${goods}</span>｜<span class="temp-item-value">${amount}</span>'
        />
      </section>

      {/* 支付弹窗 */}
      <ModalShell id='pay-mask'>
        <InputItem label='金额' id='money' className='juan_money' disabled suffix='元' />
        <InputItem label='姓名' id='username' placeholder='自愿填写' />
        <InputItem label='电话' id='phone' placeholder='自愿填写' />
        <TextareaItem label='留言' id='qifu' placeholder='自愿填写' />
        <div className='operate'>
          <div className='cancel' id='btn-cancel'>取消</div>
          <div className='confirm'>
            <button type='button' className='mui-btn mui-btn-block gopay' id='btn-confirm'>
              确定
            </button>
          </div>
        </div>
      </ModalShell>
    </>
  )
}
