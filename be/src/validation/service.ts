import { Zod, type Request, type ValidatedType } from '../types/index.js';
import { VALIDATION } from '../utils/index.js';
import {
  checkAndParseErrors,
  emptyErr,
  invalidArrayErr,
  invalidNumberErr,
  invalidObjectErr,
  invalidStringErr,
  invalidStructure,
  invalidUuid,
  maxErr,
  minErr,
  requiredErr,
  validateEmptyObject
} from './utils.js';

/**********************************************************************************/

const {
  NAME_MIN_LEN,
  NAME_MAX_LEN,
  URI_MIN_LEN,
  URI_MAX_LEN,
  MONITOR_INTERVAL_MIN_VALUE,
  MONITOR_INTERVAL_MAX_VALUE,
  THRESHOLD_MIN_VALUE,
  THRESHOLD_MAX_VAL
} = VALIDATION;

/**********************************************************************************/

export const readMany = (req: Request) => {
  const { body, params, query } = req;

  const err = checkAndParseErrors(
    validateEmptyObject('service', { ...body, ...params, ...query })
  );
  if (err) {
    throw err;
  }
};

export const createOne = (req: Request) => {
  const { body, params, query } = req;

  const bodySchema = Zod.object(
    {
      name: Zod.string({
        invalid_type_error: invalidStringErr('name'),
        required_error: requiredErr('name')
      })
        .min(NAME_MIN_LEN, minErr('name', NAME_MIN_LEN))
        .max(NAME_MAX_LEN, maxErr('name', NAME_MAX_LEN))
        .optional(),
      uri: Zod.string({
        invalid_type_error: invalidStringErr('uri'),
        required_error: requiredErr('uri')
      })
        .min(URI_MIN_LEN, minErr('uri', URI_MIN_LEN))
        .max(URI_MAX_LEN, maxErr('uri', URI_MAX_LEN)),
      monitorInterval: Zod.number({
        invalid_type_error: invalidNumberErr('monitor interval'),
        required_error: requiredErr('monitor interval')
      })
        .min(
          MONITOR_INTERVAL_MIN_VALUE,
          `Monitor time can't be lower than ${MONITOR_INTERVAL_MIN_VALUE} ms`
        )
        .max(
          MONITOR_INTERVAL_MAX_VALUE,
          `Monitor time can't be larger than ${MONITOR_INTERVAL_MAX_VALUE} ms`
        ),
      thresholds: Zod.array(
        Zod.object(
          {
            lowerLimit: Zod.number({
              invalid_type_error: invalidNumberErr('lower limit'),
              required_error: requiredErr('lower limit')
            })
              .min(
                THRESHOLD_MIN_VALUE,
                `Threshold lower limit can't be lower than ${THRESHOLD_MIN_VALUE} ms`
              )
              .max(
                THRESHOLD_MAX_VAL,
                `Threshold lower limit can't be larger than ${THRESHOLD_MAX_VAL} ms`
              ),
            upperLimit: Zod.number({
              invalid_type_error: invalidNumberErr('upper limit'),
              required_error: requiredErr('upper limit')
            })
              .min(
                THRESHOLD_MIN_VALUE,
                `Threshold upper limit can't be lower than ${THRESHOLD_MIN_VALUE} ms`
              )
              .max(
                THRESHOLD_MAX_VAL,
                `Threshold upper limit can't be larger than ${THRESHOLD_MAX_VAL} ms`
              )
          },
          {
            invalid_type_error: invalidObjectErr('threshold'),
            required_error: requiredErr('threshold')
          }
        ).transform((val, ctx) => {
          if (val.lowerLimit >= val.upperLimit) {
            ctx.addIssue({
              code: Zod.ZodIssueCode.custom,
              message: 'The upper limit must be larger than the lower limit'
            });

            return Zod.NEVER;
          }

          return val;
        }),
        {
          invalid_type_error: invalidArrayErr('thresholds'),
          required_error: invalidArrayErr('thresholds')
        }
      )
    },
    {
      invalid_type_error: invalidObjectErr('service'),
      required_error: requiredErr('service')
    }
  )
    .strict(invalidStructure('service'))
    .transform(({ name, ...fields }) => {
      return {
        ...fields,
        name: name ?? fields.uri
      };
    });

  const bodyRes = bodySchema.safeParse(body);
  const err = checkAndParseErrors(
    bodyRes,
    validateEmptyObject('service', { ...params, ...query })
  );
  if (err) {
    throw err;
  }

  return (bodyRes as ValidatedType<typeof bodySchema>).data;
};

