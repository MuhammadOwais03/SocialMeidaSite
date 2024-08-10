from django.contrib import admin
from django.urls import path

from rest_framework import routers
from .views import *

router = routers.SimpleRouter()
router.register(r'post', PostViewSet)
router.register(r'comment', CommentViewSet, basename='comment')
router.register(r'like', LikeViewSet, basename='like')
# router.register(r'user-registration', UserRegistrationViewSet, basename='user-registration')
# router.register(r'login', loginViewSet, basename='login')
# router.register(r'protected', MyProtectedView, basename='protected')



urlpatterns = [
    path('', api_root, name='api-root'),
    path('user-registration/', user_registration, name='user-registration'),
    path('login/', signin, name='login'),
    path('protected/', MyProtectedView.as_view(), name='protected')
    
]

urlpatterns += router.urls