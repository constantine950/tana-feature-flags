import axios, { AxiosInstance, AxiosError } from "axios";
import { TanaClientOptions } from "./types";

export class HttpClient {
  private client: AxiosInstance;
  private retries: number;

  constructor(options: TanaClientOptions) {
    this.client = axios.create({
      baseURL: options.apiUrl || "http://localhost:3000",
      timeout: options.timeout || 5000,
      headers: {
        "X-API-Key": options.apiKey,
        "Content-Type": "application/json",
      },
    });

    this.retries = options.retries || 2;
  }

  async post<T>(url: string, data: any, retryCount = 0): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data);
      return response.data;
    } catch (error) {
      // Retry on network errors or 5xx
      if (this.shouldRetry(error as AxiosError) && retryCount < this.retries) {
        await this.delay(this.getRetryDelay(retryCount));
        return this.post<T>(url, data, retryCount + 1);
      }

      throw this.handleError(error as AxiosError);
    }
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.response) {
      // Network error
      return true;
    }

    // Retry on 5xx errors
    return error.response.status >= 500;
  }

  private getRetryDelay(retryCount: number): number {
    // Exponential backoff: 100ms, 200ms, 400ms
    return Math.min(100 * Math.pow(2, retryCount), 1000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      const data = error.response.data as any;
      return new Error(data?.error?.message || `HTTP ${error.response.status}`);
    }

    if (error.request) {
      return new Error("Network error: No response received");
    }

    return new Error(error.message);
  }
}
