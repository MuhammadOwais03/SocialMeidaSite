import logging
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models import Q
from .models import *
from .serializers import *
from django.contrib.contenttypes.models import ContentType

logger = logging.getLogger(__name__)

def comment_notification_to_all_friends(post, author, comment_author):
    message = f"{comment_author.first_name} {comment_author.last_name} @{comment_author.username} commented on {author.first_name} {author.last_name} @{author.username}'s post \n '{post.caption if post.caption else ''}'"

    friends = FriendAccepted.objects.filter(user=author.id).values_list("of_friend", flat=True)
    friends = list(friends)  # Convert to list
    friends.append(author.id)

    comment_count = Comment.objects.filter(post=post.id).count()

    
    notification = Notification(
            to_user=author,
            by_user=comment_author,
            content_type=ContentType.objects.get_for_model(post),
            object_id=post.id,
            message=message,
            type_of='comment'
        )
    notification.save()
    logger.info(f"Notification created for post ID {post.id}")

    if friends:
        channel_layer = get_channel_layer()
        for friend in friends:
            try:
                user_obj = User.objects.get(id=friend)
                notification_count = Notification.objects.filter(to_user=user_obj, is_seen=False).count()
                if comment_author.id != friend:
                    group_name = f"user_{friend}"
                    async_to_sync(channel_layer.group_send)(
                            group_name,
                            {
                                "type": "like_notification_message",
                                "category": "comment",
                                "message": message,
                                "sender": comment_author.id,
                                "author": author.id,
                                "post": post.id,
                                "notification_count": notification_count,
                                "comment_count": comment_count,
                            },
                        )
                    logger.info(f"Notification sent to user ID {friend}")
            except User.DoesNotExist:
                    logger.error(f"User ID {friend} does not exist")
