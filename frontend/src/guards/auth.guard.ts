import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  // FIX: Explicitly type `router` as `Router` to fix type inference issue with `inject`.
  const router: Router = inject(Router);

  if (authService.isLoggedIn()) {
    const userRole = authService.getUserRole();
    const expectedRole = route.data['role'];
    if (userRole === expectedRole) {
        return true;
    }
    // if role mismatch, log out and redirect
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  return router.createUrlTree(['/login']);
};
