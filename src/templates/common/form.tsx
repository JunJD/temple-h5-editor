import React from 'react'

type BaseProps = {
  className?: string
  children?: React.ReactNode
}

export function ModalShell(props: { id: string } & BaseProps) {
  const { id, children, className } = props
  return (
    <div id={id} className={'mask' + (className ? ' ' + className : '')} aria-hidden='true'>
      <div className='mask_content'>
        <div className='input_panel1' style={{ display: 'block' }}>
          <div className='input_panel2'>
            <div className='title2' />
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function InputItem(
  props: {
    label?: string
    id?: string
    suffix?: React.ReactNode
  } & React.InputHTMLAttributes<HTMLInputElement> & BaseProps
) {
  const { label, id, placeholder, suffix, className, ...rest } = props
  return (
    <div className={'input_item' + (className ? ' ' + className : '')}>
      <span>{label ? label + '：' : ''}</span>
      <input id={id} placeholder={placeholder} className='form-input' {...rest} />
      {suffix != null ? <span className='yuan'>{suffix}</span> : null}
    </div>
  )
}

export function TextareaItem(
  props: {
    label?: string
    id?: string
  } & React.TextareaHTMLAttributes<HTMLTextAreaElement> & BaseProps
) {
  const { label, id, placeholder, className, ...rest } = props
  return (
    <div className={'input_item input-textarea' + (className ? ' ' + className : '')}>
      <span>{label ? label + '：' : ''}</span>
      <textarea id={id} placeholder={placeholder} className='form-input rich-text' {...rest} />
    </div>
  )
}

export default { ModalShell, InputItem, TextareaItem }

