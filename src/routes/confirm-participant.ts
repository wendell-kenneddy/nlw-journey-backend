import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error";
import { prisma } from "../lib/prisma";

const schema = { params: z.object({ participantID: z.string().uuid() }) };

export async function confirmParticipant(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/participants/:participantID/confirm", { schema }, async (req, res) => {
      const { participantID } = req.params;
      const participant = await prisma.participant.findUnique({ where: { id: participantID } });

      if (!participant) throw new ClientError("Participant not found.");

      if (!participant.is_confirmed) {
        await prisma.participant.update({
          where: { id: participant.id },
          data: {
            is_confirmed: true,
          },
        });
      }

      return res.redirect(String(process.env.WEB_URL));
    });
}
