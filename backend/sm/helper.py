from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models import Q


from .models import *
from .serializers import *
from django.contrib.contenttypes.models import ContentType


def mutual_friends(user1_id, user2_id):
    # Get friends of user1
    user1_friends = FriendAccepted.objects.filter(user=user1_id).values_list(
        "of_friend_id", flat=True
    )

    # Get friends of user2
    user2_friends = FriendAccepted.objects.filter(user=user2_id).values_list(
        "of_friend_id", flat=True
    )

    # Find common friends (mutual friends)
    mutual_friends_ids = set(user1_friends).intersection(set(user2_friends))

    # Get user instances for mutual friends
    mutual_friends = User.objects.filter(id__in=mutual_friends_ids)

    # Print for debugging
    # print(user1_friends, user2_friends, mutual_friends)

    return mutual_friends


def user_that_likes_the_post(post):
    all_likes_post = Like.objects.filter(post=post).values_list("like_by_id", flat=True)
    users = User.objects.filter(id__in=all_likes_post)
    return users


def like_notification_to_all_friend(request, Type):
    user_id = request.get("author_id")
    like_user = request.get("like_user")
    post_id = request.get("post_id")
    user = User.objects.get(id=user_id)

    if Type.lower() == "like_post":
        post = Post.objects.get(id=post_id)
        message = f"{like_user.username} like {post.author.username} '{post.caption}'"

        if not Notification.objects.filter(
            to_user=user,
            by_user=like_user,
            content_type=ContentType.objects.get_for_model(post),
            object_id=post.id,
            type_of="like",
        ).exists():
            # Create and save a new notification
            notification = Notification(
                to_user=user,
                by_user=like_user,
                content_type=ContentType.objects.get_for_model(post),
                object_id=post.id,
                message=message,
                type_of="like",
            )
            notification.save()

        print(user_id, "in friend")
        friends = FriendAccepted.objects.filter(user=user_id).values_list(
            "of_friend", flat=True
        )

        # Add the authenticated user's ID to the list
        friends = list(friends)  # Convert to list
        friends.append(user_id)

        like_count = Like.objects.filter(post=post).count()

        if friends:

            channel_layer = get_channel_layer()

            for friend in friends:
                if friend != like_user.id:
                    user_obj = User.objects.get(id=friend)
                    notification_count = Notification.objects.filter(
                        to_user=user_obj, is_seen=False
                    ).count()

                    group_name = f"user_{friend}"
                    friend_id = friend

                    async_to_sync(channel_layer.group_send)(
                        f"{group_name}",
                        {
                            "type": "like_notification_message",
                            "category": "like_post",
                            "message": message,
                            "sender_id": user_id,
                            "author_id": friend_id,
                            "notification_count": notification_count,
                            "like_count": like_count,
                            "post_id": post_id,
                        },
                    )

    elif Type.lower() == "dislike_post":
        message = ""

        friends = FriendAccepted.objects.filter(user=user_id).values_list(
            "of_friend", flat=True
        )

        # Add the authenticated user's ID to the list
        friends = list(friends)  # Convert to list
        friends.append(user_id)
        post = Post.objects.get(id=post_id)
        dislike_user = User.objects.get(
            username=Like.objects.get(like_by=like_user, post=post).like_by
        )
        like_count = Like.objects.filter(post=post).count()
        if friends:

            channel_layer = get_channel_layer()

            for friend in friends:
                if friend != like_user:
                    user_obj = User.objects.get(id=friend)
                    notification = Notification.objects.filter(
                        by_user=dislike_user.id,
                        to_user=user_obj,
                        content_type=ContentType.objects.get_for_model(post),
                        type_of="like",
                    )
                    if notification.exists():
                        notification[0].delete()
                    notification_count = Notification.objects.filter(
                        to_user=user_obj, is_seen=False
                    ).count()
                    print(notification_count)
                    group_name = f"user_{friend}"
                    friend_id = friend

                    async_to_sync(channel_layer.group_send)(
                        f"{group_name}",
                        {
                            "type": "like_notification_message",
                            "category": "dislike",
                            "message": message,
                            "sender_id": user_id,
                            "author_id": friend_id,
                            "notification_count": notification_count,
                            "like_count": like_count - 1,
                            "post_id": post_id,
                        },
                    )
