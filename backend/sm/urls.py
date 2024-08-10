from django.contrib import admin
from django.urls import path

from rest_framework import routers
from .views import *

router = routers.SimpleRouter()
router.register(r'post', PostViewSet)
router.register(r'comment', CommentViewSet, basename='comment')
router.register(r'like', LikeViewSet, basename='like')



urlpatterns = [
    path('', api_root, name='api-root'),
]

urlpatterns += router.urls