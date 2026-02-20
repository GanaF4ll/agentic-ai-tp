from django.contrib import admin
from .models import DiscoveryLog

@admin.register(DiscoveryLog)
class DiscoveryLogAdmin(admin.ModelAdmin):
    list_display = ('file_path', 'record_count', 'status', 'processed_at', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('file_path', 'error_message')
