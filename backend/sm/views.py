from django.http import Http404
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate, logout
from django.contrib.contenttypes.models import ContentType

from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework import status
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.permissions import IsAuthenticated
from datetime import timedelta


from .helper import *
from .serializers import *
from .models import *


@api_view(["GET"])
def api_root(request):
    return Response(
        {
            "posts": "/post/",
            "tokens": "/token/",
            "user-registrations": "user-registration/",
            # Add more links if you have other endpoints
        }
    )


@api_view(["POST"])
def user_registration(request):
    if request.user.is_authenticated:
        return Response(
            {"error": "User already authenticated"}, status=status.HTTP_400_BAD_REQUEST
        )
    print(request.data)
    username = request.data.get("username")
    email = request.data.get("email")
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")
    password = request.data.get("password")
    password2 = request.data.get("password2")

    if password != password2:
        return Response(
            {"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        password=password,
    )

    user_profile = UserProfile(
        user=user, full_name=f"{first_name} {last_name}", username=username
    )
    user_profile.save()
    serializer = UserSerializer(user)

    return Response(serializer.data, status=status.HTTP_201_CREATED)


# class UserRegistrationViewSet(viewsets.ViewSet):
#     def create(self, request, *args, **kwargs):
#         print(request.data, type(request.data))
#         serializer = UserProfileSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#             return Response(
#                 {
#                     "username": user.username,
#                     "email": user.email,
#                     "first_name": user.first_name,
#                     "last_name": user.last_name,
#                 },
#                 status=status.HTTP_201_CREATED,
#             )
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class loginViewSet(viewsets.ViewSet):

#     def create(self, request, *args, **kwargs):
#         serializer = loginSerializer(data=request.data)
#         if serializer.is_valid():
#             tokens = serializer.validated_data

#             response = Response({
#             'refresh': tokens['refresh'],
#             'access': tokens['access'],
#             })

#             # Set the access token in an HttpOnly cookie
#             response.set_cookie(
#                 key='access_token',
#                 value=tokens['access'],
#                 httponly=True,
#                 secure=True,  # Set this to True if your site is using HTTPS
#                 samesite='Lax',  # Adjust based on your requirements
#                 max_age=timedelta(days=1),  # Token expiration
#             )
#             return response
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def signin(request, *args, **kwargs):
    # Handle POST request only
    if request.method == "POST":
        serializer = LoginSerializer(data=request.data)

        # Validate the serializer
        if serializer.is_valid():
            # Get validated data
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)

            # Return tokens
            return Response(
                {"refresh": str(refresh), "access": str(refresh.access_token)},
                status=status.HTTP_200_OK,
            )

        # If validation fails, return errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Return error if method is not POST
    return Response(
        {"status": "Invalid method"}, status=status.HTTP_405_METHOD_NOT_ALLOWED
    )


# class FriendViewSet(viewsets.ModelViewSet):
#     queryset = Friend.objects.all()
#     serializer_class = FriendSerializer

#     # def update(self, request):
#     #     serializers = FriendSerializer(data=request.data)
#     #     if serializers.is_valid():
#     #         friend_list = FriendAccepted.objects.create(friend=serializers)


class UserModelViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]


class AuthenticatedUserViewSet(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request, *args, **kwargs):
        user = request.user

        user_profile = UserProfile.objects.get(user=user)
        user_profile_serializer = UserProfileSerializer(user_profile)
        user_serializer = UserSerializer(user)

        # print(user_profile_serializer.data)
        return Response(user_profile_serializer.data)


