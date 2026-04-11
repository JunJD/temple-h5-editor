import React from 'react'
import type { RenderOptions } from '../h5-sdk'
import { InputItem, ModalShell, TextareaItem } from '../common/form'

type Props = Partial<RenderOptions>

const DEFAULT_HERO_IMAGE_URL =
  'https://tuchuang.wxsushang.com/2026/03/21/98e028d0ee8f4.jpg'
const DEFAULT_AUDIO_URL =
  'http://wuxicdn.oss-cn-beijing.aliyuncs.com/1775882738897-xn5e22.mp3'
const DEFAULT_OVERVIEW_HTML = `
  <section data-role="paragraph" class="_135editor">
    <section style="box-sizing: border-box; text-align: justify; font-size: 16px; color: rgb(62, 62, 62);">
      <section style="display: flex; width: 100%; flex-flow: column; max-width: 100% !important; box-sizing: border-box;">
        <section style="position: static; z-index: 1; box-sizing: border-box;">
          <section style="text-align: center; justify-content: center; display: flex; flex-flow: row; margin: 10px 0px -30px; position: static; box-sizing: border-box;">
            <section style="display: inline-block; width: auto; vertical-align: top; min-width: 10%; max-width: 100%; flex: 0 0 auto; height: auto; padding: 3px 15px; border-width: 0px 0px 5px; border-radius: 30px; border-style: none none solid; border-color: rgb(62, 62, 62) rgb(62, 62, 62) rgb(255, 205, 92); overflow: hidden; background-color: rgb(230, 0, 0); align-self: flex-start; box-sizing: border-box;">
              <section style="color: rgb(255, 255, 255); box-sizing: border-box;">
                <p style="margin: 0px; padding: 0px; box-sizing: border-box;">
                  <strong style="box-sizing: border-box;">开利寺 · 水陆大法会庄严法器募化登记</strong>
                </p>
              </section>
            </section>
          </section>
        </section>
      </section>
      <section style="text-align: center; justify-content: center; display: flex; flex-flow: row; margin: 15px 0px; position: static; box-sizing: border-box;">
        <section style="display: inline-block; width: auto; vertical-align: top; align-self: flex-start; flex: 100 100 0%; border-style: solid; border-width: 1px; border-color: rgb(255, 205, 92); padding: 0px 6px; height: auto; box-sizing: border-box;">
          <section style="text-align: left; justify-content: flex-start; display: flex; flex-flow: row; margin: -7px 0px; width: 100%; align-self: flex-start; background-color: rgba(255, 255, 255, 0); padding: 6px 0px; border-style: solid; border-width: 1px; border-color: rgb(255, 205, 92); position: static; max-width: 100% !important; box-sizing: border-box;">
            <section style="justify-content: flex-start; display: flex; flex-flow: row; width: 100%; position: static; max-width: 100% !important; box-sizing: border-box;">
              <section style="display: inline-block; width: 100%; vertical-align: top; align-self: flex-start; flex: 0 0 auto; padding: 15px 20px; max-width: 100% !important; box-sizing: border-box;">
                <section style="margin: 20px 0px 0px; position: static; box-sizing: border-box;">
                  <section style="line-height: 1.8; letter-spacing: 1px; box-sizing: border-box;">
                    <p style="margin: 0px; padding: 0px; box-sizing: border-box;">
                      各位檀越善信、大德护法：
                    </p>
                  </section>
                </section>
                <section style="margin: 0px 0px 20px; position: static; box-sizing: border-box;">
                  <section style="line-height: 1.8; letter-spacing: 1px; box-sizing: border-box;">
                    <p style="text-indent: 2.125em; margin: 0px; padding: 0px; box-sizing: border-box;">
                      开利寺准备启建水陆大法会，水陆法会乃佛门中最大的盛事，冥阳两利，殊胜无比。然本寺上下举全寺之力，寺院法器庄严非一人一力所能圆满，寺院法器乃龙天耳目，供养庄严、法器，道场庄严，法器声响，龙天护法，护持我们一切顺利！不受外邪侵入！本寺为庄严水陆坛场，需置办法器，诚请大众共同发心供养！
                    </p>
                  </section>
                </section>
              </section>
            </section>
          </section>
        </section>
      </section>
      <p style="margin: 0px; padding: 0px; box-sizing: border-box;">
        <br style="box-sizing: border-box;" />
      </p>
      <section style="text-align: center; letter-spacing: 1px; line-height: 1.8; box-sizing: border-box;">
        <p style="margin: 0px; padding: 0px; box-sizing: border-box;">
          <strong style="box-sizing: border-box;">『联系方式』</strong>
        </p>
        <p style="margin: 0px; padding: 0px; box-sizing: border-box;">
          性凝法师（18115395588）微信同步
        </p>
      </section>
    </section>
    <p>
      <br />
    </p>
  </section>
  <section class="_135editor" data-role="paragraph">
    <p>
      <br />
    </p>
  </section>
`

export default function Template(_: Props) {
  return (
    <>
      <section
        className='dailyDiv'
        data-v-a3f6ef4d=''
        aria-label='水陆大法会页面'
      >
        <div className='imgDiv' data-v-af6e5636=''>
          <div data-v-af6e5636=''>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              id='hero-image'
              data-v-af6e5636=''
              src={DEFAULT_HERO_IMAGE_URL}
              alt='水陆大法会首图'
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
          aria-label='法会说明'
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
