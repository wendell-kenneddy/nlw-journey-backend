import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { ClientError } from "./errors/client-error";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (err, req, res) => {
  console.log(err);

  if (err instanceof ZodError) {
    return res.status(400).send({
      message: "Invalid input.",
      errors: err.flatten().fieldErrors,
    });
  }

  if (err instanceof ClientError) {
    return res.status(400).send({
      message: err.message,
    });
  }

  res.status(500).send({ message: "Internal server error." });
};
