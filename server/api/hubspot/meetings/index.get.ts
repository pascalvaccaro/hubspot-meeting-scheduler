import { z } from "zod"
import type { HubspotMeeting } from "../../../../types"

export default defineEventHandler(async (event) => {
  const {
    hubspotMeetingSchedulerToken
  } = useRuntimeConfig(event)
  const {
    hubspot: {
      apiDomain,
      meetingScheduler
    }
  } = useAppConfig()

  const querySchema = z.object({
    name: z.string().default(meetingScheduler.name),
    organizerId: z.string().default(meetingScheduler.organizerId),
    type: z.string().default(meetingScheduler.type)
  })
  const query = await getValidatedQuery(event, querySchema.safeParse)
  if (!query.success) throw query.error.issues

  const url = new URL('/scheduler/v3/meetings/meeting-links', apiDomain)
  for (const [key, value] of Object.entries(query.data)) {
    url.searchParams.set(key, value)
  }

  const response = await $fetch<{
    total: number
    results: HubspotMeeting[]
  }>(url.toString(), {
    headers: {
      Authorization: `Bearer ${hubspotMeetingSchedulerToken}`,
    },
  })

  return response.results
})
