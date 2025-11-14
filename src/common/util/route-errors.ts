import { IParseObjectError } from 'jet-validators/utils';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';


/******************************************************************************
                                 Classes
******************************************************************************/

/**
 * Error with status code and message.
 */
export class RouteError extends Error {
  public status: HttpStatusCodes;

  public constructor(status: HttpStatusCodes, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Handle "parseObj" errors.
 */
export class ValidationError extends RouteError {

  public static MESSAGE = 'The parseObj() function discovered one or ' + 
    'more errors.';

  public constructor(errors: IParseObjectError[]) {
    const msg = JSON.stringify({
      message: ValidationError.MESSAGE,
      errors,
    });
    super(HttpStatusCodes.BAD_REQUEST, msg);
  }
}

/**
 * Email already exists error (PostgreSQL unique constraint violation).
 */
export class EmailAlreadyExistsError extends RouteError {
  public static MESSAGE = 'EMAIL_ALREADY_EXISTS';

  public constructor() {
    super(HttpStatusCodes.CONFLICT, EmailAlreadyExistsError.MESSAGE);
  }
}