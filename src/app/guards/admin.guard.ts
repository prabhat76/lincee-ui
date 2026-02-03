import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const userRole = localStorage.getItem('userRole');

  // Check both isAdmin flag and role for security
  if (token && isAdmin && userRole === 'ADMIN') {
    return true;
  }

  // Redirect to login with return URL
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
