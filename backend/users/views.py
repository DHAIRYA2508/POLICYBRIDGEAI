"""
User views for PolicyBridge AI
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserListSerializer
)
from rest_framework.permissions import IsAuthenticated

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """
    User registration endpoint
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        """Create a new user and return success response with JWT tokens"""
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            # Extract the first error message for better user experience
            errors = serializer.errors
            if 'email' in errors:
                error_message = errors['email'][0]
            elif 'username' in errors:
                error_message = errors['username'][0]
            elif 'password_confirm' in errors:
                error_message = errors['password_confirm'][0]
            elif 'password' in errors:
                error_message = errors['password'][0]
            else:
                error_message = 'Registration failed. Please check your information and try again.'
            
            return Response({
                'detail': error_message,
                'errors': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.save()
        
        # Generate JWT tokens for automatic login
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'User registered successfully',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class UserLoginView(generics.GenericAPIView):
    """
    User login endpoint
    """
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Authenticate user and return JWT tokens"""
        print(f"🔍 UserLoginView: Received login request")
        print(f"🔍 UserLoginView: Request data: {request.data}")
        print(f"🔍 UserLoginView: Request content type: {request.content_type}")
        
        serializer = self.get_serializer(data=request.data)
        print(f"🔍 UserLoginView: Serializer created")
        
        if not serializer.is_valid():
            print(f"🔍 UserLoginView: Serializer validation failed")
            print(f"🔍 UserLoginView: Serializer errors: {serializer.errors}")
            
            # Extract the first error message for better user experience
            errors = serializer.errors
            if 'non_field_errors' in errors:
                error_message = errors['non_field_errors'][0]
            elif 'email' in errors:
                error_message = errors['email'][0]
            elif 'password' in errors:
                error_message = errors['password'][0]
            else:
                error_message = 'Wrong email or password. Please check your credentials and try again.'
            
            return Response({
                'detail': error_message,
                'errors': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"🔍 UserLoginView: Serializer validation successful")
        user = serializer.validated_data['user']
        print(f"🔍 UserLoginView: User authenticated: {user.email}")
        
        refresh = RefreshToken.for_user(user)
        print(f"🔍 UserLoginView: JWT tokens generated")
        
        return Response({
            'message': 'Login successful',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    User profile management endpoint
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Return the current user"""
        return self.request.user


class UserListView(generics.ListAPIView):
    """
    List all users (admin only)
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAdminUser]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    Logout endpoint - simple logout without token blacklisting
    """
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats_view(request):
    """
    Get user statistics
    """
    user = request.user
    
    # Calculate total conversation count from all policies
    total_conversations = 0
    try:
        from policies.models import Policy
        total_conversations = Policy.get_total_conversation_count_for_user(user)
    except Exception as e:
        # If there's an error, default to 0
        total_conversations = 0
    
    return Response({
        'total_policies': user.policy_set.count() if hasattr(user, 'policy_set') else 0,
        'total_conversations': total_conversations,
        'member_since': user.date_joined,
        'last_login': user.last_login
    }, status=status.HTTP_200_OK)
