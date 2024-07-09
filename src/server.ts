import fastify from "fastify";
import { createTrip } from "./routes/create-trip";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

const app = fastify();
const port = Number(process.env.PORT);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(createTrip);

app.listen({ port }, () => {
  console.log("[server]: server running on http://localhost:" + port);
});
