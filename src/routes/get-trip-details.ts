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

export async function getTripDetails(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/trips/:tripID/details", { schema }, async (req, res) => {
      const { tripID } = req.params;
      const trip = await prisma.trip.findUnique({
        where: { id: tripID },
        select: {
          id: true,
          destination: true,
          starts_at: true,
          ends_at: true,
          is_confirmed: true,
          created_at: true,
        },
      });

      if (!trip) throw new ClientError("Trip not found.");

      return { trip };
    });
}
