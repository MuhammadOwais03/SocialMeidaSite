from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from django.contrib.auth.models import User

from rest_framework.decorators import api_view
from .serializers import *
from .models import *


@api_view(["GET"])
def api_root(request):
    return Response(
        {
            "posts": "/post/",
            # Add more links if you have other endpoints
        }
    )


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


class LikeViewSet(viewsets.ModelViewSet):

    queryset = Like.objects.all()
    serializer_class = LikeSerializer

    
    def create(self, request, *args, **kwargs):
        

        """
        User can like the post only one time if the post is already liked then user can not liked that post again

        """

        response = super().create(request, *args, **kwargs)
        print(request.data)
        print("Is")
        
        liked_user_id = request.data.get('like_by')  
        print(liked_user_id)
        if liked_user_id:
            
            # Create a notification
            channel_layer = get_channel_layer()
            message = f'{request.user.username} liked your post.'
            print("Inside View: ", f'user_{liked_user_id}')
            async_to_sync(channel_layer.group_send)(
                f'user_{liked_user_id}',
                {
                    'type': 'notification_message',
                    'message': message
                }
            )

        return response

class SavedPostViewSet(viewsets.ModelViewSet):

    queryset = SavedPost.objects.all()
    serializer_class = SavedPostSerializer


class SavedPostViewSet(viewsets.ModelViewSet):

    queryset = SavedPost.objects.all()
    serializer_class = SavedPostSerializer
