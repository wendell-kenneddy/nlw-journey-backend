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

export async function getTripLinks(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/trips/:tripID/links", { schema }, async (req, res) => {
      const { tripID } = req.params;
      const trip = await prisma.trip.findUnique({
        where: { id: tripID },
        include: {
          links: true,
        },
      });

      if (!trip) throw new ClientError("Trip not found.");

      return { links: trip.links };
    });
}
