import { HttpHeaders } from '@angular/common/http';

/**
 * Helper function to get standard HTTP headers for API requests
 */
export function getHttpHeaders(): HttpHeaders {
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });
}

/**
 * Standard HTTP options for GET requests
 */
export const HTTP_GET_OPTIONS = {
  headers: getHttpHeaders(),
  withCredentials: false
};

/**
 * Standard HTTP options for POST/PUT/DELETE requests
 */
export const HTTP_POST_OPTIONS = {
  headers: getHttpHeaders(),
  withCredentials: false
};
