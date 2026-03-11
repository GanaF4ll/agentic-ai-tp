from django.contrib import admin
from .models import DiscoveryLog, LinkedInScrapingTask


@admin.register(DiscoveryLog)
class DiscoveryLogAdmin(admin.ModelAdmin):
    list_display = ('file_path', 'record_count', 'status', 'processed_at', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('file_path', 'error_message')


@admin.register(LinkedInScrapingTask)
class LinkedInScrapingTaskAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'scraped_at', 'created_at', 'updated_at')
    list_filter = ('status',)
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'error_message')
    readonly_fields = ('raw_data', 'scraped_at', 'created_at', 'updated_at')
    raw_id_fields = ('user',)
