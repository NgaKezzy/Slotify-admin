/**
 * PLACEHOLDER — replaced entirely by `pnpm gen:api` (openapi-typescript).
 * Declares only the endpoints referenced by the Phase 0 skeleton so the project
 * type-checks before the backend OpenAPI document is available.
 */

export interface paths {
  "/api/v1/auth/login": {
    post: {
      requestBody: {
        content: {
          "application/json": components["schemas"]["LoginRequest"];
        };
      };
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["ApiResponseAuthResponse"];
          };
        };
      };
    };
  };
  "/api/v1/admin/salons/{salonId}/bookings": {
    get: {
      parameters: {
        path: { salonId: number };
        query?: { page?: number; size?: number; status?: string };
      };
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["ApiResponsePageBooking"];
          };
        };
      };
    };
  };
}

export interface components {
  schemas: {
    LoginRequest: { email: string; password: string };
    UserSummary: {
      id: number;
      email: string;
      fullName: string;
      avatarUrl?: string;
      role: "SUPER_ADMIN" | "SALON_OWNER" | "STAFF" | "CUSTOMER";
    };
    AuthResponse: {
      accessToken: string;
      refreshToken: string;
      user: components["schemas"]["UserSummary"];
    };
    ApiResponseAuthResponse: { data: components["schemas"]["AuthResponse"] };
    Booking: {
      id: number;
      status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED" | "NO_SHOW";
      startAt: string;
      endAt: string;
      customerName: string;
      staffName: string;
      serviceName: string;
    };
    PageBooking: {
      content: components["schemas"]["Booking"][];
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
    };
    ApiResponsePageBooking: { data: components["schemas"]["PageBooking"] };
  };
}
