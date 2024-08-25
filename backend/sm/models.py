import json
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

# Create your models here.


class UserProfile(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    bio = models.TextField(max_length=100, null=True, blank=True)
    profile_picture = models.ImageField(upload_to="images/", null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_loggedIn = models.BooleanField(default=False, null=True, blank=True)
    username = models.CharField(max_length=20, null=True, blank=True)
    full_name = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return self.user.username


class Friend(models.Model):
    user = models.ForeignKey(
        User, related_name="friend_requests", on_delete=models.CASCADE
    )
    friend = models.ForeignKey(
        User, related_name="received_requests", on_delete=models.CASCADE
    )
    is_accepted = models.BooleanField(default=False)
    is_rejected = models.BooleanField(default=False)
    is_pending = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}_{self.user.id} is a friend request to {self.friend.username}_{self.friend.id}"


class FriendAccepted(models.Model):

    user = models.ForeignKey(User, related_name="user", on_delete=models.CASCADE)
    of_friend = models.ForeignKey(
        User, related_name="his_friend", on_delete=models.CASCADE
    )
    accepted_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}_{self.user.id} is a friend of {self.of_friend.username}_{self.of_friend.id}"


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    caption = models.TextField()
    post_image = models.ImageField(upload_to="post_img/", null=True, blank=True)
    video_file = models.FileField(upload_to="post_vid/", null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    post_type = models.TextField()

    def __str__(self):
        return f"{self.author}" + "Post"


class Gallery(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user}" + "Gallery"


class Story(models.Model):
    # author = models.ForeignKey(User, on_delete=models.CASCADE)
    # caption = models.TextField()
    # post_image = models.ImageField(upload_to='post_img/', null=True, blank=True)
    # video_file = models.FileField(upload_to='post_vid/')
    # created_at = models.DateTimeField(default=timezone.now, auto_now_add=True)
    # #expire_at
    pass


class Comment(models.Model):
    comment_author = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey("Post", on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    
   

    def __str__(self):
        return f"Comment by {self.comment_author} on {self.post} {str(self.post.id)}"

   


class Like(models.Model):
    like_by = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"like on the post '{self.post}' by {self.like_by}"


class SavedPost(models.Model):
    author_of_post = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self) -> str:
        return f"{self.author_of_post} + {self.post}"


class Notification(models.Model):
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    by_user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_seen = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    message = models.TextField()
    type_of = models.CharField(max_length=20)

    def __str__(self):
        return f"Notification for {self.to_user.username}: {self.message}"


# broadcast to friend Post Posted Done\/
# broadcast to friend Like Posted Done \/
# One to One to comment on Posted Done
# One to two to comment on comment Done
# One to two to friend request/accepted and rejected


# Signals And Triggers
# @receiver(post_save, sender=Notification)
# def notify_users(sender, instance, **kwargs):
#     if kwargs.get("created", False):
#         channel_layer = get_channel_layer()
#         print("Channel layer attributes:", dir(channel_layer))
#         data = {"notification": {"message": instance.text, "id": instance.id}}
#         async_to_sync(channel_layer.group_send)(
#             "notification_group",
#             {"type": "send_notification", "value": json.dumps(data)},
#         )
#         print("Notification created:", instance.text)
