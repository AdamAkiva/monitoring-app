import { Zod, type Request } from '../types/index.js';
import { VALIDATION } from '../utils/index.js';
import {
  emptyErr,
  invalidArrayErr,
  invalidNumberErr,
  invalidObjectErr,
  invalidStringErr,
  invalidStructure,
  invalidUuid,
  maxErr,
  minErr,
  parseErrors,
  possibleColors,
  requiredErr,
  validateEmptyObject,
  type PossibleColors
} from './utils.js';

/**********************************************************************************/

const { URL_MAX_LEN, COLOR_NAME_MAX_LEN, THRESHOLD_MAX_VAL } = VALIDATION;

/**********************************************************************************/

export const readMany = (req: Request) => {
  const { body, params, query } = req;

  validateEmptyObject('website', { ...body, ...params, ...query });

  return undefined;
};

export const createOne = (req: Request) => {
  const { body, params, query } = req;

  const res = Zod.object(
    {
      url: Zod.string({
        invalid_type_error: invalidStringErr('url'),
        required_error: requiredErr('url')
      })
        .min(1, minErr('url', 1))
        .max(URL_MAX_LEN, maxErr('url', URL_MAX_LEN)),
      monitorInterval: Zod.number({
        invalid_type_error: invalidNumberErr('monitor interval'),
        required_error: requiredErr('monitor interval')
      }),
      thresholds: Zod.array(
        Zod.object(
          {
            color: Zod.string({
              invalid_type_error: invalidStringErr('color'),
              required_error: requiredErr('color')
            })
              .min(1, minErr('color', 1))
              .max(COLOR_NAME_MAX_LEN, maxErr('color', COLOR_NAME_MAX_LEN)),
            limit: Zod.number({
              invalid_type_error: invalidNumberErr('limit'),
              required_error: requiredErr('limit')
            })
              .min(1, `Threshold limit can't be lower than 1 ms`)
              .max(
                THRESHOLD_MAX_VAL,
                `Threshold limit can't be larger than ${THRESHOLD_MAX_VAL} milliseconds`
              )
          },
          {
            invalid_type_error: invalidObjectErr('threshold'),
            required_error: requiredErr('threshold')
          }
        ).transform(({ color, ...fields }, ctx) => {
          const colorLowercase = color.toLowerCase() as PossibleColors;
          if (!possibleColors.has(colorLowercase)) {
            ctx.addIssue({
              code: Zod.ZodIssueCode.custom,
              message: `The color '${colorLowercase}' is not allowed`
            });

            return Zod.NEVER;
          }

          return {
            ...fields,
            color: colorLowercase
          };
        }),
        {
          invalid_type_error: invalidArrayErr('thresholds'),
          required_error: invalidArrayErr('thresholds')
        }
      )
    },
    {
      invalid_type_error: invalidObjectErr('website'),
      required_error: requiredErr('website')
    }
  )
    .strict(invalidStructure('website'))
    .safeParse(body);

  if (!res.success) {
    throw parseErrors(res.error);
  }

  validateEmptyObject('website', { ...params, ...query });

  return res.data;
};

export const updateOne = (req: Request) => {
  const { body, params, query } = req;

  const paramsRes = Zod.object(
    {
      websiteId: Zod.string({
        invalid_type_error: invalidStringErr('website id'),
        required_error: requiredErr('website id')
      }).uuid(invalidUuid('website id'))
    },
    {
      invalid_type_error: invalidObjectErr('website'),
      required_error: requiredErr('website')
    }
  )
    .strict(invalidStructure('website'))
    .transform(({ websiteId }) => {
      return { id: websiteId };
    })
    .safeParse(params);
  const bodyRes = Zod.object(
    {
      url: Zod.string({
        invalid_type_error: invalidStringErr('url'),
        required_error: requiredErr('url')
      })
        .min(1, minErr('url', 1))
        .max(URL_MAX_LEN, maxErr('url', URL_MAX_LEN))
        .optional(),
      monitorInterval: Zod.number({
        invalid_type_error: invalidNumberErr('monitor interval'),
        required_error: requiredErr('monitor interval')
      }).optional(),
      thresholds: Zod.array(
        Zod.object(
          {
            color: Zod.string({
              invalid_type_error: invalidStringErr('color'),
              required_error: requiredErr('color')
            })
              .min(1, minErr('color', 1))
              .max(COLOR_NAME_MAX_LEN, maxErr('color', COLOR_NAME_MAX_LEN)),
            limit: Zod.number({
              invalid_type_error: invalidNumberErr('limit'),
              required_error: requiredErr('limit')
            })
              .min(1, `Threshold limit can't be lower than 1 ms`)
              .max(
                THRESHOLD_MAX_VAL,
                `Threshold limit can't be larger than ${THRESHOLD_MAX_VAL} milliseconds`
              )
          },
          {
            invalid_type_error: invalidObjectErr('threshold'),
            required_error: requiredErr('threshold')
          }
        ).transform(({ color, ...fields }, ctx) => {
          const colorLowercase = color.toLowerCase() as PossibleColors;
          if (!possibleColors.has(colorLowercase)) {
            ctx.addIssue({
              code: Zod.ZodIssueCode.custom,
              message: `The color '${colorLowercase}' is not allowed`
            });

            return Zod.NEVER;
          }

          return {
            ...fields,
            color: colorLowercase
          };
        }),
        {
          invalid_type_error: invalidArrayErr('thresholds'),
          required_error: invalidArrayErr('thresholds')
        }
      )
        .min(1, emptyErr('threshold'))
        .optional()
    },
    {
      invalid_type_error: invalidObjectErr('website'),
      required_error: requiredErr('website')
    }
  )
    .strict(invalidStructure('website'))
    .transform((val, ctx) => {
      if (Object.keys(val).length === 0) {
        ctx.addIssue({
          code: Zod.ZodIssueCode.custom,
          message: 'Empty update is not allowed'
        });

        return Zod.NEVER;
      }

      return val;
    })
    .safeParse(body);

  if (!paramsRes.success) {
    throw parseErrors(paramsRes.error);
  }
  if (!bodyRes.success) {
    throw parseErrors(bodyRes.error);
  }
  validateEmptyObject('website', query);

  return {
    ...paramsRes.data,
    ...bodyRes.data
  };
};

export const deleteOne = (req: Request) => {
  const { body, params, query } = req;

  const res = Zod.object(
    {
      websiteId: Zod.string({
        invalid_type_error: invalidStringErr('website id'),
        required_error: requiredErr('website id')
      }).uuid(invalidUuid('website id'))
    },
    {
      invalid_type_error: invalidObjectErr('website'),
      required_error: requiredErr('website')
    }
  )
    .strict(invalidStructure('website'))
    .safeParse(params);

  if (!res.success) {
    throw parseErrors(res.error);
  }

  validateEmptyObject('website', { ...body, ...query });

  return res.data.websiteId;
};
