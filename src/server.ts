import cors from "@fastify/cors";
import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { confirmParticipant } from "./routes/confirm-participant";
import { confirmTrip } from "./routes/confirm-trip";
import { createTrip } from "./routes/create-trip";
import { createActivity } from "./routes/create-activity";
import { getActivities } from "./routes/get-activities";
import { createTripLink } from "./routes/create-link";
import { getTripLinks } from "./routes/get-links";

const app = fastify();
const port = Number(process.env.PORT);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(cors, { origin: String(process.env.ORIGIN) });

app.register(createTrip);
app.register(confirmTrip);
app.register(confirmParticipant);
app.register(createActivity);
app.register(getActivities);
app.register(createTripLink);
app.register(getTripLinks);

app.listen({ port }, () => {
  console.log("[server]: server running on http://localhost:" + port);
});
