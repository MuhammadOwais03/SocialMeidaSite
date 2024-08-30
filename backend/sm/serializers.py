from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import ValidationError

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from .models import *
from .helper import *
from .comment_notification import comment_notification_to_all_friends


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "date_joined"]
        # ['id','username','email','first_name','last_name','is_active','date_joined']


class UserProfileSerializer(serializers.ModelSerializer):

    user = UserSerializer()

    class Meta:
        model = UserProfile
        fields = "__all__"


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

    user_profile = serializers.SerializerMethodField()
    friend_request_profile = serializers.SerializerMethodField()
    followers = serializers.SerializerMethodField()

    class Meta:
        model = Friend
        fields = "__all__"

    def validate(self, attrs):
        user = attrs.get("user")
        friend = attrs.get("friend")

        # Check if the users are already friends
        if (
            FriendAccepted.objects.filter(user=user, of_friend=friend).exists()
            or FriendAccepted.objects.filter(user=friend, of_friend=user).exists()
        ):
            raise serializers.ValidationError("Both users are already friends")

        # Check if a friend request has already been generated
        if Friend.objects.filter(user=user, friend=friend).exists():
            raise serializers.ValidationError("Friend request already generated")

        return attrs

    def get_user_profile(self, obj):
        user = User.objects.get(username=obj.user)
        user_profile = UserProfile.objects.get(user=user)
        serializer = UserProfileSerializer(user_profile)

        return serializer.data

    def get_friend_request_profile(self, obj):
        friend = User.objects.get(username=obj.friend)
        user_profile = UserProfile.objects.get(user=friend)
        serializer = UserProfileSerializer(user_profile)

        return serializer.data

    def get_followers(self, obj):
        print(obj.friend)
        followers_count = FriendAccepted.objects.filter(Q(user=obj.friend)).count()
        return followers_count


class FriendAcceptedSerializer(serializers.ModelSerializer):

    user_profile = serializers.SerializerMethodField()
    friend_request_profile = serializers.SerializerMethodField()
    followers = serializers.SerializerMethodField()

    class Meta:
        model = FriendAccepted
        fields = "__all__"

    def get_user_profile(self, obj):
        user = User.objects.get(username=obj.user)
        user_profile = UserProfile.objects.get(user=user)
        serializer = UserProfileSerializer(user_profile)

        return serializer.data

    def get_friend_request_profile(self, obj):
        friend = User.objects.get(username=obj.of_friend)
        user_profile = UserProfile.objects.get(user=friend)
        serializer = UserProfileSerializer(user_profile)

        return serializer.data

    def get_followers(self, obj):
        print(obj.user, "owais")
        followers_count = FriendAccepted.objects.filter(Q(user=obj.of_friend)).count()
        return followers_count


class CommentSerializer(serializers.ModelSerializer):

    user_profile = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = "__all__"

    def create(self, validated_data):

        post = validated_data.get("post")
        comment_author = validated_data.get("comment_author")

        author = User.objects.get(username=post.author)

        response = super().create(validated_data)
        comment_notification_to_all_friends(post, author, comment_author)

        return response

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
    to_user = UserSerializer()
    by_user = UserSerializer()
    content_object = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()
    link_to_post = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = "__all__"

    def get_content_object(self, obj):
        """Dynamically select the correct serializer based on the content type."""
        if obj.content_type.model == "post":
            return PostSerializer(obj.content_object).data
        elif obj.content_type.model == "comment":
            return CommentSerializer(obj.content_object).data
        # Add more elif statements for other content types
        else:
            return None  # or handle this case as needed

    def get_profile_picture(self, obj):
        try:
            user_profile = UserProfile.objects.get(user=obj.by_user)
            return (
                user_profile.profile_picture.url
                if user_profile.profile_picture
                else None
            )
        except UserProfile.DoesNotExist:
            return None

    def get_link_to_post(self, obj):
        if not "friend" in obj.type_of.lower():

            return "link_to_post"
