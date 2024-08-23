from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import ValidationError

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from .models import *
from .helper import *





class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','email','first_name','last_name','date_joined']
        #['id','username','email','first_name','last_name','is_active','date_joined']


class UserProfileSerializer(serializers.ModelSerializer):

    
    user = UserSerializer()

    class Meta:
        model = UserProfile
        fields ="__all__"


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
        
class CommentSerializer(serializers.ModelSerializer):

    user_profile = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = "__all__"

    def get_user_profile(self, obj):
        user = User.objects.get(username=obj.comment_author)
        user_profile = UserProfile.objects.get(user=user)
        print(user_profile.id, user.id)

        serializer = UserProfileSerializer(user_profile)
        
        return serializer.data


    


class LikeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Like
        fields = "__all__"

    


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer()
    comment_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    like_obj = serializers.SerializerMethodField()
    # like_by_auth_user = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = "__all__"

    def get_comment_count(self, obj):
        return Comment.objects.filter(post=obj).count()
    
    def get_likes_count(self, obj):  
        
        return Like.objects.filter(post=obj).count()
    def get_like_obj(self, obj):
        likes = Like.objects.filter(post=obj)
        return LikeSerializer(likes, many=True).data
    





class SavedPostSerializer(serializers.ModelSerializer):

    class Meta:
        model = SavedPost
        fields = "__all__"


class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = "__all__"
