import type { CreateBooking, CustomFormField, HubspotMeeting, HubspotMeetingLink } from '../types'

export type MeetingSchedulerProps<
  CustomFormValues extends Record<string, string | number | boolean> = Record<string, string | number | boolean>,
> = {
  customFormValues?: CustomFormValues
  meetingName?: string
  meetingType?: 'PERSONAL_LINK' | 'GROUP_CALENDAR' | 'ROUND_ROBIN_CALENDAR'
  organizerId?: string
  startDate?: Date | number
  userInfos?: {
    email: string
    firstName?: string
    lastName?: string
  }
}

export const useHubspotMeetingScheduler = <
  CustomFormValues extends Record<string, string | number | boolean> = Record<string, string | number | boolean>,
>({
  customFormValues,
  meetingName,
  meetingType,
  organizerId,
  startDate,
  userInfos,
}: MeetingSchedulerProps<CustomFormValues>) => {
  const now = new Date().getTime()

  const { data: meetingLinks } = useFetch('/api/hubspot/meetings', {
    query: { name: meetingName, organizerId, type: meetingType },
  })

  const selectedMeeting = ref<HubspotMeeting>()
  const selectedDate = ref('')

  const meetingUrl = computed(() => `/api/hubspot/meetings/${selectedMeeting.value?.slug}`)
  const { data: meeting, execute } = useFetch<HubspotMeetingLink>(meetingUrl, {
    immediate: !!selectedMeeting.value,
    onRequest: (req) => {
      req.options.query = { timezone: formValues.timezone }
    },
  })
  const customFormFields = computed(() => meeting.value?.customParams.formFields ?? [])

  const formValues = reactive<CreateBooking>({
    duration: 1800000,
    email: userInfos?.email ?? '',
    firstName: userInfos?.firstName ?? '',
    formFields:
      customFormValues ??
      Object.fromEntries(
        customFormFields.value.map((field) => [
          field.name,
          field.type === 'number' ? 0 : field.type === 'enumeration' ? false : '',
        ])
      ),
    lastName: userInfos?.lastName ?? '',
    slug: selectedMeeting.value?.slug ?? '',
    startTime: new Date(startDate ?? now).getTime(),
    timezone: 'Europe/Paris',
  })

  const canSelectMeeting = computed(() => meetingLinks.value && meetingLinks.value.length > 1)
  const availableDurations = computed(() =>
    Object.keys(meeting.value?.linkAvailability.linkAvailabilityByDuration ?? {}).map(Number)
  )
  const availabilities = computed(() =>
    (meeting.value?.linkAvailability.linkAvailabilityByDuration[formValues.duration.toString()]?.availabilities ?? [])
      .filter((c) => c.startMillisUtc > now)
      .reduce(
        (acc, c) => {
          const date = new Date(c.startMillisUtc)
          const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
          return {
            ...acc,
            [day]: [...(acc[day] ?? []), c.startMillisUtc],
          }
        },
        {} as Record<number, number[]>
      )
  )
  const isValid = computed(
    () =>
      Object.values(formValues).every(Boolean) &&
      availabilities.value[Number(selectedDate.value)]?.includes(formValues.startTime) &&
      Object.entries(formValues.formFields ?? {})
        .filter(([key]) => customFormFields.value.find((field) => field.name === key)?.isRequired)
        .every(([, value]) => Boolean(value))
  )

  const getCustomFieldAttrs = (field: CustomFormField) => {
    switch (field.fieldType) {
      case 'phonenumber':
        return { is: 'input', type: 'tel' }
      case 'booleancheckbox':
      case 'checkbox':
        return { is: 'input', type: 'checkbox' }
      case 'select':
      case 'textarea':
        return { is: field.fieldType }
      default:
        return { is: 'input', type: field.fieldType }
    }
  }

  const onMeetingSelect = (meeting: HubspotMeeting) => {
    selectedMeeting.value = meeting
    formValues.slug = meeting.slug
  }
  const onDurationSelect = (duration: number) => {
    formValues.duration = duration
  }
  const onTimezoneSelect = (timezone: string) => {
    formValues.timezone = timezone
    execute({ dedupe: true })
  }
  const onDateSelect = (date: string) => {
    selectedDate.value = date
  }
  const onTimeSelect = (time: number) => {
    formValues.startTime = time
  }
  const onChangeFormField = (field: 'email' | 'firstName' | 'lastName' | string, value?: string | number | boolean) => {
    switch (field) {
      case 'email':
        formValues.email = value as string
        break
      case 'firstName':
        formValues.firstName = value as string
        break
      case 'lastName':
        formValues.lastName = value as string
        break
      default:
        ;(formValues.formFields as Record<string, unknown>)[field] = value
    }
  }

  const mutation = async (body: CreateBooking) =>
    $fetch('/api/hubspot/meetings/book', {
      body,
      method: 'POST',
    })

  return {
    availabilities,
    availableDurations,
    canSelectMeeting,
    customFormFields,
    formValues,
    getCustomFieldAttrs,
    meeting,
    meetingLinks,
    mutation,
    onChangeFormField,
    onDateSelect,
    onDurationSelect,
    onMeetingSelect,
    onTimeSelect,
    onTimezoneSelect,
    isValid,
    selectedDate,
  }
}
