from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate, logout


from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from datetime import timedelta


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



@api_view(['POST'])
def user_registration(request):
    if request.user.is_authenticated:
        return Response({"error": "User already authenticated"}, status=status.HTTP_400_BAD_REQUEST)

    username = request.data.get('username')
    email = request.data.get('email')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    password = request.data.get('password')
    password2 = request.data.get('password2')

    if password != password2:
        return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        password=password
    )

    user_profile = UserProfile(user=user)
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
 
@api_view(['POST'])
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
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            }, status=status.HTTP_200_OK)
        
        # If validation fails, return errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Return error if method is not POST
    return Response({"status": "Invalid method"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

class PostViewSet(viewsets.ModelViewSet):

    queryset = Post.objects.all()
    serializer_class = PostSerializer
    http_method_names = ["get", "post", "put", "patch", "delete"]

    # List api/post/
    # Reterive   api/post/<id>
    # Put   api/post/<id>
    # Patch   api/post/<id>
    # Delete   api/post/<id>


class CommentViewSet(viewsets.ModelViewSet):

    queryset = Comment.objects.all()
    serializer_class = CommentSerializer


# class LikeViewSet(viewsets.ModelViewSet):

#     queryset = Like.objects.all()
#     serializer_class = LikeSerializer

#     def create(self, request, *args, **kwargs):
#         """
#         User can like the post only one time if the post is already liked then user can not liked that post again

#         """

#         response = super().create(request, *args, **kwargs)
#         print(request.data)
#         print("Is")

#         liked_user_id = request.data.get("like_by")
#         print(liked_user_id)
#         if liked_user_id:

#             # Create a notification
#             channel_layer = get_channel_layer()
#             message = f"{request.user.username} liked your post."
#             print(message)
#             print("Inside View: ", f"user_{liked_user_id}")
#             async_to_sync(channel_layer.group_send)(
#                 f"user_{liked_user_id}",
#                 {"type": "notification_message", "message": message},
#             )

#         return response

class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]

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
        # post_id = request.data.get("post_id")
        # user_id = request.user.id
        # if Like.objects.filter(post_id=post_id, user_id=user_id).exists():
        #     return Response({"detail": "You have already liked this post."}, status=status.HTTP_400_BAD_REQUEST)

        response = super().create(request, *args, **kwargs)

        liked_user_id = request.data.get("like_by")

        post_id = request.data.get("post")
        user_name = Post.objects.get(id = post_id).author
        # print(User.objects.get(username=user_id).id)
        # print(user_id, 'sssssssss')
        author_user_id = User.objects.get(username=user_name).id

        if author_user_id:
            # Create a notification
            print("Inside", f'user_{author_user_id}', liked_user_id)
            channel_layer = get_channel_layer()
            message = f"{request.user.username} liked your post."
            async_to_sync(channel_layer.group_send)(
                f"user_{author_user_id}",
                {
                    "type": "notification_message",
                    "message": message,
                    "sender_id":liked_user_id,
                    "author_id":author_user_id
                }
            )

        return response 


class SavedPostViewSet(viewsets.ModelViewSet):

    queryset = SavedPost.objects.all()
    serializer_class = SavedPostSerializer


class SavedPostViewSet(viewsets.ModelViewSet):

    queryset = SavedPost.objects.all()
    serializer_class = SavedPostSerializer


from rest_framework.permissions import IsAuthenticated


class MyProtectedView(APIView):
    # permission_classes = [IsAuthenticated]
     
    def get(self, request, *args, **kwargs):
        print(request.user)
        user = request.user
        username = "None"
        if user.is_authenticated:
            username = user.username 
            user_ = User.objects.get(username=username)
            print(user_.id)           
        return Response(username)