<script
  setup
  lang="ts"
  generic="
    CustomFormValues extends Record<string, string | number | boolean> = Record<string, string | number | boolean>
  "
>
import type { ZodIssue } from 'zod'
import type {
  CreateBooking,
  CustomFormField,
  HubspotMeeting,
  HubspotMeetingBookSuccess,
  HubspotMeetingLink,
} from '../types'

const {
  canCancel = true,
  customFormValues,
  labels,
  locale = 'en',
  meetingType = 'ROUND_ROBIN_CALENDAR',
  meetingName,
  organizerId,
  timezones = Intl.supportedValuesOf('timeZone'),
  userInfos,
} = defineProps<{
  canCancel?: boolean
  customFormValues?: CustomFormValues
  dateFormat?: string
  labels?: {
    cancel?: string
    email?: string
    firstName?: string
    lastName?: string
    selectDay?: string
    selectMeeting?: string
    selectTime?: string
    submit?: string
    timezone?: string
  }
  locale?: string
  meetingName?: string
  meetingType?: 'PERSONAL_LINK' | 'GROUP_CALENDAR' | 'ROUND_ROBIN_CALENDAR'
  organizerId?: string
  startDate?: Date | number
  timezones?: string[]
  userInfos?: {
    email: string
    firstName?: string
    lastName?: string
  }
}>()

const emits = defineEmits<{
  'on-booking-error': [ZodIssue[]]
  'on-cancel': []
  'on-datetime-select': [number]
  'on-link-select': [HubspotMeeting]
}>()

defineSlots<{
  'custom-fields'(values: {
    fields: Array<
      CustomFormField & {
        value?: string | number | boolean
      }
    >
    handleChangeField: (name: string, value?: string | number | boolean | null) => void
  }): unknown
  'date-picker'(values: { date?: string; handleSelectDate: (v: string) => void }): unknown
  'duration-selector'(values: { duration?: number; handleSelectDuration: (v: number) => void }): unknown
  'identity-fields'(values: {
    email: string
    firstName: string
    lastName: string
    handleChangeIdentity: (field: 'email' | 'firstName' | 'lastName', value: string) => void
  }): unknown
  'meeting-actions'(values: {
    formValues: CreateBooking
    handleSubmitMeeting: (v: CreateBooking) => Promise<HubspotMeetingBookSuccess | null>
  }): unknown
  'meeting-selector'(values: {
    meeting?: HubspotMeeting
    handleSelectMeeting: (v: HubspotMeeting) => void | Promise<void>
  }): unknown
  'time-picker'(values: { time?: number; handleSelectTime: (v: number) => void }): unknown
  'timezone-selector'(values: { timezone: string; handleSelectTimezone: (v: string) => void }): unknown
}>()

const now = new Date().getTime()

const selectedTimezone = defineModel<string>('timezone', {
  default: () => 'Europe/Paris',
})
const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'long',
      timeZone: selectedTimezone.value,
    })
)
const timeFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
      timeZone: selectedTimezone.value,
    })
)

const { data: meetingLinks } = useFetch('/api/hubspot/meetings', {
  query: { name: meetingName, organizerId, type: meetingType },
})

const selectedMeeting = ref<HubspotMeeting | undefined>(meetingLinks.value?.[0])
const selectedDate = defineModel<string>('date', {
  default: () => '',
})
const selectedDuration = defineModel<number>('duration', {
  default: () => 1800000,
})
const selectedTime = defineModel<number>('time', {
  default: () => new Date().getTime(),
})
const email = ref<string>(userInfos?.email ?? '')
const firstName = ref<string>(userInfos?.firstName ?? '')
const lastName = ref<string>(userInfos?.lastName ?? '')

const formValues = reactive({
  duration: selectedDuration,
  email,
  firstName,
  formFields: customFormValues,
  lastName,
  slug: selectedMeeting.value?.slug ?? '',
  startTime: selectedTime,
  timezone: selectedTimezone,
})

const { data: meeting } = useFetch<HubspotMeetingLink>(`/api/hubspot/meetings/${selectedMeeting.value?.slug}`, {
  immediate: !!selectedMeeting.value,
  query: { timezone: selectedTimezone.value },
  watch: [selectedMeeting, selectedTimezone],
})

