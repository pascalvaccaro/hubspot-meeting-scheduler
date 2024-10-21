export interface HubspotMeeting {
  id: string
  slug: string
  link: string
  name: string
  type: 'ROUND_ROBIN_CALENDAR' | 'PERSONAL_LINK' | 'GROUP_CALENDAR'
  organizerUserId: string
  userIdsOfLinkMembers: string[]
  defaultLink: boolean
  createdAt: string
  updatedAt: string
}

export interface HubspotMeetingLink {
  linkId: string
  isOffline: boolean
  customParams: {
    legalConsentEnabled: boolean
    ownerPrioritized: boolean
    legalConsentOptions: {
      legitimateInterestSubscriptionTypes: number[]
      communicationConsentCheckboxes: {
        communicationTypeId: string
        label: string
        required: boolean
      }[]
      legitimateInterestLegalBasis: string
      communicationConsentText: string
      processingConsentType: string
      processingConsentText: string
      processingConsentCheckboxLabel: string
      processingConsentFooterText: string
      privacyPolicyText: string
      isLegitimateInterest: boolean
    }
    formFields: CustomFormField[]
    displayInfo: {
      avatar: string
      companyAvatar: string
      publicDisplayAvatarOption: string
    }
    guestSettings: {
      canAddGuests: boolean
      maxGuestCount: number
    }
    meetingBufferTime: number
    availability: {
      FRIDAY: OneDay[]
      MONDAY: OneDay[]
      THURSDAY: OneDay[]
      TUESDAY: OneDay[]
      WEDNESDAY: OneDay[]
    }
    startTimeIncrementMinutes: string
    weeksToAdvertise: number
    durations: number[]
    location: string
    welcomeScreenInfo: {
      useCompanyLogo: boolean
      showWelcomeScreen: boolean
    }
  }
  linkType: string
  allUsersBusyTimes: HubspotBusyTime[]
  brandingMetadata: Record<string, unknown>
  linkAvailability: LinkAvailability
}

export type HubspotMeetingAvailabilities = Pick<HubspotMeetingLink, 'allUsersBusyTimes' | 'linkAvailability'>

export type HubspotMeetingBookSuccess = {
  calendarEventId: string
  start: string
  duration: number
  contactId: string
  bookingTimezone: string
  locale: string
  legalConsentResponses: Array<unknown>
  formFields: {
    name: string
    label: string
    value: string
    isCustom: boolean
    fieldType: string
  }[]
  guestEmails: Array<string>
  subject: string
  location: string
  webConferenceMeetingId: string
  webConferenceUrl: string
  isOffline: boolean
  end: string
}

export type CustomFormField = {
  name: string
  label: string
  fieldType:
    | 'phonenumber'
    | 'textarea'
    | 'text'
    | 'date'
    | 'file'
    | 'number'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'booleancheckbox'
  type: 'string' | 'number' | 'date' | 'datetime' | 'enumeration'
  isCustom: boolean
  isRequired: boolean
}

type LinkAvailability = {
  linkAvailabilityByDuration: Record<
    string,
    {
      meetingDurationMillis: number
      availabilities: {
        startMillisUtc: number
        endMillisUtc: number
      }[]
    }
  >
  hasMore: boolean
}

type HubspotBusyTime = {
  isOffline: boolean
  meetingsUser: {
    id: string
    userId: string
    isSalesStarter: boolean
    userProfile: {
      firstName: string
      lastName: string
      email: string
      fullName: string
    }
    calendarProvider: string
  }
  busyTimes: {
    start: number
    end: number
  }[]
}

type OneDay = {
  start: number
  end: number
}
