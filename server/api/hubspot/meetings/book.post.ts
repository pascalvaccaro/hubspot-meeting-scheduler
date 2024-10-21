import { bookSchema, type HubspotMeetingBookSuccess } from '../../../../types'

export default defineEventHandler(async (event) => {
  const {
    hubspotMeetingSchedulerToken,
    public: { hubspotApiDomain },
  } = useRuntimeConfig(event)

  const result = await readValidatedBody(event, bookSchema.safeParse)
  if (!result.success) throw result.error.issues

  const { guestEmails = [], likelyAvailableUserIds = [], formFields = {}, ...body } = result.data

  const url = new URL('/scheduler/v3/meetings/meeting-links/book', hubspotApiDomain)
  const response = await $fetch<HubspotMeetingBookSuccess>(url.toString(), {
    headers: {
      Authorization: `Bearer ${hubspotMeetingSchedulerToken}`,
    },
    method: 'POST',
    body: {
      ...body,
      guestEmails,
      likelyAvailableUserIds,
      formFields: Object.entries(formFields).map(([name, value]) => ({
        name,
        value,
      })),
    },
  })

  return response
})
