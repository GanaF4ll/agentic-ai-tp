import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { LUCIDE_ICONS, LucideIconProvider, User, LogOut, Search, Filter, CheckCircle, Clock, ExternalLink, Calendar, Menu, GraduationCap, MapPin, ArrowLeft, Mail, Linkedin, Briefcase } from 'lucide-angular';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/auth/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideRouter(routes),
    { 
      provide: LUCIDE_ICONS, 
      multi: true, 
      useValue: new LucideIconProvider({ User, LogOut, Search, Filter, CheckCircle, Clock, ExternalLink, Calendar, Menu, GraduationCap, MapPin, ArrowLeft, Mail, Linkedin, Briefcase }) 
    }
  ]
};
