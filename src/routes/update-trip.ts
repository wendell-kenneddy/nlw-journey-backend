import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error";
import { dayjs } from "../lib/dayjs";
import { prisma } from "../lib/prisma";

const schema = {
  params: z.object({
    tripID: z.string().uuid(),
  }),
  body: z.object({
    destination: z
      .string({ message: "Invalid destination." })
      .min(4, "Destination must be at least 4 characters long."),
    starts_at: z.coerce.date({ message: "Invalid start date." }),
    ends_at: z.coerce.date({ message: "Invalid end date." }),
  }),
};

export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put("/trips/:tripID", { schema }, async (req, res) => {
    const { tripID } = req.params;
    const { destination, ends_at, starts_at } = req.body;
    const trip = await prisma.trip.findUnique({ where: { id: tripID } });

    if (!trip) throw new ClientError("Trip not found.");

    if (dayjs(starts_at).isBefore(new Date())) throw new ClientError("Invalid start date.");
    if (dayjs(ends_at).isBefore(starts_at)) throw new ClientError("Invalid end date.");

    await prisma.trip.update({
      data: {
        destination,
        starts_at,
        ends_at,
      },
      where: { id: tripID },
    });

    return { tripID };
  });
}
