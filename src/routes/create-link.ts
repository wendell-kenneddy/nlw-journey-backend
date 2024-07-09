import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const schema = {
  params: z.object({
    tripID: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(4),
    url: z.string().url(),
  }),
};

export async function createTripLink(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post("/trips/:tripID/links", { schema }, async (req, res) => {
      const { tripID } = req.params;
      const { title, url } = req.body;
      const trip = await prisma.trip.findUnique({
        where: { id: tripID },
      });

      if (!trip) throw new Error("Trip not found.");
      const link = await prisma.link.create({ data: { title, url, trip_id: tripID } });

      return { linkID: link.id };
    });
}
