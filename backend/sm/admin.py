from django.contrib import admin

# Register your models here.
from .models import *
# Register your models here.

admin.site.register(UserProfile)
admin.site.register(Friend)
admin.site.register(FriendAccepted)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Like)
admin.site.register(Notification)