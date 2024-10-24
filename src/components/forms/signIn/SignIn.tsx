import { SubmitHandler, useForm } from 'react-hook-form'

import { GitHubIcon } from '@/assets/icons/GitHubIcon'
import { GoogleIcon } from '@/assets/icons/GoogleIcon'
import { useTranslation } from '@/common/hooks/useTranslation'
import { signInSchema } from '@/common/schemas/signInSchema'
import { FormTextField } from '@/components/controlled/formTextField'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { useSignInMutation } from '@/services/auth'
import { useGetProfileQuery } from '@/services/profile'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { z } from 'zod'

import s from './signIn.module.scss'

type SignInSchemaType = z.infer<ReturnType<typeof signInSchema>>

export const SignIn = () => {
  const { t } = useTranslation()
  const classNames = {
    emailTextField: clsx(s.emailTextField, s.fullWidth, s.mainMargin),
    forgotPassword: clsx(s.forgotPassword, s.mainMargin),
    form: s.form,
    iconWrapper: clsx(s.iconWrapper, s.mainMargin),
    passwordTextField: clsx(s.passwordTextField, s.fullWidth),
    signInButton: clsx(s.signInButton, s.fullWidth),
    signUpQuestion: s.signUpQuestion,
    title: s.title,
    wrapper: s.wrapper,
  }

  const {
    control,
    formState: { isValid },
    handleSubmit,
    setError,
  } = useForm<SignInSchemaType>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(signInSchema(t)),
  })

  const [signIn] = useSignInMutation()

  const router = useRouter()

  const onSubmitHandler: SubmitHandler<SignInSchemaType> = (data: SignInSchemaType) => {
    signIn(data)
      .unwrap()
      .then(data => {
        localStorage.setItem('accessToken', data.accessToken)
        const payload = data.accessToken.split('.')[1]
        const id = JSON.parse(atob(payload)).userId

        router.push(`/profile/${id}`)
      })
      .catch(err => {
        if (err.status) {
          //t.passwordForm.incorrectEmail && incorrectPassword: The email or password are incorrect. Try again please
          setError('password', { message: err.data.messages })
        }
      })
  }

  return (
    <Card className={classNames.wrapper}>
      <form className={classNames.form} onSubmit={handleSubmit(onSubmitHandler)}>
        <Typography asChild className={classNames.title} variant={'h1'}>
          <h1>{t.passwordForm.signIn}</h1>
        </Typography>
        <div className={classNames.iconWrapper}>
          <GoogleIcon height={36} width={36} />
          <GitHubIcon height={36} width={36} />
        </div>

        <FormTextField
          className={classNames.emailTextField}
          control={control}
          label={t.passwordForm.email}
          name={'email'}
          placeholder={'Epam@epam.com'}
          type={'email'}
        />
        <FormTextField
          className={classNames.passwordTextField}
          control={control}
          label={t.passwordForm.password}
          name={'password'}
          placeholder={t.passwordForm.enterPassword}
          type={'password'}
        />
        <Typography asChild className={classNames.forgotPassword} variant={'regular_text_14'}>
          <a href={'#'}>{t.passwordForm.forgotPassword}</a>
        </Typography>
        <Button className={classNames.signInButton}>{t.passwordForm.signInBtn}</Button>
        <Typography className={s.signUpQuestion} variant={'regular_text_16'}>
          {t.passwordForm.noAccount}
        </Typography>
        <Button variant={'text'}>{t.passwordForm.signUp}</Button>
      </form>
    </Card>
  )
}
