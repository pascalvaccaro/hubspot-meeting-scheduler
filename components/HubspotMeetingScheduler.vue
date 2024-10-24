<script
  setup
  lang="ts"
  generic="
    CustomFormValues extends Record<string, string | number | boolean> = Record<string, string | number | boolean>
  "
>
import { watch } from 'vue'
import { useHubspotMeetingScheduler, type MeetingSchedulerProps } from '../composables/useHubspotMeetingScheduler'
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
  labels,
  locale = 'en',
  timezones = Intl.supportedValuesOf('timeZone'),
  ...props
} = defineProps<
  MeetingSchedulerProps<CustomFormValues> & {
    canCancel?: boolean
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
    timezones?: string[]
  }
>()

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
  'form-fields'(values: {
    email: string
    firstName: string
    lastName: string
    handleChangeIdentity: (field: 'email' | 'firstName' | 'lastName', value: string) => void
  }): unknown
  'meeting-actions'(values: {
    formValues: CreateBooking
    handleSubmitMeeting: (v?: CreateBooking) => Promise<HubspotMeetingBookSuccess | null>
  }): unknown
  'meeting-selector'(values: {
    meeting?: HubspotMeetingLink | null
    handleSelectMeeting: (v: HubspotMeeting) => void | Promise<void>
  }): unknown
  'time-picker'(values: { time?: number; handleSelectTime: (v: number) => void }): unknown
  'timezone-selector'(values: { timezone: string; handleSelectTimezone: (v: string) => void }): unknown
}>()

const {
  availabilities,
  availableDurations,
  canSelectMeeting,
  customFormFields,
  formValues,
  getCustomFieldAttrs,
  isValid,
  meeting,
  meetingLinks,
  mutation,
  onChangeFormField,
  onDateSelect,
  onDurationSelect,
  onMeetingSelect,
  onTimeSelect,
  onTimezoneSelect,
  selectedDate,
} = useHubspotMeetingScheduler<CustomFormValues>(props)

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: formValues.timezone,
  }).format(Number(date))

const formatTime = (time: number) =>
  new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: formValues.timezone,
    timeZoneName: 'short',
  }).format(time)

const handleMeetingSelect = (meeting: HubspotMeeting) => {
  emits('on-link-select', meeting)
  onMeetingSelect(meeting)
}
const handleTimeSelect = (time: number) => {
  emits('on-datetime-select', time)
  onTimeSelect(time)
}

const bookMeeting = async (values = formValues) => {
  try {
    return await mutation(values)
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
watch(availableDurations, (newVal) => {
  if (newVal.length === 1) formValues.duration = newVal[0]
})
watch(meetingLinks, (newVal) => {
  if (newVal && newVal.length >= 1) onMeetingSelect(newVal[0])
})

defineExpose({
  bookMeeting,
  formValues,
  meetingLinks,
})
</script>

<template>
  <div :class="$attrs.class || 'hubspot-meeting-scheduler'">
    <slot name="meeting-selector" :meeting="meeting" :handle-change-meeting="onMeetingSelect">
      <div v-if="canSelectMeeting" class="hubspot-meeting-scheduler__meeting-selector">
        <ul>
          <li
            v-for="link in meetingLinks"
            :key="link.id"
            :class="{ active: link.id === meeting?.linkId }"
            @click="handleMeetingSelect(link)"
          >
            {{ link.name }}
          </li>
        </ul>
      </div>
    </slot>

    <slot name="timezone-selector" :timezone="formValues.timezone" :handle-select-timezone="onTimezoneSelect">
      <div class="hubspot-meeting-scheduler__timezone-selector">
        <label for="timezone">
          <p>{{ labels?.timezone ?? 'Timezone' }}</p>
          <select
            name="timezone"
            :value="formValues.timezone"
            @change="onTimezoneSelect(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="tz in timezones" :key="tz" :value="tz" :selected="tz === formValues.timezone">
              {{ tz }}
            </option>
          </select>
        </label>
      </div>
    </slot>

    <slot name="duration-selector" :duration="formValues.duration" :handle-select-duration="onDurationSelect">
      <div class="hubspot-meeting-scheduler__duration-selector">
        <ul>
          <li
            v-for="duration in availableDurations"
            :key="duration"
            :class="{ active: duration === formValues.duration }"
            @click="onDurationSelect(duration)"
          >
            {{ duration / 60000 }} minutes
          </li>
        </ul>
      </div>
    </slot>

    <slot name="date-picker" :date="selectedDate" :handle-select-date="onDateSelect">
      <div class="hubspot-meeting-scheduler__date-picker">
        <ul>
          <li
            v-for="day in Object.keys(availabilities)"
            :key="day"
            :class="{ active: day === selectedDate }"
            @click="onDateSelect(day)"
          >
            {{ formatDate(day) }}
          </li>
        </ul>
      </div>
    </slot>

    <slot name="time-picker" :time="formValues.startTime" :handle-select-time="handleTimeSelect">
      <div class="hubspot-meeting-scheduler__time-picker">
        <ul>
          <li
            v-for="timeSlot in availabilities[Number(selectedDate)]"
            :key="timeSlot"
            :class="{ active: timeSlot === formValues.startTime }"
            @click="onTimeSelect(timeSlot)"
          >
            {{ formatTime(timeSlot) }}
          </li>
        </ul>
      </div>
    </slot>

    <slot
      name="form-fields"
      :email="formValues.email"
      :first-name="formValues.firstName"
      :last-name="formValues.lastName"
      :custom-fields="customFormFields"
      :handle-change-form-field="onChangeFormField"
    >
      <div class="hubspot-meeting-scheduler__form-fields">
        <fieldset>
          <label for="firstName">
            <p>{{ labels?.firstName ?? 'First name' }}</p>
            <input
              name="firstName"
              :value="formValues.firstName"
              @change="onChangeFormField('firstName', ($event.target as HTMLInputElement).value)"
            >
          </label>
          <label for="lastName">
            <p>{{ labels?.lastName ?? 'Last name' }}</p>
            <input
              name="lastName"
              :value="formValues.lastName"
              @change="onChangeFormField('lastName', ($event.target as HTMLInputElement).value)"
            >
          </label>
          <label for="email">
            <p>{{ labels?.email ?? 'Email' }}</p>
            <input
              name="email"
              type="email"
              :value="formValues.email"
              @change="onChangeFormField('email', ($event.target as HTMLInputElement).value)"
            >
          </label>
          <template v-if="formValues.formFields">
            <label v-for="field in customFormFields" :key="field.name" :for="field.name">
              <p>{{ field.label }}</p>
              <component
                :is="getCustomFieldAttrs(field).is"
                :name="field.name"
                :value="formValues.formFields[field.name] ?? ''"
                :required="!!field.isRequired"
                :type="getCustomFieldAttrs(field).type"
                @change="onChangeFormField(field.name, ($event.target as HTMLInputElement)?.value)"
              />
            </label>
          </template>
        </fieldset>
      </div>
    </slot>

    <slot name="meeting-actions" :form-values="formValues" :handle-submit-meeting="bookMeeting">
      <div class="hubspot-meeting-scheduler__meeting-actions">
        <button
          v-if="canCancel"
          class="hubspot-meeting-scheduler__cancel-btn"
          type="button"
          @click="$emit('on-cancel')"
        >
          {{ labels?.cancel ?? 'Cancel' }}
        </button>
        <button
          class="hubspot-meeting-scheduler__submit-btn"
          type="button"
          :disabled="!isValid"
          @click="() => bookMeeting()"
        >
          {{ labels?.submit ?? 'Book meeting' }}
        </button>
      </div>
    </slot>
  </div>
</template>
