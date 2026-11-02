import { HttpErrorResponse } from '@angular/common/http';

/** Turns any HTTP failure into a short, user-friendly message. */
export function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Cannot reach the server. Is the API running?';
    const body = err.error;
    if (Array.isArray(body?.details) && body.details.length) {
      return body.details.map((d: { message: string }) => d.message).join(', ');
    }
    if (body?.message) return body.message;
  }
  return 'Something went wrong. Please try again.';
}
