import {z} from 'zod';

export const beneficiarySchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Mobile number must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  bankCountry: z.string().min(1, 'Bank country is required'),
  currency: z.string().min(1, 'Currency is required'),
  accountNumber: z.string().min(1, 'Account/IBAN is required'),
  accountType: z.string().min(1, 'Account type is required'),
  SWIFTBIC: z.string().min(1, 'SWIFT/BIC is required'),
  IFSC: z.string().min(1, 'Routing/IFSC is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  branchName: z.string().min(1, 'Branch name is required'),
});

export type BeneficiaryFormData = z.infer<typeof beneficiarySchema>;
