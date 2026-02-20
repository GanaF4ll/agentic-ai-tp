from django.contrib import admin
from .models import Promotion, Profile, Education, Experience

class EducationInline(admin.TabularInline):
    model = Education
    extra = 1

class ExperienceInline(admin.TabularInline):
    model = Experience
    extra = 1

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'graduation_year', 'degree', 'status', 'promotion')
    list_filter = ('status', 'graduation_year', 'promotion')
    search_fields = ('user__username', 'user__email', 'current_job_title', 'current_company')
    inlines = [EducationInline, ExperienceInline]

@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ('label', 'created_at')
    search_fields = ('label',)

admin.site.register(Education)
admin.site.register(Experience)
