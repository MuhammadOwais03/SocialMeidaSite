from django.contrib import admin
from django.urls import path

from rest_framework import routers
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = routers.SimpleRouter()
router.register(r"user-info", UserModelViewSet)
router.register(r"post", PostViewSet, basename="post")
router.register(r"comment", CommentViewSet, basename="comment")
router.register(r"like", LikeViewSet, basename="like")
router.register(r"search", SearchUserProfile, basename="search")
router.register(r"notification", NotificationViewSet, basename="notification")
# router.register(r'protected', MyProtectedView, basename='protected')


urlpatterns = [
    path("", api_root, name="api-root"),
    path("user-registration/", user_registration, name="user-registration"),
    path("login/", signin, name="login"),
    path("protected/", MyProtectedView.as_view(), name="protected"),
    path("friend/", FriendViewSet.as_view(), name="friend"),
    path("friend/<int:pk>", FriendViewSet.as_view(), name="friend"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path(
        "authenticated-user-info/",
        AuthenticatedUserViewSet.as_view(),
        name="get-user-info",
    ),
    path("unlike-post/", unlike_post, name="unlike-post"),
]

urlpatterns += router.urls
