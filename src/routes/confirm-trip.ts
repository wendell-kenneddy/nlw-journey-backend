import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";

const schema = { params: z.object({ tripID: z.string().uuid() }) };

export async function confirmTrip(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/trips/:tripID/confirm", { schema }, async (req, res) => {
      const { tripID } = req.params;
      const trip = await prisma.trip.findUnique({
        where: { id: tripID },
        include: {
          participants: {
            where: {
              is_owner: false,
            },
          },
        },
      });

      if (!trip) {
        res.status(400);
        return { message: "Trip not found." };
      }

      if (trip.is_confirmed) {
        return res.redirect(String(process.env.WEB_URL));
      }

      await prisma.trip.update({
        where: { id: tripID },
        data: {
          is_confirmed: true,
        },
      });

      const mail = await getMailClient();
      const formattedStartDate = dayjs(trip.starts_at).format("LL");
      const formattedEndDate = dayjs(trip.ends_at).format("LL");

      await Promise.all(
        trip.participants.map(async (p) => {
          const confirmationLink = `http://localhost:${String(process.env.PORT)}/participants/${
            p.id
          }/confirm`;
          const message = await mail.sendMail({
            from: {
              name: "Plann.er Team",
              address: "hello@plann.er.com",
            },
            to: p.email,
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
        })
      );

      return res.redirect(String(process.env.WEB_URL));
    });
}
