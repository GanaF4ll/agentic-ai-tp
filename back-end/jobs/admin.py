from django.contrib import admin
from .models import Job, JobApplication

class JobApplicationInline(admin.TabularInline):
    model = JobApplication
    extra = 1

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'job_type', 'posted_by', 'created_at')
    list_filter = ('job_type', 'created_at')
    search_fields = ('title', 'company', 'description')
    inlines = [JobApplicationInline]

admin.site.register(JobApplication)
