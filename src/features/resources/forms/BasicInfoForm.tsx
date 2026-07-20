import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Select } from '@/design-system'
import type { BasicInfo } from '../api/types'
import { PRIORITY_OPTIONS } from '../domain/constants'
import { Actions, Fields, Form, ServerError } from './form-layout'
import { basicInfoSchema } from './schemas'
import type { BasicInfoFormValues } from './schemas'

interface BasicInfoFormProps {
  defaultValues: BasicInfo
  onSubmit: (values: BasicInfoFormValues) => void
  submitLabel: string
  isSubmitting?: boolean
  serverError?: string | null
  secondaryAction?: ReactNode
}

// One form for both statuses; only the caller's onSubmit differs (draft PATCH vs local buffer).
export function BasicInfoForm({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  serverError,
  secondaryAction,
}: BasicInfoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues,
    mode: 'onBlur',
  })

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Fields>
        {/* Locked after creation, but still registered so it travels in the full payload. */}
        <Input
          label="Resource name"
          state="locked"
          tooltip="The resource name is locked after creation and cannot be changed."
          error={errors.resourceName?.message}
          {...register('resourceName')}
        />
        <Input
          label="Owner"
          placeholder="Jane Doe"
          error={errors.owner?.message}
          {...register('owner')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="jane@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Description"
          multiline
          rows={4}
          placeholder="What is this resource for?"
          error={errors.description?.message}
          {...register('description')}
        />
        <Select
          label="Priority"
          options={PRIORITY_OPTIONS}
          error={errors.priority?.message}
          {...register('priority')}
        />
      </Fields>

      {serverError ? <ServerError role="alert">{serverError}</ServerError> : null}

      <Actions>
        {secondaryAction}
        <Button type="submit" variant="primary" state={isSubmitting ? 'disabled' : 'normal'}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </Actions>
    </Form>
  )
}
