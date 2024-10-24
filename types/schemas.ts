import { z } from 'zod'

export const bookSchema = z.object({
  duration: z.number(),
  email: z.string().email(),
  firstName: z.string(),
  formFields: z.optional(z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))),
  guestEmails: z.optional(z.string().array()),
  lastName: z.string(),
  likelyAvailableUserIds: z.optional(z.string().array()),
  slug: z.string(),
  startTime: z.number(),
  timezone: z.string().default('Europe/Paris'),
})

export type CreateBooking<
  CustomFormValues extends Record<string, string | number | boolean> =
  Record<string, string | number | boolean>> = 
Omit<typeof bookSchema._type, 'formFields'> & {
  formFields: CustomFormValues
}
