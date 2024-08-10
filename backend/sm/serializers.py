from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken


from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from .models import *



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):

    password2 = serializers.CharField(write_only=True)
    user = UserSerializer

    class Meta:
        model = UserProfile
        fields = [
            "bio",
        ]

    


from django.contrib.auth import authenticate

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user is None:
            raise serializers.ValidationError("Invalid credentials")
        return user


class PostSerializer(serializers.ModelSerializer):

    author = UserProfileSerializer()

    class Meta:
        model = Post
        fields = "__all__"


class CommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comment
        fields = "__all__"


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
