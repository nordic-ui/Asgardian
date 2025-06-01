/**
 * Error thrown when access is forbidden based on ability rules
 */
export class ForbiddenError extends Error {
  /**
   * Creates a new ForbiddenError
   * @param message The reason why access was denied
   */
  constructor(message: string = 'Access denied') {
    super(message)
    this.name = 'ForbiddenError'

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ForbiddenError)
    }
  }
}
