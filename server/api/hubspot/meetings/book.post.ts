import { z } from 'zod'
import type { HubspotMeetingBookSuccess } from '../../../../types'

const bookSchema = z.object({
  duration: z.number(),
  email: z.string().email(),
  firstName: z.string(),
  formFields: z.optional(
    z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
  ),
  guestEmails: z.optional(z.string().array()),
  lastName: z.string(),
  likelyAvailableUserIds: z.optional(z.string().array()),
  slug: z.string(),
  startTime: z.number(),
  timezone: z.string().default('Europe/Paris'),
})

export default defineEventHandler(async (event) => {
  const {
    hubspotMeetingSchedulerToken,
  } = useRuntimeConfig(event)
  const { hubspot: { apiDomain } } = useAppConfig()

  const result = await readValidatedBody(event, bookSchema.safeParse)
  if (!result.success) throw result.error.issues

  const {
    guestEmails = [],
    likelyAvailableUserIds = [],
    formFields = {},
    ...body
  } = result.data

  const url = new URL(
    '/scheduler/v3/meetings/meeting-links/book',
    apiDomain,
  )
  const response = await $fetch<HubspotMeetingBookSuccess>(url.toString(), {
    headers: {
      Authorization: `Bearer ${hubspotMeetingSchedulerToken}`,
    },
    method: 'POST',
    body: {
      ...body,
      guestEmails,
      likelyAvailableUserIds,
      formFields: Object.entries(formFields)
        .map(([name, value]) => ({ name, value }))
    },
  })

  return response
})
