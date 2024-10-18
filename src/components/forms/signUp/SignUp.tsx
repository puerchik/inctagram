import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { GitHubIcon } from '@/assets/icons/GitHubIcon'
import { GoogleIcon } from '@/assets/icons/GoogleIcon'
import { signUpSchema } from '@/common/schemas'
import { FormCheckbox } from '@/components/controlled/formCheckbox'
import { FormTextField } from '@/components/controlled/formTextField'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Typography } from '@/components/ui/typography'
import { useSignUpMutation } from '@/services/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import Link from 'next/link'
import { z } from 'zod'

import s from './signUp.module.scss'

type FormValues = z.infer<typeof signUpSchema>
type FormField = keyof FormValues
type ServerErrorMessage = {
  field: FormField
  message: string
}
type ServerErrorData = {
  error: string
  messages: ServerErrorMessage[]
  statusCode: number
}
type ServerError = {
  data: ServerErrorData
  status: number
}

export const SignUp = () => {
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    reset,
    setError,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      agreesToTOS: false,
      email: '',
      password: '',
      passwordConfirmation: '',
      userName: '',
    },
    mode: 'onBlur',
    resolver: zodResolver(signUpSchema),
  })

  const acceptTerms = watch('agreesToTOS')
  const isDisabled = !isValid && !acceptTerms

  const [signUp] = useSignUpMutation()
  const [isOpen, setIsOpen] = useState(false)
  const [emailModal, setEmailModal] = useState('')

  const onCloseHandler = () => setIsOpen(false)

  const onSubmitHandler = async (data: FormValues) => {
    const { email, password, userName } = data

    try {
      await signUp({ email, password, userName }).unwrap()
      setEmailModal(email)
      setIsOpen(true)
      reset()
    } catch (error) {
      const err = error as ServerError

      if (err.data.messages) {
        const field = err.data.messages[0].field
        const message = err.data.messages[0].message

        const wordsMessage = message.split(' ')

        wordsMessage[wordsMessage.length - 1] = 'registered'

        const updatedMessage = wordsMessage.join(' ')

        setError(field, {
          message: updatedMessage,
        })
      }
    }
  }

  return (
    <>
      <Card className={s.card}>
        <Typography asChild className={s.title} variant={'h1'}>
          <h1>Sign Up</h1>
        </Typography>
        <div className={s.iconWrapper}>
          <GoogleIcon height={36} width={36} />
          <GitHubIcon height={36} width={36} />
        </div>
        <form className={s.form} onSubmit={handleSubmit(onSubmitHandler)}>
          <FormTextField
            className={clsx(s.input, s.inputUserName, errors.userName && s.error)}
            control={control}
            label={'Username'}
            name={'userName'}
            placeholder={'Epam11'}
            type={'text'}
          />
          <FormTextField
            className={clsx(s.input, s.inputEmail, errors.email && s.error)}
            control={control}
            label={'Email'}
            name={'email'}
            placeholder={'Epam@epam.com'}
            type={'email'}
          />
          <FormTextField
            className={clsx(s.input, s.inputPassword, errors.password && s.error)}
            control={control}
            label={'Password'}
            name={'password'}
            placeholder={'Password'}
            type={'password'}
          />
          <FormTextField
            className={s.input}
            control={control}
            label={'Password confirmation'}
            name={'passwordConfirmation'}
            placeholder={'Password confirmation'}
            type={'password'}
          />
          <FormCheckbox
            className={s.checkBox}
            control={control}
            label={
              <Typography slot={'span'} variant={'small_text'}>
                I agree to the{' '}
                <Typography asChild variant={'small_link'}>
                  <Link href={'/auth/termsOfService'}>Terms of Service</Link>
                </Typography>{' '}
                and
                <Typography asChild variant={'small_link'}>
                  <Link href={'/auth/privacyPolicy'}> Privacy Policy</Link>
                </Typography>
              </Typography>
            }
            name={'agreesToTOS'}
          />
          <Button disabled={isDisabled} fullWidth variant={'primary'}>
            Sign up
          </Button>
          <Typography className={s.signInQuestion} variant={'regular_text_16'}>
            Do you have an account?
          </Typography>
          <Button variant={'text'}>Sign in</Button>
        </form>
      </Card>
      <Modal className={s.modal} onOpenChange={setIsOpen} open={isOpen} title={'Email sent'}>
        <div className={s.modalContentContainer}>
          <Typography variant={'regular_text_16'}>
            We have sent a link to confirm your email to {emailModal}
          </Typography>
          <Button className={s.buttonOk} onClick={onCloseHandler}>
            OK
          </Button>
        </div>
      </Modal>
    </>
  )
}
