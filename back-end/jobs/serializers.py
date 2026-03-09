from rest_framework import serializers
from .models import Job, JobApplication

class JobSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.ReadOnlyField(source='posted_by.get_full_name')
    type = serializers.CharField(source='job_type')
    posted_at = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'type', 'location', 
            'description', 'posted_by', 'posted_by_name', 
            'posted_at', 'updated_at'
        ]
        read_only_fields = ['posted_by', 'posted_at', 'updated_at']

class JobApplicationSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.get_full_name')
    job_title = serializers.ReadOnlyField(source='job.title')

    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'job_title', 'user', 'user_name', 'applied_at', 'cover_letter']
        read_only_fields = ['user', 'applied_at']

