'use client'

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger
} from '@/components/ui'
import { revalidate } from 'atomic-utils'
import Icon from 'bs-icon'
import { signIn } from 'next-auth/react'

export default function SigninDialog({
  children
}: {
  children: React.ReactNode
}) {
  const attemptGoogleSignin = () => {
    signIn('credentials', {
      username: 'test',
      password: 'qpua5db1f99h1nf',
      redirect: true,
      callbackUrl: location.href
    })
      .then((result) => {
        if (result?.error) {
          console.error("Sign-in error:", result.error);
        } else if (result?.ok) {
          // revalidate('GET /auth/session')
        }
      })
      .catch(err => {
        console.error("signIn promise rejected:", err);
      })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='max-w-[90%] md:max-w-lg rounded-xl'>
        <DialogTitle>Sign in to your account</DialogTitle>

        <DialogDescription>
          Sign in to one of the available providers
        </DialogDescription>

        <Button onClick={attemptGoogleSignin} variant='outline' size='lg'>
          <Icon name='person-standing' />
          Sign in with Local
        </Button>

        <DialogFooter>
          <DialogClose asChild>
            <Button size='lg'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
