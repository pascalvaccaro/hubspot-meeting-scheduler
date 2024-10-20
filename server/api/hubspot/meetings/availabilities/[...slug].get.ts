import { z } from 'zod'
import type { HubspotMeetingAvailabilities } from '../../../../../types'

const querySchema = z.object({
  timezone: z.string().default('Europe/Paris'),
})
const paramSchema = z.object({
  slug: z.string(),
})

export default defineEventHandler(async (event) => {
  const {
    hubspotMeetingSchedulerToken,
    public: { hubspotApiDomain },
  } = useRuntimeConfig(event)

  const params = await getValidatedRouterParams(event, paramSchema.safeParse)
  const query = await getValidatedQuery(event, querySchema.safeParse)
  if (!params.success) throw params.error.issues
  if (!query.success) throw query.error.issues

  const { slug } = params.data
  const { timezone } = query.data

  const url = new URL(
    `/scheduler/v3/meetings/meeting-links/book/availability-page/${encodeURIComponent(slug)}`,
    hubspotApiDomain,
  )
  url.searchParams.set(
    'timezone',
    decodeURIComponent(timezone),
  )

  const response = await $fetch<HubspotMeetingAvailabilities>(url.toString(), {
    headers: {
      Authorization: `Bearer ${hubspotMeetingSchedulerToken}`,
    },
  })

  return response.linkAvailability
})