const canSelectMeeting = computed(() => meetingLinks.value && meetingLinks.value.length > 1)
const availableDurations = computed(() => 
  Object.keys(meeting.value?.linkAvailability.linkAvailabilityByDuration ?? {}).map(Number)
)
const availabilities = computed(() =>
  (meeting.value?.linkAvailability.linkAvailabilityByDuration[selectedDuration.value.toString()]?.availabilities ?? [])
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
const customFormFields = computed(() =>
  (meeting.value?.customParams.formFields ?? []).map((field) => ({
    ...field,
    value: customFormValues?.[field.name],
  }))
)
const isValid = computed(
  () =>
    Object.values(formValues).every(Boolean) &&
    Object.values(customFormFields)
      .filter((c) => c.isRequired)
      .every((c) => Boolean(c.value))
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
}
const onDurationSelect = (duration: number) => {
  selectedDuration.value = duration
}
const onTimezoneSelect = (timezone: string) => {
  selectedTimezone.value = timezone
}
const onDateSelect = (date: string) => {
  selectedDate.value = date
}
const onTimeSelect = (time: number) => {
  emits('on-datetime-select', time)
  selectedTime.value = time
}
const onChangeIdentity = (field: 'email' | 'firstName' | 'lastName', value: string) => {
  switch (field) {
    case 'email':
      email.value = value
      break
    case 'firstName':
      firstName.value = value
      break
    case 'lastName':
      lastName.value = value
      break
  }
}
const onChangeCustomField = (name: string, value?: string | number | boolean | null) => {
  if (formValues.formFields?.[name]) {
    ;(formValues.formFields as Record<string, unknown>)[name] = value
  }
}
const bookMeeting = async () => {
  try {
    return await $fetch('/api/hubspot/meetings/book', {
      body: formValues,
      method: 'POST',
    })
  } catch (err) {
    emits('on-booking-error', err as ZodIssue[])
    return null
  }
}

watch(availabilities, (newVal) => {
  if (selectedDate.value) return
  const [firstAvailability] = Object.keys(newVal)
  if (firstAvailability) {
    selectedDate.value = firstAvailability
  }
})

defineExpose({
  bookMeeting,
  formValues,
  meetingLinks,
})
</script>

<template>
  <div :class="['hubspot_container', $attrs.class]">
    <div v-if="canSelectMeeting" class="hubspot_container__meeting-selector">
      <slot name="meeting-selector" :meeting="selectedMeeting" :handle-change-meeting="onMeetingSelect">
        <ul>
          <li
            v-for="link in meetingLinks"
            :key="link.id"
            :class="{ active: link.id === selectedMeeting?.id }"
            @click="onMeetingSelect(link)"
          >
            {{ link.name }}
          </li>
        </ul>
      </slot>
    </div>

    <div class="hubspot_container__timezone-selector">
      <slot name="timezone-selector" :timezone="selectedTimezone" :handle-select-timezone="onTimezoneSelect">
        <label for="timezone">
          <p>{{ labels?.timezone ?? 'Timezone' }}</p>
          <select v-model="selectedTimezone" name="timezone">
            <option v-for="tz in timezones" :key="tz" :value="tz">
              {{ tz }}
            </option>
          </select>
        </label>
      </slot>
    </div>

    <div class="hubspot_container__duration-selector">
      <slot name="duration-selector" :duration="selectedDuration" :handle-select-duration="onDurationSelect">
        <ul>
          <li
            v-for="duration in availableDurations"
            :key="duration"
            :class="{ active: duration === selectedDuration }"
            @click="onDurationSelect(duration)"
          >
            {{ duration / 60000 }} minutes
          </li>
        </ul>
      </slot>
    </div>

    <div class="hubspot_container__date-picker">
      <slot name="date-picker" :date="selectedDate" :handle-select-date="onDateSelect">
        <ul>
          <li
            v-for="day in Object.keys(availabilities)"
            :key="day"
            :class="{ active: day === selectedDate }"
            @click="onDateSelect(day)"
          >
            {{ dateFormatter.format(Number(day)) }}
          </li>
        </ul>
      </slot>
    </div>

    <div class="hubspot_container__time-picker">
      <slot name="time-picker" :time="selectedTime" :handle-select-time="onTimeSelect">
        <ul>
          <li
            v-for="timeSlot in availabilities[Number(selectedDate)]"
            :key="timeSlot"
            :class="{ active: timeSlot === selectedTime }"
            @click="onTimeSelect(timeSlot)"
          >
            {{ timeFormatter.format(Number(timeSlot)) }}
          </li>
        </ul>
      </slot>
    </div>

    <div class="hubspot_container__identity-fields">
      <slot
        name="identity-fields"
        :email="email"
        :first-name="firstName"
        :last-name="lastName"
        :handle-change-identity="onChangeIdentity"
      >
        <fieldset>
          <label for="firstName">
            <p>{{ labels?.firstName ?? 'First name' }}</p>
            <input v-model="firstName" name="firstName" >
          </label>
          <label for="lastName">
            <p>{{ labels?.lastName ?? 'Last name' }}</p>
            <input v-model="lastName" name="lastName" >
          </label>
          <label for="email">
            <p>{{ labels?.email ?? 'Email' }}</p>
            <input v-model="email" name="email" type="email" >
          </label>
        </fieldset>
      </slot>
    </div>

    <div v-if="customFormFields.length" class="hubspot_container__custom-fields">
      <slot name="custom-fields" :fields="customFormFields" :handle-change-field="onChangeCustomField">
        <fieldset>
          <label v-for="field in customFormFields" :key="field.name" :for="field.name">
            <p>{{ field.label }}</p>
            <component
              :is="getCustomFieldAttrs(field).is"
              :name="field.name"
              :value="field.value"
              :required="!!field.isRequired"
              :type="getCustomFieldAttrs(field).type"
              @change="onChangeCustomField(field.name, ($event.target as HTMLInputElement)?.value)"
            />
          </label>
        </fieldset>
      </slot>
    </div>

    <div class="hubspot_container__meeting-actions">
      <slot name="meeting-actions" :form-values="formValues" :handle-submit-meeting="bookMeeting">
        <button v-if="canCancel" class="hubspot_container__cancel-btn" type="button" @click="$emit('on-cancel')">
          {{ labels?.cancel ?? 'Cancel' }}
        </button>
        <button class="hubspot_container__submit-btn" type="button" :disabled="!isValid" @click="bookMeeting">
          {{ labels?.submit ?? 'Book meeting' }}
        </button>
      </slot>
    </div>
  </div>
</template>
