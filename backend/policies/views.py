"""
Policy views for PolicyBridge AI
"""
import logging
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum
from .models import Policy, PolicyExtraction
from .serializers import (
    PolicySerializer,
    PolicyCreateSerializer,
    PolicyUpdateSerializer,
    PolicyListSerializer,
    PolicySearchSerializer
)

logger = logging.getLogger(__name__)


class PolicyListView(generics.ListCreateAPIView):
    """
    List and create policies for the authenticated user
    """
    serializer_class = PolicyListSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['policy_type', 'provider', 'is_active']
    search_fields = ['name', 'provider', 'description', 'policy_number']
    ordering_fields = ['created_at', 'name', 'coverage_amount', 'premium_amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return policies for the current user"""
        return Policy.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializer for create vs list"""
        if self.request.method == 'POST':
            return PolicyCreateSerializer
        return PolicyListSerializer
    
    def perform_create(self, serializer):
        """Set the user when creating a policy"""
        serializer.save(user=self.request.user)
        logger.info(f"Policy created: {serializer.instance.name} by user {self.request.user.email}")


class PolicyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, and delete a specific policy
    """
    serializer_class = PolicySerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_queryset(self):
        """Return policies for the current user"""
        return Policy.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializer for update vs retrieve"""
        if self.request.method in ['PUT', 'PATCH']:
            return PolicyUpdateSerializer
        return PolicySerializer
    
    def perform_update(self, serializer):
        """Log policy updates"""
        serializer.save()
        logger.info(f"Policy updated: {serializer.instance.name} by user {self.request.user.email}")
    
    def perform_destroy(self, instance):
        """Log policy deletions"""
        policy_name = instance.name
        instance.delete()
        logger.info(f"Policy deleted: {policy_name} by user {self.request.user.email}")


class PolicySearchView(generics.ListAPIView):
    """
    Advanced search for policies
    """
    serializer_class = PolicyListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return filtered policies based on search parameters"""
        queryset = Policy.objects.filter(user=self.request.user)
        
        # Get search parameters
        query = self.request.query_params.get('query', '')
        policy_type = self.request.query_params.get('policy_type', '')
        provider = self.request.query_params.get('provider', '')
        start_date = self.request.query_params.get('start_date', '')
        end_date = self.request.query_params.get('end_date', '')
        min_coverage = self.request.query_params.get('min_coverage', '')
        max_coverage = self.request.query_params.get('max_coverage', '')
        tags = self.request.query_params.getlist('tags', [])
        
        # Apply filters
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(provider__icontains=query) |
                Q(description__icontains=query) |
                Q(policy_number__icontains=query)
            )
        
        if policy_type:
            queryset = queryset.filter(policy_type=policy_type)
        
        if provider:
            queryset = queryset.filter(provider__icontains=provider)
        
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        
        if min_coverage:
            queryset = queryset.filter(coverage_amount__gte=min_coverage)
        
        if max_coverage:
            queryset = queryset.filter(coverage_amount__lte=max_coverage)
        
        if tags:
            queryset = queryset.filter(tags__contains=tags)
        
        return queryset.distinct()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def policy_stats_view(request):
    """
    Get policy statistics for the current user
    """
    user = request.user
    policies = Policy.objects.filter(user=user)
    
    stats = {
        'total_policies': policies.count(),
        'active_policies': policies.filter(is_active=True).count(),
        'policy_types': {},
        'total_coverage': 0,
        'total_premium': 0,
        'total_conversations': 0,
        'recent_uploads': policies.order_by('-created_at')[:5].count()
    }
    
    # Calculate policy type distribution
    for policy_type, _ in Policy.POLICY_TYPES:
        count = policies.filter(policy_type=policy_type).count()
        if count > 0:
            stats['policy_types'][policy_type] = count
    
    # Calculate total coverage and premium
    active_policies = policies.filter(is_active=True)
    total_coverage = active_policies.aggregate(
        total=Sum('coverage_amount')
    )['total'] or 0
    total_premium = active_policies.aggregate(
        total=Sum('premium_amount')
    )['total'] or 0
    
    # Calculate total conversations
    total_conversations = policies.aggregate(
        total=Sum('conversation_count')
    )['total'] or 0
    
    stats['total_coverage'] = float(total_coverage)
    stats['total_premium'] = float(total_premium)
    stats['total_conversations'] = int(total_conversations)
    
    return Response(stats, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_delete_policies(request):
    """
    Bulk delete multiple policies
    """
    policy_ids = request.data.get('policy_ids', [])
    
    if not policy_ids:
        return Response(
            {'error': 'No policy IDs provided'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    policies = Policy.objects.filter(
        id__in=policy_ids, 
        user=request.user
    )
    
    if not policies.exists():
        return Response(
            {'error': 'No valid policies found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    deleted_count = policies.count()
    policies.delete()
    
    logger.info(f"Bulk deleted {deleted_count} policies by user {request.user.email}")
    
    return Response({
        'message': f'Successfully deleted {deleted_count} policies',
        'deleted_count': deleted_count
    }, status=status.HTTP_200_OK)
