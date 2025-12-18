import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true });

export const validateJSON = (schema, data) => {
  const validate = ajv.compile(schema);
  return validate(data);
};

export const withRetry = async ({
  task,
  attempts = 2,
  onFail
}) => {
  let lastError;

  for (let i = 0; i < attempts; i++) {
    try {
      return await task();
    } catch (err) {
      lastError = err;
    }
  }

  if (onFail) return onFail(lastError);
  throw lastError;
};
