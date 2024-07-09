import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { prisma } from "../lib/prisma";

const schema = {
  params: z.object({
    tripID: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(4),
    occurs_at: z.coerce.date(),
  }),
};

export async function createActivity(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post("/trips/:tripID/activities", { schema }, async (req, res) => {
      const { tripID } = req.params;
      const { title, occurs_at } = req.body;
      const trip = await prisma.trip.findUnique({ where: { id: tripID } });

      if (!trip) throw new Error("Trip not found.");

      if (dayjs(occurs_at).isBefore(trip.starts_at)) {
        throw new Error("Activity can't start before the trip starts.");
      }

      if (dayjs(occurs_at).isAfter(trip.ends_at)) {
        throw new Error("Activity can't start after the trip ends.");
      }

      const activity = await prisma.activity.create({
        data: {
          title,
          occurs_at,
          trip_id: tripID,
        },
      });

      return { activityID: activity.id };
    });
}
