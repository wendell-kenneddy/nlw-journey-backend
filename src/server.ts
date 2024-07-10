import cors from "@fastify/cors";
import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { confirmParticipant } from "./routes/confirm-participant";
import { confirmTrip } from "./routes/confirm-trip";
import { createActivity } from "./routes/create-activity";
import { createTripLink } from "./routes/create-link";
import { createTrip } from "./routes/create-trip";
import { getActivities } from "./routes/get-activities";
import { getTripLinks } from "./routes/get-links";
import { getParticipantDetails } from "./routes/get-participant-details";
import { getParticipants } from "./routes/get-participants";
import { getTripDetails } from "./routes/get-trip-details";
import { inviteParticipant } from "./routes/invite-participants";
import { updateTrip } from "./routes/update-trip";
import { env } from "./env";

const app = fastify();
const { PORT, API_BASE_URL, ORIGIN } = env;

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(cors, { origin: ORIGIN });

app.register(createTrip);
app.register(confirmTrip);
app.register(confirmParticipant);
app.register(createActivity);
app.register(getActivities);
app.register(createTripLink);
app.register(getTripLinks);
app.register(getParticipants);
app.register(inviteParticipant);
app.register(updateTrip);
app.register(getTripDetails);
app.register(getParticipantDetails);

app.listen({ port: PORT }, () => {
  console.log(`[server]: server running on ${API_BASE_URL}:${PORT}`);
});
