"""
URL patterns for AI app
"""
from django.urls import path
from . import views

app_name = 'ai'

urlpatterns = [
    # Policy extraction
    path('extract-policy-details/<int:policy_id>/', views.extract_policy_details, name='extract_policy_details'),
    
    # Policy comparison
    path('compare/', views.policy_comparison_view, name='policy_comparison'),
    
    # Policy extraction retrieval
    path('policy-extraction/<int:policy_id>/', views.get_policy_extraction, name='get_policy_extraction'),
    
    # Policy query for chat
    path('query-policy/', views.query_policy, name='query_policy'),
    # General chat endpoint
    path('general-chat/', views.general_chat, name='general_chat'),
    
    # Conversation management
    path('conversations/', views.get_conversations, name='get_conversations'),
    path('conversations/<int:conversation_id>/messages/', views.get_conversation_messages, name='get_conversation_messages'),
    path('conversations/<int:conversation_id>/', views.delete_conversation, name='delete_conversation'),
]
