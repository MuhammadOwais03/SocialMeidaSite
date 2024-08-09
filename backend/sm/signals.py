# signals.py

import json
from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Like, Notification

# @receiver(post_save, sender=Like)
# def notify_on_like(sender, instance, **kwargs):
#     if kwargs.get('created', False):
#         # Create a notification
#         user = instance.post.author  # Assuming you want to notify the post author
#         notification = Notification.objects.create(
#             user=user,
#             text=f"{instance.like_by.user.username} liked your post!"
#         )
        
#         # Prepare notification data
#         channel_layer = get_channel_layer()
#         data = {
#             'notification': {
#                 'message': notification.text,
#                 'id': notification.id
#             }
#         }
        
#         # Send notification to the WebSocket group
#         async_to_sync(channel_layer.group_send)(
#             'notifications_group',
#             {
#                 'type': 'send_notification',
#                 'notification': json.dumps(data)
#             }
#         )

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
