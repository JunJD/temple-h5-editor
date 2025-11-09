import React from 'react'
import type { RenderOptions } from '../h5-sdk'

type Props = Partial<RenderOptions>

export default function Template(props: Props) {
  const goodsTitle = props.goodsTitle ?? '点灯时间'
  return (
    <>
      {/* 顶部：点灯时间（商品） */}
      <section id='slots' aria-label='点灯时间'>
        <div className='h5-header'>
          <h2 className='h5-title'>{goodsTitle}</h2>
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

      {/* 榜单：支付记录 */}
      <section id='board' className='board'>
        <div className='board-title'>名单登记榜单</div>
        <table className='board-table' aria-label='支付记录'>
          <thead>
            <tr>
              <th className='board-col-date'>日期</th>
              <th className='board-col-name'>姓名</th>
              <th className='board-col-item'>点灯时间</th>
              <th className='board-col-amt'>金额</th>
            </tr>
          </thead>
          <tbody id='board-body' />
        </table>
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
