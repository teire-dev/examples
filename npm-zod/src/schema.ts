import { z } from "zod";

export enum Channel {
  Email = "email",
  Chat = "chat",
  Phone = "phone",
}

export const Ticket = z
  .object({
    id: z.number().int().positive(),
    email: z.string().email(),
    channel: z.nativeEnum(Channel),
    subject: z.string().min(1),
    labels: z.record(z.string()).default({}),
  })
  .strict();

export type Ticket = z.infer<typeof Ticket>;
