import { z } from "zod";

export const paymentModeSchema = z.enum(["Cash", "Bank"]);

export const createLoanSchema = z
  .object({
    customerName: z.string().min(1, "Customer name is required"),
    loanDate: z.coerce.date(),
    loanAmount: z.coerce.number().positive("Loan amount must be greater than 0"),
    interestRate: z.coerce.number().min(0, "Interest rate cannot be negative"),
    pledgedItem: z.string().min(1, "Pledged item is required"),
    grossWeight: z.coerce.number().positive("Gross weight must be greater than 0"),
    stoneWeight: z.coerce.number().min(0, "Stone weight cannot be negative"),
    estimatedValue: z.coerce
      .number()
      .positive("Estimated value must be greater than 0"),
    paymentMode: paymentModeSchema,
  })
  .refine((data) => data.stoneWeight <= data.grossWeight, {
    message: "Stone weight cannot exceed gross weight",
    path: ["stoneWeight"],
  });

export const createPaymentSchema = z.object({
  loanId: z.string().min(1, "Loan is required"),
  amount: z.coerce.number().positive("Payment amount must be greater than 0"),
  paymentDate: z.coerce.date().optional(),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export function validationErrorResponse(error: z.ZodError) {
  return {
    error: "Validation failed",
    details: error.flatten().fieldErrors,
  };
}
