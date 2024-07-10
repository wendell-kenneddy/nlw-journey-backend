import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error";
import { prisma } from "../lib/prisma";

const schema = {
  params: z.object({
    tripID: z.string().uuid(),
  }),
};

export async function getParticipants(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/trips/:tripID/participants", { schema }, async (req, res) => {
      const { tripID } = req.params;
      const trip = await prisma.trip.findUnique({
        where: { id: tripID },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              email: true,
              is_confirmed: true,
            },
          },
        },
      });

      if (!trip) throw new ClientError("Activity not found.");

      return { participants: trip.participants };
    });
}
