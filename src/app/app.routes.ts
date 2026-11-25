import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'list-pokemon',
    loadComponent: () =>
      import('./pages/list-pokemon/list-pokemon.page').then(
        (m) => m.ListPokemonPage
      ),
  },
  {
    path: 'detail-pokemon/:id',
    loadComponent: () =>
      import('./pages/detail-pokemon/detail-pokemon.page').then(
        (m) => m.DetailPokemonPage
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/auth/registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: '**',
    redirectTo: 'list-pokemon',
    pathMatch: 'full',
  },
  
];
