export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}
export const notFound = (m = "Topilmadi") => new HttpError(404, m);
export const forbidden = (m = "Ruxsat yo‘q") => new HttpError(403, m);
export const badRequest = (m: string) => new HttpError(400, m);
