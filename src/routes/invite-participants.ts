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
  params: z.object({
    tripID: z.string().uuid(),
  }),
  body: z.object({
    email: z.string().email(),
  }),
};

export async function inviteParticipant(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post("/trips/:tripID/invites", { schema }, async (req, res) => {
      const { tripID } = req.params;
      const { email } = req.body;
      const trip = await prisma.trip.findUnique({ where: { id: tripID } });

      if (!trip) throw new ClientError("Trip not found.");

      const participant = await prisma.participant.create({
        data: {
          email,
          trip_id: tripID,
        },
      });

      const { API_BASE_URL, PORT } = env;
      const mail = await getMailClient();
      const formattedStartDate = dayjs(trip.starts_at).format("LL");
      const formattedEndDate = dayjs(trip.ends_at).format("LL");

      const confirmationLink = `${API_BASE_URL}:${PORT}/participants/${participant.id}/confirm`;
      const message = await mail.sendMail({
        from: {
          name: "Plann.er Team",
          address: "hello@plann.er.com",
        },
        to: participant.email,
        subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
        html: `
               <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6">
                 <p>
                   Você foi convidado para participar de uma viagem para <strong>${trip.destination}</strong>, nas datas de
                   <strong>${formattedStartDate} a ${formattedEndDate}</strong>.
                 </p>
                 <br />
                 <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
                 <br />
                 <a href="${confirmationLink}" rel="noopener noreferrer">Confirmar presença</a>
                 <br />
                 <p>Caso você não saiba do que se trata esse e-mail, apenas ignore.</p>
               </div>
            `.trim(),
      });
      console.log(nodemailer.getTestMessageUrl(message));

      return { participantID: participant.id };
    });
}
