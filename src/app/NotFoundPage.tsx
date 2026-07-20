import { useNavigate } from 'react-router-dom'
import { Button } from '@/design-system'
import { StateMessage } from '@/shared/ui/StateMessage'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <StateMessage
      title="Page not found"
      description="The page you are looking for does not exist."
      action={
        <Button variant="primary" onClick={() => void navigate('/resources')}>
          Back to resources
        </Button>
      }
    />
  )
}
