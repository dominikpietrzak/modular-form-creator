import { describe, expect, it } from 'vitest'
import { basicInfoSchema, projectDetailsSchema } from './schemas'

const validBasicInfo = {
  resourceName: 'Payments',
  owner: 'Jane Doe',
  email: 'jane@example.com',
  description: 'Handles payments',
  priority: 'high',
}

const validProjectDetails = {
  projectName: 'Checkout',
  budget: '5000',
  category: 'internal',
  options: ['FE devs', 'Designer'],
}

describe('basicInfoSchema', () => {
  it('accepts a fully valid module', () => {
    expect(basicInfoSchema.safeParse(validBasicInfo).success).toBe(true)
  })

  it('rejects an owner containing digits', () => {
    const result = basicInfoSchema.safeParse({ ...validBasicInfo, owner: 'Jane 3000' })
    expect(result.success).toBe(false)
  })

  it('rejects a malformed email', () => {
    expect(basicInfoSchema.safeParse({ ...validBasicInfo, email: 'not-an-email' }).success).toBe(false)
  })

  it('rejects a priority outside the allowed set', () => {
    expect(basicInfoSchema.safeParse({ ...validBasicInfo, priority: 'urgent' }).success).toBe(false)
  })

  it('trims before validating, so whitespace-only fails', () => {
    expect(basicInfoSchema.safeParse({ ...validBasicInfo, owner: '   ' }).success).toBe(false)
  })
})

describe('projectDetailsSchema', () => {
  it('accepts a fully valid module', () => {
    expect(projectDetailsSchema.safeParse(validProjectDetails).success).toBe(true)
  })

  it('rejects a non-integer budget', () => {
    expect(projectDetailsSchema.safeParse({ ...validProjectDetails, budget: '50.5' }).success).toBe(
      false,
    )
  })

  it('rejects an empty team-member list', () => {
    expect(projectDetailsSchema.safeParse({ ...validProjectDetails, options: [] }).success).toBe(false)
  })

  it('rejects an unsupported team-member value', () => {
    expect(
      projectDetailsSchema.safeParse({ ...validProjectDetails, options: ['QA'] }).success,
    ).toBe(false)
  })

  it('rejects a category outside the allowed set', () => {
    expect(
      projectDetailsSchema.safeParse({ ...validProjectDetails, category: 'partner' }).success,
    ).toBe(false)
  })
})
