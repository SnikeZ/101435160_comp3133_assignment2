import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup').then((m) => m.SignupComponent),
  },
  {
    path: 'employees',
    loadComponent: () => import('./pages/employees/employees').then((m) => m.EmployeesComponent),
    canActivate: [authGuard],
  },
];