class FriendViewSet(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self):

        obj_id = self.kwargs.get("pk")  # or any other identifier
        try:
            return Friend.objects.get(pk=obj_id)
        except Friend.DoesNotExist:
            raise Http404

    def get(self, request, *args, **kwargs):
        friend_objs = Friend.objects.all()
        serializer = FriendSerializer(friend_objs, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        print(request.data)
        serializer = FriendSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            request.data["serializer_data"] = serializer.data
            like_notification_to_all_friend(request.data, "friend_request")
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, *args, **kwargs):

        instance = self.get_object()
        print(
            FriendAccepted.objects.filter(
                user=instance.user, of_friend=instance.friend
            ).exists()
        )
        if not FriendAccepted.objects.filter(
            user=instance.user, of_friend=instance.friend
        ).exists():
            serializer = FriendSerializer(instance, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                if serializer.validated_data.get("is_accepted"):
                    FriendAccepted.objects.create(
                        user=instance.user, of_friend=instance.friend
                    )
                    FriendAccepted.objects.create(
                        user=instance.friend, of_friend=instance.user
                    )
                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"status": "Friend Exists"})

    def delete(self, request):
        print(request)
        user_id = request.query_params.get("auth_user", "")
        friend_id = request.query_params.get("to_user", "")
        friend = Friend.objects.filter(user=user_id, friend=friend_id)
        if friend.exists():
            notification = Notification.objects.filter(
                    content_type=ContentType.objects.get_for_model(friend[0]),
                    type_of="friend_request",
                    )
            if notification.exists():
                notification[0].delete()
            receiver_user = User.objects.get(id=friend_id)
            notification_count = Notification.objects.filter(to_user=receiver_user).count()
            like_notification_to_all_friend({"notification_count":notification_count, 'receiver':friend_id}, "reject_cancel")
            friend[0].delete()
            return Response({"status", "successfully delete"})
        return Response({"status", "unsuccessfull to delete"})


class PostViewSet(viewsets.ModelViewSet):

    # queryset = Post.objects.all()
    serializer_class = PostSerializer
    http_method_names = ["get", "post", "put", "patch", "delete"]
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Get friends of the authenticated user
        friends = FriendAccepted.objects.filter(user=user).values_list(
            "of_friend", flat=True
        )

        # Retrieve posts authored by friends or the authenticated user
        queryset = Post.objects.filter(Q(author__in=friends) | Q(author=user))

        # Sort posts by created_at in descending order (most recent first)
        return queryset

    def create(self, request, *args, **kwargs):

        # print(request.data.get('id'), type(request.data.get('id')), request.data)
        response = super().create(request, *args, **kwargs)

        notification_to_all_friends(response, "post_posted")

        return response

    # List api/post/
    # Reterive   api/post/<id>
    # Put   api/post/<id>
    # Patch   api/post/<id>
    # Delete   api/post/<id>


class CommentViewSet(viewsets.ModelViewSet):

    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request):

        post_id = request.query_params.get("post", None)
        if post_id is not None:
            comments = Comment.objects.filter(post_id=post_id)
        else:
            comments = Comment.objects.all()

        serializer = self.get_serializer(comments, many=True)

        return Response(serializer.data)


