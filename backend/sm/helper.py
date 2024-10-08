from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models import Q
import json

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
    print(Type)
    if (
        Type != "friend_request"
        and Type != "reject_cancel"
        and Type != "friend_accepted"
        and Type != "post_posted"
    ):
        user_id = request.get("author_id")
        like_user = request.get("like_user")
        post_id = request.get("post_id")
        user = User.objects.get(id=user_id)
    elif Type == "friend_accepted":
        friend_accepted_by_obj = request.get("friend_accepted_by")
    elif Type == "post_posted":
        user = request.get("user")
        response = request.get("response")

    else:
        from_user = request.get("user")
        to_user = request.get("friend")
        serializer_data = request.get("serializer_data")
        print(serializer_data)

    if Type.lower() == "like_post":
        post = Post.objects.get(id=post_id)
        message = f"{like_user.username} like {post.author.username} '{post.caption}'"

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
                    if (
                        not Notification.objects.filter(
                            to_user=user_obj,
                            by_user=like_user,
                            content_type=ContentType.objects.get_for_model(post),
                            object_id=post.id,
                            type_of="like",
                            is_seen=False
                        ).exists()
                        and like_user.id != user_obj.id
                    ):

                        notification = Notification(
                            to_user=user_obj,
                            by_user=like_user,
                            content_type=ContentType.objects.get_for_model(post),
                            object_id=post.id,
                            message=message,
                            type_of="like",
                        )
                        notification.save()
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
                        by_user=dislike_user,
                        to_user=user_obj,
                        content_type=ContentType.objects.get_for_model(post),
                        type_of="like",
                        is_seen=False
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
    elif Type == "friend_request":
        message = f"{serializer_data['user_profile']['username']} gives you a follow request {serializer_data['friend_request_profile']['username']}"
        print(message)
        friend_request = Friend.objects.get(user=from_user, friend=to_user)
        From_User = User.objects.get(id=from_user)
        To_User = User.objects.get(id=to_user)

        notifications = Notification.objects.filter(
            by_user=From_User,
            to_user=To_User,
            content_type=ContentType.objects.get_for_model(friend_request),
            type_of="friend_request",
        )

        if not notifications.exists():

            notification = Notification(
                to_user=To_User,
                by_user=From_User,
                content_type=ContentType.objects.get_for_model(friend_request),
                object_id=friend_request.id,
                message=message,
                type_of="friend_request",
                
            )
            notification.save()

        notification_count = Notification.objects.filter(to_user=to_user).count()
        group_name = f"user_{to_user}"
        print(group_name, "in helper")

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"{group_name}",
            {
                "type": "like_notification_message",
                "category": "friend_request",
                "message": message,
                "sender_id": from_user,
                "receiving": to_user,
                "notification_count": notification_count,
                "data": serializer_data,
            },
        )
    elif Type == "reject_cancel":
        notification_count = request.get("notification_count")
        receiver = request.get("receiver")
        group_name = f"user_{receiver}"
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"{group_name}",
            {
                "type": "like_notification_message",
                "category": "reject_cancel",
                "notification_count": notification_count,
            },
        )
    elif Type.strip().lower() == "friend_accepted":
        print("ENTER IN ACCEPTANCE")
        notification_to_user = friend_accepted_by_obj.user.id
        message = f"{friend_accepted_by_obj.user.first_name} @{friend_accepted_by_obj.user.username} has accepted your follow request"

        user_profile = UserProfile.objects.get(user=friend_accepted_by_obj.of_friend)
        group_name = f"user_{user_profile.id}"
        print(group_name, message)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"{group_name}",
            {
                "type": "like_notification_message",
                "category": "friend_accepted",
                "message": message,
            },
        )

    elif Type.strip().lower() == "post_posted":

        friends = FriendAccepted.objects.filter(user=user).values_list(
            "of_friend", flat=True
        )

        print(response, "333")
        post = Post.objects.filter(author=user).latest("created_at")
        message = f"{user.username} just posted the post"

        for fr_id in friends:
            print("POST POSTED")
            friend_obj = User.objects.get(id=fr_id)
            notification = Notification.objects.filter(
                by_user=user,
                to_user=friend_obj,
                content_type=ContentType.objects.get_for_model(post),
                type_of="post_posted",
                is_seen=False
            )

            if not notification.exists():
                notification_friend = Notification.objects.create(
                    by_user=user,
                    to_user=friend_obj,
                    content_type=ContentType.objects.get_for_model(post),
                    object_id=post.id,
                    message=message,
                    type_of="post_posted",
                )

                notification_friend.save()

            notification_count = Notification.objects.filter(to_user=friend_obj, is_seen = False).count()
            group_name = f"user_{fr_id}"
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"{group_name}",
                {
                    "type": "like_notification_message",
                    "category": "post_posted",
                    "message": message,
                    "response": response,
                    "notification_count": notification_count,
                },
            )
