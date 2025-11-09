import React from 'react'
import type { RenderOptions } from '../h5-sdk'

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
          src={'https://kls.wxkltx.cn/api/image-assets/preview/1761977951391-xgm60d.jpg'}
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
            <img src='/templates/assets/icon-03.png' alt='' className='label-icon' />
            <span className='label-text'>{goodsTitle}</span>
          </div>
          <button type='button' id='btn-refresh' className='h5-refresh' aria-label='刷新'>
            刷新
          </button>
        </div>
        <div id='msg' className='h5-message'>加载中...</div>
        <div id='slots-grid' className='slots-grid hidden' />
        <div id='summary' className='summary hidden'>
          <span>
            合计 <strong id='total'>¥0.00</strong>
          </span>
          <span>
            <button id='btn-clear' className='h5-refresh' type='button'>清空2</button>
            <button
              id='btn-pay'
              className='h5-refresh'
              type='button'
              style={{ marginLeft: 8, background: '#111827', color: '#fff', borderColor: '#111827' }}
            >
              去支付
            </button>
          </span>
        </div>

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
      <div id='pay-mask' className='mask' aria-hidden='true'>
        <div className='mask_content'>
          <div className='input_panel1' style={{ display: 'block' }}>
            <div className='input_panel2'>
              <div className='title2' />
              <div className='input_item'>
                <span>金额：</span>
                <input type='text' className='juan_money' id='money' disabled placeholder='' />
                <span className='yuan'>元</span>
              </div>
              <div className='input_item'>
                <span>姓名：</span>
                <input type='text' id='username' placeholder='自愿填写' />
              </div>
              <div className='input_item'>
                <span>电话：</span>
                <input type='text' id='phone' placeholder='自愿填写' />
              </div>
              <div className='input_item' style={{ height: 'auto', alignItems: 'flex-start', position: 'relative', display: 'block' }}>
                <span>留言：</span>
                <textarea id='qifu' placeholder='自愿填写' />
              </div>
              <div className='operate'>
                <div className='cancel' id='btn-cancel'>取消</div>
                <div className='confirm'>
                  <button type='button' className='mui-btn mui-btn-block gopay' id='btn-confirm'>
                    确定
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
