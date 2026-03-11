import { Component, inject, signal, output, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { LucideAngularModule, X, Send, Calendar, MapPin, Info } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { AlumniEvent } from '../../../core/models/business.model';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, CommonModule],
  template: `
    <div class="fixed inset-0 bg-base-300/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="card bg-base-100 w-full max-w-2xl shadow-2xl border border-base-200 rounded-t-[2rem] sm:rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-1/2 sm:zoom-in duration-300">
        <div class="card-body p-6 md:p-8">
          <div class="flex items-center justify-between mb-6 md:mb-8">
            <h2 class="text-2xl md:text-3xl font-black tracking-tighter text-primary">
              {{ event() ? 'Modifier l\\'événement' : 'Proposer un événement' }}
            </h2>
            <button (click)="close.emit()" class="btn btn-ghost btn-circle btn-sm">
              <lucide-angular [img]="xIcon" class="size-6"></lucide-angular>
            </button>
          </div>
          
          <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4 md:gap-5">
            <fieldset class="fieldset">
              <legend class="fieldset-legend font-bold text-sm">Titre de l'événement</legend>
              <input 
                type="text" 
                formControlName="title" 
                class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-12 font-bold" 
                placeholder="Ex: Soirée Networking Alumni 2026" 
              />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend font-bold text-sm">Description</legend>
              <textarea 
                formControlName="description" 
                class="textarea textarea-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-32 py-4" 
                placeholder="Décrivez l'événement, les objectifs, les intervenants..."
              ></textarea>
            </fieldset>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <fieldset class="fieldset">
                <legend class="fieldset-legend font-bold text-sm">Date et Heure</legend>
                <div class="relative">
                   <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
                      <lucide-angular [img]="calendarIcon" class="size-4"></lucide-angular>
                   </div>
                   <input 
                    type="datetime-local" 
                    formControlName="date" 
                    class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-12 pl-10" 
                  />
                </div>
              </fieldset>
              
              <fieldset class="fieldset">
                <legend class="fieldset-legend font-bold text-sm">Organisateur</legend>
                <input 
                  type="text" 
                  formControlName="organizer" 
                  class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-12" 
                  placeholder="Ex: BDE, School Tech Hub..." 
                />
              </fieldset>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <fieldset class="fieldset">
                <legend class="fieldset-legend font-bold text-sm">Lieu / Lien</legend>
                <div class="relative">
                   <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
                      <lucide-angular [img]="locationIcon" class="size-4"></lucide-angular>
                   </div>
                   <input 
                    type="text" 
                    formControlName="location" 
                    class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-12 pl-10" 
                    placeholder="Ex: Campus Paris, Zoom, Paris..." 
                  />
                </div>
              </fieldset>

              <fieldset class="fieldset justify-center pt-6">
                <label class="label cursor-pointer justify-start gap-4">
                  <span class="label-text font-bold">Événement en ligne</span> 
                  <input type="checkbox" formControlName="is_online" class="checkbox checkbox-primary" />
                </label>
              </fieldset>
            </div>

            @if (errorMessage()) {
              <div role="alert" class="alert alert-error text-sm py-3 font-bold rounded-xl">
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <div class="card-actions mt-4 flex flex-col-reverse sm:flex-row gap-3">
              <button 
                type="button"
                (click)="close.emit()"
                class="btn btn-ghost flex-1 h-12 min-h-12 font-black rounded-2xl"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="btn btn-primary flex-[2] h-12 min-h-12 font-black shadow-lg shadow-primary/20 rounded-2xl text-base" 
                [disabled]="eventForm.invalid || isLoading()"
              >
                @if (isLoading()) {
                  <span class="loading loading-spinner loading-sm"></span>
                }
                {{ event() ? 'Enregistrer' : 'Créer l\\'événement' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class EventCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  
  event = input<AlumniEvent | null>(null);
  close = output<void>();
  created = output<void>();
  
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  readonly xIcon = X;
  readonly calendarIcon = Calendar;
  readonly locationIcon = MapPin;
  readonly infoIcon = Info;

  eventForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required]],
    date: ['', [Validators.required]],
    location: ['', [Validators.required]],
    organizer: ['', [Validators.required]],
    is_online: [false]
  });

  ngOnInit() {
    const existingEvent = this.event();
    if (existingEvent) {
      // Format date for datetime-local input (YYYY-MM-DDThh:mm)
      const date = new Date(existingEvent.date);
      const formattedDate = date.toISOString().slice(0, 16);
      
      this.eventForm.patchValue({
        title: existingEvent.title,
        description: existingEvent.description,
        date: formattedDate,
        location: existingEvent.location,
        organizer: existingEvent.organizer,
        is_online: existingEvent.is_online
      });
    }
  }

  onSubmit() {
    if (this.eventForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      const eventData = this.eventForm.value as any;
      const existingEvent = this.event();

      const request = existingEvent 
        ? this.eventService.updateEvent(existingEvent.id, eventData)
        : this.eventService.createEvent(eventData);
      
      request.subscribe({
        next: () => {
          this.isLoading.set(false);
          this.created.emit();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.detail || "Une erreur est survenue.");
        }
      });
    }
  }
}