class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        print(request.user)
        user = request.user
        username = "None"
        if user.is_authenticated:
            username = user.username
        return Response(username)

    def create(self, request, *args, **kwargs):
        """
        User can like the post only one time. If the post is already liked,
        then the user cannot like that post again.
        """
        # Check if the user has already liked the post
        post_id = request.data.get("post")
        liked_user_id = request.data.get("like_by")
        print(post_id, liked_user_id)
        print(Like.objects.filter(post=post_id, like_by=liked_user_id))
        if Like.objects.filter(post_id=post_id, like_by=liked_user_id).exists():
            return Response(
                {"detail": "You have already liked this post."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        print(self.request.data)
        response = super().create(request, *args, **kwargs)

        liked_by_user = User.objects.get(id=liked_user_id)
        post_id = request.data.get("post")
        user_name = Post.objects.get(id=post_id).author
        # print(User.objects.get(username=user_id).id)
        # print(user_id, 'sssssssss')
        author_user_id = User.objects.get(username=user_name).id

        func_dict = {
            "author_id": author_user_id,
            "like_user": liked_by_user,
            "post_id": post_id,
        }
        Type = "like_post"

        print(func_dict)

        like_notification_to_all_friend(func_dict, Type)

        return response


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def unlike_post(request, *args, **kwargs):
    data = request.data
    like_by = data.get("like_by")
    post = data.get("post")

    post_author = Post.objects.get(id=post).author
    user_id = User.objects.get(username=post_author).id

    if not like_by or not post:
        return Response({"error": "like_by and post fields are required"}, status=400)

    like = Like.objects.filter(like_by=like_by, post=post).first()

    func_dict = {
        "author_id": user_id,
        "like_user": like_by,
        "post_id": post,
    }

    print(func_dict)

    if like:
        like_notification_to_all_friend(func_dict, "dislike_post")
        like.delete()
        return Response({"success": "Unlike the post successfully"}, status=200)
    else:
        return Response({"error": "Like not found"}, status=404)


class SavedPostViewSet(viewsets.ModelViewSet):

    queryset = SavedPost.objects.all()
    serializer_class = SavedPostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]


class SavedPostViewSet(viewsets.ModelViewSet):

    queryset = SavedPost.objects.all()
    serializer_class = SavedPostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]


class SearchUserProfile(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        name = request.query_params.get("name", "")
        user = request.user
        name = "None" if name == "" else name
        # Filter user profiles based on the search term
        users = UserProfile.objects.filter(
            Q(full_name__icontains=name) | Q(username__icontains=name)
        )

        # Extract user IDs from the filtered users
        user_ids = users.values_list("id", flat=True)

        # Get all accepted friendships and pending friend requests
        accepted_friendships = FriendAccepted.objects.filter(
            Q(user=user, of_friend__in=user_ids) | Q(user__in=user_ids, of_friend=user)
        )

        pending_requests = Friend.objects.filter(
            Q(user=user, friend__in=user_ids, is_pending=True)
            | Q(user__in=user_ids, friend=user, is_pending=True)
        )

        # Create sets for quick lookup
        accepted_friends = set(
            friend.of_friend.id if friend.user == user else friend.user.id
            for friend in accepted_friendships
        )

        pending_requests_set = set(
            request.friend.id if request.user == user else request.user.id
            for request in pending_requests
        )

        # Serialize the user profiles
        serializer = UserProfileSerializer(users, many=True)

        # Annotate the serializer data with friendship status
        for user_data in serializer.data:
            user_id = user_data["id"]
            if user_id in accepted_friends:
                user_data["friendship_status"] = "accepted"
            elif user_id in pending_requests_set:
                user_data["friendship_status"] = "pending"
                if user_id != request.user.id and not Friend.objects.filter(user=request.user.id, friend=user_id).exists():
                     user_data["friendship_status"] = 'to_accept'
                elif user_id != request.user.id and  Friend.objects.filter(user=request.user.id, friend=user_id).exists():
                     user_data["friendship_status"] = 'requested'
            else:
                user_data["friendship_status"] = "none"

        return Response(serializer.data)


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        type_ = request.query_params.get("type", "")
        user_id = request.query_params.get("id", "")
        print(type_)
        if type_.lower() == "content":

            notification = Notification.objects.filter(
                to_user=user_id, is_seen=False
            ).order_by("-created_at")

            if notification.exists():
                for notify in notification:
                    notify.is_seen = True
                    notify.save()
                serializer = NotificationSerializer(notification, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(
                {"detail": "No notifications found."}, status=status.HTTP_200_OK
            )
        else:
            notification_count = Notification.objects.filter(
                to_user=user_id, is_seen=False
            ).count()
            print(notification_count)
            return Response({"notification_count": notification_count})


class MyProtectedView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # print(request.headers, "329")
        user = request.user
        username = "None"
        if user.is_authenticated:
            username = user.username
            user_ = User.objects.get(username=username)
            # print(user_.id)
        return Response(username)
