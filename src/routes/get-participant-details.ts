import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error";
import { prisma } from "../lib/prisma";

const schema = {
  params: z.object({
    participantID: z.string().uuid(),
  }),
};

export async function getParticipantDetails(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/participants/:participantID/details", { schema }, async (req, res) => {
      const { participantID } = req.params;
      const participant = await prisma.participant.findUnique({
        where: { id: participantID },
        select: {
          id: true,
          name: true,
          email: true,
          is_confirmed: true,
        },
      });

      if (!participant) throw new ClientError("Trip not found.");

      return { participant };
    });
}
