from django.contrib import admin
from .models import Event, EventParticipant

class EventParticipantInline(admin.TabularInline):
    model = EventParticipant
    extra = 1

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'location', 'created_by')
    list_filter = ('date', 'created_at')
    search_fields = ('title', 'description', 'location')
    inlines = [EventParticipantInline]

admin.site.register(EventParticipant)
