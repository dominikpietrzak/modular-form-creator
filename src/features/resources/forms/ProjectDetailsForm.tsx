import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, CheckboxGroup, Input, Select } from '@/design-system'
import type { ProjectDetails } from '../api/types'
import { CATEGORY_OPTIONS, TEAM_MEMBER_OPTIONS } from '../domain/constants'
import { Actions, Fields, Form, ServerError } from './form-layout'
import { projectDetailsSchema } from './schemas'
import type { ProjectDetailsFormValues } from './schemas'

interface ProjectDetailsFormProps {
  defaultValues: ProjectDetails
  onSubmit: (values: ProjectDetailsFormValues) => void
  submitLabel: string
  isSubmitting?: boolean
  serverError?: string | null
  secondaryAction?: ReactNode
}

// Status-agnostic like BasicInfoForm; the caller decides what onSubmit does.
export function ProjectDetailsForm({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  serverError,
  secondaryAction,
}: ProjectDetailsFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProjectDetailsFormValues>({
    resolver: zodResolver(projectDetailsSchema),
    defaultValues,
    mode: 'onBlur',
  })

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Fields>
        <Input
          label="Project name"
          placeholder="Website redesign"
          error={errors.projectName?.message}
          {...register('projectName')}
        />
        <Input
          label="Budget"
          inputMode="numeric"
          placeholder="5000"
          helperText="Whole numbers only."
          error={errors.budget?.message}
          {...register('budget')}
        />
        <Select
          label="Category"
          options={CATEGORY_OPTIONS}
          error={errors.category?.message}
          {...register('category')}
        />
        {/* CheckboxGroup is value/onChange, not DOM events, so it needs Controller not register. */}
        <Controller
          control={control}
          name="options"
          render={({ field, fieldState }) => (
            <CheckboxGroup
              label="Team members"
              options={TEAM_MEMBER_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
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
