import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  return inject(AuthService).isLoggedIn()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
