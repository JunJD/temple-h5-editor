import React from 'react'
import type { RenderOptions } from '../h5-sdk'
import { InputItem, ModalShell, TextareaItem } from '../common/form'

type Props = Partial<RenderOptions>

const DEFAULT_HERO_IMAGE_URL =
  'https://tuchuang.wxsushang.com/2026/03/26/cac7c686e1093.jpg'
const DEFAULT_AUDIO_URL = '/法器认捐/双手合十.mp3'
const DEFAULT_OVERVIEW_HTML = `
  <section data-role="paragraph" class="_135editor">
    <section style="box-sizing: border-box; text-align: center; font-size: 16px; color: rgb(51, 51, 51);">
      <section style="margin: 0 auto 24px; width: 100%; max-width: 260px; box-sizing: border-box;">
        <section style="width: 96px; height: 1px; margin: 0 auto 14px; background: rgb(114, 143, 199); box-sizing: border-box;"></section>
        <p style="margin: 0; padding: 0; font-size: 18px; letter-spacing: 1px; color: rgb(58, 87, 147); white-space: nowrap; box-sizing: border-box;">
          <strong style="box-sizing: border-box;">法器认捐登记</strong>
        </p>
        <section style="width: 96px; height: 1px; margin: 14px auto 0; background: rgb(114, 143, 199); box-sizing: border-box;"></section>
      </section>
      <section style="line-height: 1.95; letter-spacing: 1px; box-sizing: border-box;">
        <p style="margin: 0; padding: 0; box-sizing: border-box;">法器不仅在佛教里能庄严道场</p>
        <p style="margin: 0; padding: 0; box-sizing: border-box;">更能在法会的时候</p>
        <p style="margin: 0; padding: 0; box-sizing: border-box;">增添来自宗教的威严感</p>
        <p style="margin: 0; padding: 0; box-sizing: border-box;">随喜的法器在水陆法会、梁皇宝忏等</p>
        <p style="margin: 0; padding: 0; box-sizing: border-box;">重大法会都将用到</p>
        <p style="margin: 0; padding: 0; box-sizing: border-box;">其中都有出资者不可思议的功德利益</p>
        <p style="margin: 0; padding: 0; box-sizing: border-box;">可令出资功德主广纳福田</p>
        <p style="margin: 0; padding: 0; box-sizing: border-box;">功德福荫千秋，永沐佛光加持</p>
      </section>
      <section style="margin-top: 24px; line-height: 1.95; letter-spacing: 1px; box-sizing: border-box;">
        <p style="margin: 0; padding: 0; box-sizing: border-box;">为庄严道场，祈大众</p>
        <p style="margin: 0; padding: 0; box-sizing: border-box;">事业顺利、健康平安、家庭如意</p>
        <p style="margin: 0; padding: 0; box-sizing: border-box;">本寺现欲敬请法器3套</p>
        <p style="margin: 0; padding: 0; box-sizing: border-box;">大众可发心认供</p>
      </section>
      <section style="margin-top: 24px; line-height: 1.95; letter-spacing: 1px; box-sizing: border-box;">
        <p style="margin: 0; padding: 0; box-sizing: border-box;">法器可选：</p>
        <p style="margin: 0; padding: 0; box-sizing: border-box;">毗卢帽、曼达拉、法铃、磬</p>
        <p style="margin: 0; padding: 0; box-sizing: border-box;">引罄、木鱼、铪子、铛子、手鼓</p>
        <p style="margin: 0; padding: 0; box-sizing: border-box;">大众可自行选择法器认供</p>
      </section>
      <section style="margin-top: 24px; line-height: 1.95; letter-spacing: 1px; box-sizing: border-box;">
        <p style="margin: 0; padding: 0; box-sizing: border-box;"><strong style="box-sizing: border-box;">【咨询联系】</strong></p>
        <p style="margin: 0; padding: 0; box-sizing: border-box;">性凝法师：18115395588</p>
        <p style="margin: 0; padding: 0; box-sizing: border-box;">（手机微信同步）</p>
      </section>
    </section>
  </section>
  <section class="_135editor" data-role="paragraph">
    <p><br /></p>
  </section>
`

