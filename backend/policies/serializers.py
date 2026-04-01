"""
Policy serializers for PolicyBridge AI
"""
from rest_framework import serializers
from .models import Policy, PolicyExtraction


class PolicyExtractionSerializer(serializers.ModelSerializer):
    """
    Serializer for policy extraction data
    """
    class Meta:
        model = PolicyExtraction
        fields = ['extracted_text', 'text_length', 'extraction_date', 'extraction_status', 'error_message']
        read_only_fields = ['text_length', 'extraction_date']


class PolicySerializer(serializers.ModelSerializer):
    """
    Serializer for policy documents
    """
    user = serializers.ReadOnlyField(source='user.email')
    extraction = PolicyExtractionSerializer(read_only=True)
    file_name = serializers.SerializerMethodField()
    file_extension = serializers.SerializerMethodField()
    formatted_file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = Policy
        fields = [
            'id', 'user', 'name', 'provider', 'policy_type', 'policy_number',
            'coverage_amount', 'premium_amount', 'start_date', 'end_date',
            'document', 'file_size', 'file_type', 'description', 'tags',
            'is_active', 'created_at', 'updated_at', 'extraction',
            'file_name', 'file_extension', 'formatted_file_size', 'conversation_count'
        ]
        read_only_fields = ['id', 'user', 'file_size', 'file_type', 'created_at', 'updated_at']
    
    def get_file_name(self, obj):
        return obj.get_file_name()
    
    def get_file_extension(self, obj):
        return obj.get_file_extension()
    
    def get_formatted_file_size(self, obj):
        return obj.get_formatted_file_size()


class PolicyCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new policies
    """
    class Meta:
        model = Policy
        fields = [
            'name', 'provider', 'policy_type', 'policy_number',
            'coverage_amount', 'premium_amount', 'start_date', 'end_date',
            'document', 'description', 'tags'
        ]

    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request else None
        document = data.get('document')
        if user and document:
            # Check for duplicate file name for this user
            existing = Policy.objects.filter(user=user, document__icontains=document.name)
            if existing.exists():
                raise serializers.ValidationError({
                    'document': 'You have already uploaded a file with this name.'
                })
        return data
    
    def validate_document(self, value):
        """Validate document file"""
        if value.size > 10 * 1024 * 1024:  # 10MB limit
            raise serializers.ValidationError("File size must be under 10MB")
        return value


class PolicyUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating policies
    """
    class Meta:
        model = Policy
        fields = [
            'name', 'provider', 'policy_type', 'policy_number',
            'coverage_amount', 'premium_amount', 'start_date', 'end_date',
            'description', 'tags', 'is_active', 'document'
        ]


class PolicyListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing policies (minimal data)
    """
    user = serializers.ReadOnlyField(source='user.email')
    file_name = serializers.SerializerMethodField()
    formatted_file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = Policy
        fields = [
            'id', 'user', 'name', 'provider', 'policy_type', 'policy_number',
            'coverage_amount', 'premium_amount', 'start_date', 'end_date',
            'file_size', 'file_type', 'is_active', 'created_at', 'file_name', 
            'formatted_file_size', 'conversation_count'
        ]
    
    def get_file_name(self, obj):
        return obj.get_file_name()
    
    def get_formatted_file_size(self, obj):
        return obj.get_formatted_file_size()


class PolicySearchSerializer(serializers.Serializer):
    """
    Serializer for policy search
    """
    query = serializers.CharField(max_length=255, required=False)
    policy_type = serializers.ChoiceField(choices=Policy.POLICY_TYPES, required=False)
    provider = serializers.CharField(max_length=255, required=False)
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    min_coverage = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    max_coverage = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    tags = serializers.ListField(child=serializers.CharField(), required=False)
