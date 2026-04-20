export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse<TIssues = unknown> {
  success: false;
  error: string;
  message: string;
  issues?: TIssues;
}

export type ApiResponse<T, TIssues = unknown> = ApiSuccessResponse<T> | ApiErrorResponse<TIssues>;