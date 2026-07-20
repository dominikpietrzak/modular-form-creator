import { describe, expect, it } from 'vitest'
import type { BasicInfo, ProjectDetails, Resource, ResourceStatus } from '../api/types'
import {
  areModulesComplete,
  canProvision,
  countCompletedModules,
  isBasicInfoComplete,
  isProjectDetailsComplete,
  isProjectDetailsUnlocked,
  usesLocalBuffer,
} from './rules'

const fullBasicInfo: BasicInfo = {
  resourceName: 'Payments',
  owner: 'Jane Doe',
  email: 'jane@example.com',
  description: 'Handles payments',
  priority: 'high',
}

const fullProjectDetails: ProjectDetails = {
  projectName: 'Checkout',
  budget: '5000',
  category: 'internal',
  options: ['FE devs'],
}

function makeResource(overrides: Partial<Resource> = {}): Resource {
  return {
    _id: 'abc',
    resourceId: 1,
    name: 'Payments',
    status: 'draft',
    basicInfo: fullBasicInfo,
    projectDetails: fullProjectDetails,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

describe('isBasicInfoComplete', () => {
  it('is true when every field is filled', () => {
    expect(isBasicInfoComplete(fullBasicInfo)).toBe(true)
  })

  it.each(['resourceName', 'owner', 'email', 'description', 'priority'] as const)(
    'is false when %s is empty',
    (field) => {
      expect(isBasicInfoComplete({ ...fullBasicInfo, [field]: '' })).toBe(false)
    },
  )
})

describe('isProjectDetailsComplete', () => {
  it('is true when every field is filled and at least one option is chosen', () => {
    expect(isProjectDetailsComplete(fullProjectDetails)).toBe(true)
  })

  it('is false when no team member is selected', () => {
    expect(isProjectDetailsComplete({ ...fullProjectDetails, options: [] })).toBe(false)
  })

  it.each(['projectName', 'budget', 'category'] as const)('is false when %s is empty', (field) => {
    expect(isProjectDetailsComplete({ ...fullProjectDetails, [field]: '' })).toBe(false)
  })
})

describe('areModulesComplete / countCompletedModules', () => {
  it('counts both modules when both are complete', () => {
    const resource = makeResource()
    expect(areModulesComplete(resource)).toBe(true)
    expect(countCompletedModules(resource)).toBe(2)
  })

  it('counts one module when only Basic Info is complete', () => {
    const resource = makeResource({ projectDetails: { ...fullProjectDetails, options: [] } })
    expect(areModulesComplete(resource)).toBe(false)
    expect(countCompletedModules(resource)).toBe(1)
  })
})

describe('isProjectDetailsUnlocked', () => {
  it('is locked for a draft until Basic Info is complete', () => {
    const resource = makeResource({ basicInfo: { ...fullBasicInfo, owner: '' } })
    expect(isProjectDetailsUnlocked(resource)).toBe(false)
  })

  it('is unlocked for a draft once Basic Info is complete', () => {
    expect(isProjectDetailsUnlocked(makeResource())).toBe(true)
  })

  it('is always unlocked for a completed resource', () => {
    // The gate does not apply to completed resources — they update via one full PUT.
    const resource = makeResource({ status: 'completed', basicInfo: { ...fullBasicInfo, owner: '' } })
    expect(isProjectDetailsUnlocked(resource)).toBe(true)
  })
})

describe('canProvision', () => {
  it('is true for a draft with both modules complete', () => {
    expect(canProvision(makeResource())).toBe(true)
  })

  it('is false when a module is incomplete', () => {
    expect(canProvision(makeResource({ projectDetails: { ...fullProjectDetails, options: [] } }))).toBe(
      false,
    )
  })

  it('is false for an already completed resource', () => {
    expect(canProvision(makeResource({ status: 'completed' }))).toBe(false)
  })
})

describe('usesLocalBuffer', () => {
  it.each<[ResourceStatus, boolean]>([
    ['draft', false],
    ['completed', true],
  ])('is %s → %s', (status, expected) => {
    expect(usesLocalBuffer(makeResource({ status }))).toBe(expected)
  })
})
