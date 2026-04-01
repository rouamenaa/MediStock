import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './core/layout/layout.component';
import { RegisterComponent } from './components/register/register.component';

const routes: Routes = [

  // ✅ LOGIN (NO LAYOUT)  
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // 🔐 PROTECTED + WITH LAYOUT
  {
    path: '',
    component: LayoutComponent,   // 👈 MOVE LAYOUT HERE
    canActivate: [AuthGuard],
    children: [
      {
        path: 'pharmacystock',
        loadChildren: () => import('./features/pharmacystock/pharmacystock.module')
          .then(m => m.PharmacystockModule)
      }
    ]
  },

  // DEFAULT
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }