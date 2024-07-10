import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { env } from "../env";
import { ClientError } from "../errors/client-error";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";

const schema = {
  body: z.object({
    destination: z
      .string({ message: "Invalid destination." })
      .min(4, "Destination must be at least 4 characters long."),
    starts_at: z.coerce.date({ message: "Invalid start date." }),
    ends_at: z.coerce.date({ message: "Invalid end date." }),
    owner_name: z.string(),
    owner_email: z.string().email("Invalid email address."),
    emailsToInvite: z.array(z.string().email()),
  }),
};

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/trips", { schema }, async (req, res) => {
    const { destination, ends_at, starts_at, owner_name, owner_email, emailsToInvite } = req.body;

    if (dayjs(starts_at).isBefore(new Date())) throw new ClientError("Invalid start date.");
    if (dayjs(ends_at).isBefore(starts_at)) throw new ClientError("Invalid end date.");

    const { API_BASE_URL, PORT } = env;
    const formattedStartDate = dayjs(starts_at).format("LL");
    const formattedEndDate = dayjs(ends_at).format("LL");
    const mail = await getMailClient();

    const { id } = await prisma.trip.create({
      data: {
        destination,
        starts_at,
        ends_at,
        participants: {
          createMany: {
            data: [
              {
                name: owner_name,
                email: owner_email,
                is_owner: true,
                is_confirmed: true,
              },
              ...emailsToInvite.map((e) => ({
                email: e,
              })),
            ],
          },
        },
      },
    });
    const confirmationLink = `${API_BASE_URL}:${PORT}/trips/${id}/confirm`;
    const message = await mail.sendMail({
      from: {
        name: "Plann.er Team",
        address: "hello@plann.er.com",
      },
      to: {
        name: owner_name,
        address: owner_email,
      },
      subject: `Confirme sua viagem para ${destination} em ${formattedStartDate}`,
      html: `
         <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6">
           <p>
             Você solicitou a criação de uma viagem para <strong>${destination}</strong>, nas datas de
             <strong>${formattedStartDate} a ${formattedEndDate}</strong>.
           </p>
           <br />
           <p>Para confirmar sua viagem, clique no link abaixo.</p>
           <br />
           <a href="${confirmationLink}" rel="noopener noreferrer">Confirmar viagem</a>
           <br />
           <p>Caso você não saiba do que se trata esse e-mail, apenas ignore.</p>
         </div>
      `.trim(),
    });

    console.log(nodemailer.getTestMessageUrl(message));
    return { tripID: id };
  });
}
