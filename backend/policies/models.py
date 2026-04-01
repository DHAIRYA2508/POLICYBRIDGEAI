"""
Policy models for PolicyBridge AI
"""
import os
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator
from django.utils import timezone

User = get_user_model()


def policy_file_path(instance, filename):
    """
    Generate file path for policy documents
    """
    ext = filename.split('.')[-1]
    filename = f"policies/{instance.user.id}/{instance.id}.{ext}"
    return filename


class Policy(models.Model):
    """
    Policy document model
    """
    POLICY_TYPES = [
        ('health', 'Health Insurance'),
        ('auto', 'Auto Insurance'),
        ('home', 'Home Insurance'),
        ('life', 'Life Insurance'),
        ('business', 'Business Insurance'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='policies')
    name = models.CharField(max_length=255, verbose_name='Policy Name')
    provider = models.CharField(max_length=255, verbose_name='Insurance Provider')
    policy_type = models.CharField(max_length=20, choices=POLICY_TYPES, verbose_name='Policy Type')
    policy_number = models.CharField(max_length=100, blank=True, verbose_name='Policy Number')
    coverage_amount = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        verbose_name='Coverage Amount'
    )
    premium_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        verbose_name='Premium Amount'
    )
    start_date = models.DateField(null=True, blank=True, verbose_name='Policy Start Date')
    end_date = models.DateField(null=True, blank=True, verbose_name='Policy End Date')
    
    # File fields
    document = models.FileField(
        upload_to=policy_file_path,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'docx', 'txt'])],
        verbose_name='Policy Document'
    )
    file_size = models.PositiveIntegerField(verbose_name='File Size (bytes)')
    file_type = models.CharField(max_length=10, verbose_name='File Type')
    
    # Metadata
    description = models.TextField(blank=True, verbose_name='Description')
    tags = models.JSONField(default=list, blank=True, verbose_name='Tags')
    is_active = models.BooleanField(default=True, verbose_name='Active')
    conversation_count = models.PositiveIntegerField(default=0, verbose_name='Conversation Count')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created At')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Updated At')
    
    class Meta:
        verbose_name = 'Policy'
        verbose_name_plural = 'Policies'
        db_table = 'policies'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'policy_type']),
            models.Index(fields=['provider']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.provider}"
    
    def save(self, *args, **kwargs):
        """Override save to set file metadata"""
        if self.document:
            # Always update file metadata when document changes
            try:
                self.file_size = self.document.size
                self.file_type = self.document.name.split('.')[-1].lower()
            except Exception as e:
                # Fallback if file size can't be determined
                self.file_size = 1024  # Default to 1KB
                self.file_type = self.document.name.split('.')[-1].lower() if '.' in self.document.name else 'pdf'
        super().save(*args, **kwargs)
    
    def get_file_name(self):
        """Get the original filename"""
        if self.document:
            return os.path.basename(self.document.name)
        return "No file"
    
    def increment_conversation_count(self):
        """Increment the conversation count for this policy"""
        self.conversation_count += 1
        self.save(update_fields=['conversation_count'])
    
    def get_conversation_count(self):
        """Get the current conversation count"""
        return self.conversation_count
    
    def recalculate_conversation_count(self):
        """Recalculate conversation count from actual conversations"""
        try:
            from ai.models import Conversation
            count = Conversation.objects.filter(
                user=self.user,
                policy=self,
                is_active=True
            ).count()
            self.conversation_count = count
            self.save(update_fields=['conversation_count'])
            return count
        except Exception as e:
            # If there's an error, return current count
            return self.conversation_count
    
    @classmethod
    def get_total_conversation_count_for_user(cls, user):
        """Get total conversation count for all policies of a user"""
        try:
            return cls.objects.filter(user=user).aggregate(
                total=models.Sum('conversation_count')
            )['total'] or 0
        except Exception as e:
            return 0
    
    def get_file_extension(self):
        """Get the file extension"""
        return self.file_type.upper()
    
    def get_formatted_file_size(self):
        """Get formatted file size"""
        if self.file_size < 1024:
            return f"{self.file_size} B"
        elif self.file_size < 1024 * 1024:
            return f"{self.file_size / 1024:.1f} KB"
        else:
            return f"{self.file_size / (1024 * 1024):.1f} MB"


class PolicyExtraction(models.Model):
    """
    Extracted text and metadata from policy documents
    """
    policy = models.OneToOneField(Policy, on_delete=models.CASCADE, related_name='extraction')
    extracted_text = models.TextField(verbose_name='Extracted Text')
    text_length = models.PositiveIntegerField(verbose_name='Text Length')
    extraction_date = models.DateTimeField(auto_now_add=True, verbose_name='Extraction Date')
    extraction_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending',
        verbose_name='Extraction Status'
    )
    error_message = models.TextField(blank=True, verbose_name='Error Message')
    
    class Meta:
        verbose_name = 'Policy Extraction'
        verbose_name_plural = 'Policy Extractions'
        db_table = 'policy_extractions'
    
    def __str__(self):
        return f"Extraction for {self.policy.name}"
    
    def save(self, *args, **kwargs):
        """Override save to set text length"""
        if self.extracted_text:
            self.text_length = len(self.extracted_text)
        super().save(*args, **kwargs)