export default function Template(_: Props) {
  return (
    <>
      <section
        className='dailyDiv'
        data-v-a3f6ef4d=''
        aria-label='法器认捐页面'
      >
        <div className='imgDiv' data-v-af6e5636=''>
          <div data-v-af6e5636=''>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              id='hero-image'
              data-v-af6e5636=''
              src={DEFAULT_HERO_IMAGE_URL}
              alt='法器认捐首图'
            />
          </div>

          <div
            id='music'
            className='stopped'
            data-v-af6e5636=''
            data-url={DEFAULT_AUDIO_URL}
          >
            <audio
              id='audio'
              data-v-af6e5636=''
              loop
              preload='auto'
              playsInline
              src={DEFAULT_AUDIO_URL}
            />
            <div className='control' data-v-af6e5636=''>
              <div className='control_after' data-v-af6e5636='' />
            </div>
          </div>
        </div>

        <section
          className='textContent'
          data-v-ce00c43a=''
          aria-label='法器认捐说明'
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-v-ce00c43a=''
            src='http://tuchuang.wxsushang.com/2021/07/24/e9ce8956c5ef4.jpg'
            className='tip_head'
            alt=''
          />
          <div
            id='overview'
            className='textDiv'
            data-v-ce00c43a=''
            dangerouslySetInnerHTML={{ __html: DEFAULT_OVERVIEW_HTML }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-v-ce00c43a=''
            src='http://tuchuang.wxsushang.com/2021/07/24/9ea056450aeb2.jpg'
            className='tip_foot'
            alt=''
          />
        </section>

        <section
          id='board'
          className='dailygooddeedOrder hidden'
          data-v-e00a63bf=''
          aria-label='功德榜'
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-v-e00a63bf=''
            src='http://tuchuang.wxsushang.com/2021/07/24/e9ce8956c5ef4.jpg'
            className='tip_head'
            alt=''
          />
          <div id='board-title' className='common_head' data-v-e00a63bf=''>
            功德榜
          </div>
          <div id='format-list' className='ranking_list' data-v-e00a63bf='' />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-v-e00a63bf=''
            src='http://tuchuang.wxsushang.com/2021/07/24/9ea056450aeb2.jpg'
            className='tip_foot'
            alt=''
          />
        </section>

        <section
          className='selection1'
          data-v-a3f6ef4d=''
          aria-label='商品列表'
        >
          <div id='msg' className='h5-message hidden'>
            加载中...
          </div>
          <div className='menuDiv' id='menuDiv' data-v-a3f6ef4d=''>
            <ul id='slots-grid' className='tabDiv hidden' data-v-a3f6ef4d='' />
          </div>
          <div data-v-a3f6ef4d=''>
            <br data-v-a3f6ef4d='' />
          </div>

          <input type='hidden' id='goods' name='goods' defaultValue='' />
          <input type='hidden' id='amount' name='amount' defaultValue='' />
        </section>
      </section>

      <ModalShell id='pay-mask'>
        <InputItem
          label='金额'
          id='money'
          className='juan_money'
          disabled
          suffix='元'
        />
        <InputItem label='姓名' id='username' placeholder='自愿填写' />
        <InputItem label='电话' id='phone' placeholder='自愿填写' />
        <TextareaItem label='留言' id='qifu' placeholder='自愿填写' />

        <div className='operate'>
          <div className='cancel' id='btn-cancel'>
            取消
          </div>
          <div className='confirm'>
            <button
              type='button'
              className='mui-btn mui-btn-block gopay'
              id='btn-confirm'
            >
              确定
            </button>
          </div>
        </div>
      </ModalShell>
    </>
  )
}
