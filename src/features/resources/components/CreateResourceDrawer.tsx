import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import styled from 'styled-components'
import { Button, Drawer, Input } from '@/design-system'
import { ApiError } from '@/shared/api/client'
import { useCreateResource } from '../api/queries'
import type { Resource } from '../api/types'
import { resourceNameSchema } from '../forms/schemas'

const createResourceSchema = z.object({ resourceName: resourceNameSchema })
type CreateResourceValues = z.infer<typeof createResourceSchema>

interface CreateResourceDrawerProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (resource: Resource) => void
}

export function CreateResourceDrawer({ isOpen, onClose, onCreated }: CreateResourceDrawerProps) {
  return (
    <Drawer title="New resource" isOpen={isOpen} onClose={onClose}>
      {/*
        The drawer keeps its children mounted while closed, so the form is mounted only while
        open: that resets it between openings and keeps hidden fields out of the tab order.
      */}
      {isOpen ? <CreateResourceForm onClose={onClose} onCreated={onCreated} /> : null}
    </Drawer>
  )
}

function CreateResourceForm({
  onClose,
  onCreated,
}: Pick<CreateResourceDrawerProps, 'onClose' | 'onCreated'>) {
  const createResource = useCreateResource()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateResourceValues>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: { resourceName: '' },
    mode: 'onBlur',
  })

  const submit = handleSubmit(async ({ resourceName }) => {
    // Uniqueness is only known server-side, so a rejection here is expected rather than a bug.
    const resource = await createResource.mutateAsync(resourceName).catch(() => null)
    if (resource) {
      onCreated(resource)
    }
  })

  const serverError =
    createResource.error instanceof ApiError ? createResource.error.message : null

  return (
    <Form onSubmit={submit} noValidate>
      <Input
        label="Resource name"
        placeholder="Payments service"
        helperText="Letters, numbers, spaces and hyphens. Cannot be changed later."
        error={errors.resourceName?.message ?? serverError ?? undefined}
        autoFocus
        {...register('resourceName')}
      />
      <Actions>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          state={createResource.isPending ? 'disabled' : 'normal'}
        >
          {createResource.isPending ? 'Creating…' : 'Create resource'}
        </Button>
      </Actions>
    </Form>
  )
}

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`
