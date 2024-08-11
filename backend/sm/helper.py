from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models import Q


from .models import *


def mutual_friends(user1_id, user2_id):
    # Get friends of user1
    user1_friends = FriendAccepted.objects.filter(user=user1_id).values_list('of_friend_id', flat=True)

    # Get friends of user2
    user2_friends = FriendAccepted.objects.filter(user=user2_id).values_list('of_friend_id', flat=True)

    # Find common friends (mutual friends)
    mutual_friends_ids = set(user1_friends).intersection(set(user2_friends))

    # Get user instances for mutual friends
    mutual_friends = User.objects.filter(id__in=mutual_friends_ids)
    
    # Print for debugging
    print(user1_friends, user2_friends, mutual_friends)
    
    return mutual_friends



def notification_to_all_friends(request, Type):

    if Type.strip() == "post_posted":

        user_id = int(request.data.get("author"))
        friends = FriendAccepted.objects.filter(user=user_id)
        post_id = int(request.data.get("id"))
        post_caption = request.data.get("caption")

        user = User.objects.get(id=user_id)
        username = user.username
        message = f"{username} posted a post '{post_caption}'"

        notification = Notification.objects.create(is_seen=False)
        notification_post = NotificationPostPosted.objects.create(
            notification=notification,
            post=Post.objects.get(id=post_id),
            message=message
        )

    elif Type == 'like_post':

        print(';inside like')
        user_id = request.get('author_id')
        like_user = request.get('like_user')
        post_id = request.get('post_id')

        post = Post.objects.get(id=post_id)
        message = f"{like_user.username} like {post.author.username} '{post.caption}'"


        notification = Notification.objects.create(is_seen=False)
        notification_like = NotificationLikePost.objects.create(
            notification=notification,
            like=Like.objects.filter(post=post, like_by=like_user)[0],
            message=message
        )

        print("after",notification_like.like)
        friends = mutual_friends(user_id, like_user)
        print(friends)
        
 
    if friends.exists():
        
        channel_layer = get_channel_layer()

        for friend in friends:
            print(friend)
            try:
                print(f"user_{friend.friend.id}")
                friend_id = friend.friend.id
                group_name = f"user_{friend.friend.id}"
            except:
                group_name = f"user_{friend.id}"
                friend_id = friend.id
            print(f"user_{group_name}")
            async_to_sync(channel_layer.group_send)(
                f"{group_name}",
                {
                    "type": "notification_message",
                    "message": message,
                    "sender_id": user_id,
                    "author_id": friend_id,
                },
            )
            # print(friend.friend, friend.user)
