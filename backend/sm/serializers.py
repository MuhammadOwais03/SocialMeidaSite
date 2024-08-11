from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import ValidationError

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id']


class UserProfileSerializer(serializers.ModelSerializer):

    
    user = UserSerializer()

    class Meta:
        model = UserProfile
        fields = [
            "bio",
            "user"
        ]


from django.contrib.auth import authenticate


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data["username"], password=data["password"])
        if user is None:
            raise serializers.ValidationError("Invalid credentials")
        return user


class FriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friend
        fields = "__all__"

    def validate(self, attrs):
        user = attrs.get('user')
        friend = attrs.get('friend')

        # Check if the users are already friends
        if FriendAccepted.objects.filter(user=user, of_friend=friend).exists() or \
           FriendAccepted.objects.filter(user=friend, of_friend=user).exists():
            raise serializers.ValidationError("Both users are already friends")

        # Check if a friend request has already been generated
        if Friend.objects.filter(user=user, friend=friend).exists():
            raise serializers.ValidationError("Friend request already generated")

        return attrs
        

    


class PostSerializer(serializers.ModelSerializer):

    # author = UserSerializer()
 
    class Meta:
        model = Post
        fields = "__all__"


class CommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comment
        fields = "__all__"

    def create(self, validated_data):
        parent = validated_data.get("parent", None)
        print(parent.id)
        if parent:
            if parent.post != validated_data["post"]:
                raise serializers.ValidationError(
                    "Parent comment must belong to the same post."
                )

        comment = Comment(
            comment_author=validated_data["comment_author"],
            post=validated_data["post"],
            content=validated_data["content"],
            parent=parent,
        )

        comment.save()

        return comment


class LikeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Like
        fields = "__all__"


class SavedPostSerializer(serializers.ModelSerializer):

    class Meta:
        model = SavedPost
        fields = "__all__"


class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = "__all__"
