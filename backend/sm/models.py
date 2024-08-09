from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


# Create your models here.

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=100)
    profile_picture = models.ImageField(upload_to='images/')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_loggedIn = models.BooleanField(default=False)

class Post(models.Model):
    author = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    caption = models.TextField()
    post_image = models.ImageField(upload_to='post_img/', null=True, blank=True)
    video_file = models.FileField(upload_to='post_vid/')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    post_type = models.TextField()

class Gallery(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)



class Story(models.Model):
    # author = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    # caption = models.TextField()
    # post_image = models.ImageField(upload_to='post_img/', null=True, blank=True)
    # video_file = models.FileField(upload_to='post_vid/')
    # created_at = models.DateTimeField(default=timezone.now, auto_now_add=True)
    # #expire_at
    pass


class Comment(models.Model):
    comment_author = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

class Like(models.Model):
    like_by = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)

class SavedPost(models.Model):
    author_of_post = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)