export const updateOne = (req: Request) => {
  const { body, params, query } = req;

  const paramsSchema = Zod.object(
    {
      serviceId: Zod.string({
        invalid_type_error: invalidStringErr(' service id'),
        required_error: requiredErr(' service id')
      }).uuid(invalidUuid(' service id'))
    },
    {
      invalid_type_error: invalidObjectErr(' service'),
      required_error: requiredErr(' service')
    }
  )
    .strict(invalidStructure(' service'))
    .transform(({ serviceId }) => {
      return { id: serviceId };
    });
  const bodySchema = Zod.object(
    {
      name: Zod.string({
        invalid_type_error: invalidStringErr('uri'),
        required_error: requiredErr('uri')
      })
        .min(NAME_MIN_LEN, minErr('name', NAME_MIN_LEN))
        .max(NAME_MAX_LEN, maxErr('name', NAME_MAX_LEN))
        .optional(),
      uri: Zod.string({
        invalid_type_error: invalidStringErr('uri'),
        required_error: requiredErr('uri')
      })
        .min(URI_MIN_LEN, minErr('uri', URI_MIN_LEN))
        .max(URI_MAX_LEN, maxErr('uri', URI_MAX_LEN))
        .optional(),
      monitorInterval: Zod.number({
        invalid_type_error: invalidNumberErr('monitor interval'),
        required_error: requiredErr('monitor interval')
      })
        .min(
          MONITOR_INTERVAL_MIN_VALUE,
          `Monitor time can't be lower than ${MONITOR_INTERVAL_MIN_VALUE} ms`
        )
        .max(
          MONITOR_INTERVAL_MAX_VALUE,
          `Monitor time can't be larger than ${MONITOR_INTERVAL_MAX_VALUE} ms`
        )
        .optional(),
      thresholds: Zod.array(
        Zod.object(
          {
            lowerLimit: Zod.number({
              invalid_type_error: invalidNumberErr('lower limit'),
              required_error: requiredErr('lower limit')
            })
              .min(
                THRESHOLD_MIN_VALUE,
                `Threshold lower limit can't be lower than ${THRESHOLD_MIN_VALUE} ms`
              )
              .max(
                THRESHOLD_MAX_VAL,
                `Threshold lower limit can't be larger than ${THRESHOLD_MAX_VAL} ms`
              ),
            upperLimit: Zod.number({
              invalid_type_error: invalidNumberErr('upper limit'),
              required_error: requiredErr('upper limit')
            })
              .min(
                THRESHOLD_MIN_VALUE,
                `Threshold upper limit can't be lower than ${THRESHOLD_MIN_VALUE} ms`
              )
              .max(
                THRESHOLD_MAX_VAL,
                `Threshold upper limit can't be larger than ${THRESHOLD_MAX_VAL} ms`
              )
          },
          {
            invalid_type_error: invalidObjectErr('threshold'),
            required_error: requiredErr('threshold')
          }
        ).transform((val, ctx) => {
          if (val.lowerLimit >= val.upperLimit) {
            ctx.addIssue({
              code: Zod.ZodIssueCode.custom,
              message: 'The upper limit must be larger than the lower limit'
            });

            return Zod.NEVER;
          }

          return val;
        }),
        {
          invalid_type_error: invalidArrayErr('thresholds'),
          required_error: invalidArrayErr('thresholds')
        }
      )
        .min(1, emptyErr('thresholds'))
        .optional()
    },
    {
      invalid_type_error: invalidObjectErr('service'),
      required_error: requiredErr('service')
    }
  )
    .strict(invalidStructure('service'))
    .transform((val, ctx) => {
      if (Object.keys(val).length === 0) {
        ctx.addIssue({
          code: Zod.ZodIssueCode.custom,
          message: 'Empty update is not allowed'
        });

        return Zod.NEVER;
      }

      return val;
    });

  const paramsRes = paramsSchema.safeParse(params);
  const bodyRes = bodySchema.safeParse(body);
  const err = checkAndParseErrors(
    paramsRes,
    bodyRes,
    validateEmptyObject('service', query)
  );
  if (err) {
    throw err;
  }

  return {
    ...(paramsRes as ValidatedType<typeof paramsSchema>).data,
    ...(bodyRes as ValidatedType<typeof bodySchema>).data
  };
};

export const deleteOne = (req: Request) => {
  const { body, params, query } = req;

  validateEmptyObject('service', { ...body, ...query });

  const paramsSchema = Zod.object(
    {
      serviceId: Zod.string({
        invalid_type_error: invalidStringErr('service id'),
        required_error: requiredErr('service id')
      }).uuid(invalidUuid('service id'))
    },
    {
      invalid_type_error: invalidObjectErr('service'),
      required_error: requiredErr('service')
    }
  ).strict(invalidStructure('service'));

  const paramsRes = paramsSchema.safeParse(params);
  const err = checkAndParseErrors(
    paramsRes,
    validateEmptyObject('chapter', { ...body, ...query })
  );
  if (err) {
    throw err;
  }

  return (paramsRes as ValidatedType<typeof paramsSchema>).data.serviceId;
};
