import { NextFunction, Request, Response } from 'express';
import { responseStatus } from '../helper/responses';
import * as joi from '@hapi/joi';
import * as _ from 'lodash';

/* schema validation */
export function validate(object: keyof Request, schema: joi.ObjectSchema): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
        const result: joi.ValidationResult = schema.validate(req[object]);
        if (!_.isEmpty(result.error)) {
            return responseStatus(res, 400, result.error!.message, null);
        } else {
            next();
        }
    };
}
