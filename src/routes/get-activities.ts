import { Activity } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { prisma } from "../lib/prisma";

const schema = {
  params: z.object({
    tripID: z.string().uuid(),
  }),
};

type ActivitiesByDate = Record<string, Activity[]>;

export async function getActivities(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/trips/:tripID/activities", { schema }, async (req, res) => {
      const { tripID } = req.params;
      const trip = await prisma.trip.findUnique({
        where: { id: tripID },
        include: { activities: true },
      });

      if (!trip) throw new Error("Activity not found.");

      const activitiesByDate = trip.activities.reduce<ActivitiesByDate>((acc, curr) => {
        const nextValue = acc;
        const formattedDate = dayjs(curr.occurs_at).format("LL");
        if (!nextValue[formattedDate]) {
          nextValue[formattedDate] = [];
        }

        nextValue[formattedDate].push(curr);

        return nextValue;
      }, {});

      return { activities: activitiesByDate };
    });
}
