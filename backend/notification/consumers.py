import json
from channels.generic.websocket import WebsocketConsumer, AsyncJsonWebsocketConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync, sync_to_async
from django.conf import settings
import jwt
from django.contrib.auth.models import User


from sm.serializers import *
from sm.models import *


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract token from the query parameters
        token = self.scope["query_string"].decode().split("=")[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            self.user = payload.get("user_id")

            if self.user:
                self.room_group_name = f"user_{self.user}"
                # Join the room group
                await self.channel_layer.group_add(
                    self.room_group_name, self.channel_name
                )
                await self.accept()

                # Optionally send a welcome message or confirmation
                await self.send(
                    text_data=json.dumps({"message": f"Connected as {self.user}"})
                )
            else:
                await self.close()
        except jwt.ExpiredSignatureError:
            await self.close()
        except jwt.InvalidTokenError:
            await self.close()

    async def disconnect(self, close_code):
        # Leave the room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        sender_id = text_data_json.get("sender_id")
        recipient_id = text_data_json.get("recipient_id")
        message = text_data_json.get("message")

        if recipient_id:
            recipient_group_name = f"user_{recipient_id}"
            await self.channel_layer.group_send(
                recipient_group_name,
                {
                    "type": "notification_message",
                    "sender_id": sender_id,
                    "message": message,
                },
            )

    async def notification_message(self, event):
        message = event["message"]
        sender_id = event["sender_id"]

        # Send message to WebSocket
        await self.send(
            text_data=json.dumps({"sender_id": sender_id, "message": message})
        )


class LikeNotification(AsyncWebsocketConsumer):
    async def connect(self):
        token = self.scope["query_string"].decode().split("=")[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            self.user = payload.get("user_id")

            if self.user:
                self.room_group_name = f"user_{self.user}"
                # Join the room group
                await self.channel_layer.group_add(
                    self.room_group_name, self.channel_name
                )
                await self.accept()

            else:
                await self.close()
        except jwt.ExpiredSignatureError:
            await self.close()
        except jwt.InvalidTokenError:
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        sender_id = text_data_json.get("sender_id")
        recipient_id = text_data_json.get("recipient_id")
        message = text_data_json.get("message")

        if recipient_id:
            recipient_group_name = f"user_{recipient_id}"
            await self.channel_layer.group_send(
                recipient_group_name,
                {
                    "type": "notification_message",
                    "sender_id": sender_id,
                    "message": message,
                },
            )

    # Receive message from room group
    async def like_notification_message(self, event):

        category = event["category"]
        print(category)
        if category.lower() == "dislike":

            sender_id = event["sender_id"]
            author_id = event["author_id"]
            notification_count = event["notification_count"]
            like_count = event["like_count"]
            post_id = event["post_id"]

            await self.send(
                text_data=json.dumps(
                    {
                        "sender_id": sender_id,
                        "author_id": author_id,
                        "notification_count": notification_count,
                        "like_count": like_count,
                        "post_id": post_id,
                        "category": category,
                    }
                )
            )
        elif category == "comment":
            sender_id = event.get("sender")  # Correct key names
            author_id = event.get("author")
            post_id = event.get("post")
            message = event.get("message")
            notification_count = event.get(
                "notification_count", 0
            )  # Provide default values
            comment_count = event.get("comment_count", 0)
            category = event.get("category", "")

            # Send the data to the WebSocket client
            await self.send(
                text_data=json.dumps(
                    {
                        "sender": sender_id,
                        "message": message,
                        "author": author_id,
                        "notification_count": notification_count,
                        "comment_count": comment_count,
                        "post": post_id,
                        "category": category,
                    }
                )
            )
        elif category == "like_post":
            message = event["message"]
            sender_id = event["sender_id"]
            author_id = event["author_id"]
            notification_count = event["notification_count"]
            like_count = event["like_count"]
            post_id = event["post_id"]
            category = event["category"]

            # Send message to WebSocket
            await self.send(
                text_data=json.dumps(
                    {
                        "sender_id": sender_id,
                        "message": message,
                        "author_id": author_id,
                        "notification_count": notification_count,
                        "like_count": like_count,
                        "post_id": post_id,
                        "category": category,
                    }
                )
            )


class CommentNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        token = self.scope["query_string"].decode().split("=")[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            self.user = payload.get("user_id")

            if self.user:
                self.room_group_name = f"user_{self.user}"
                # Join the room group
                await self.channel_layer.group_add(
                    self.room_group_name, self.channel_name
                )
                await self.accept()

            else:
                await self.close()
        except jwt.ExpiredSignatureError:
            await self.close()
        except jwt.InvalidTokenError:
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        sender_id = text_data_json.get("sender_id")
        recipient_id = text_data_json.get("recipient_id")
        message = text_data_json.get("message")

        if recipient_id:
            recipient_group_name = f"user_{recipient_id}"
            await self.channel_layer.group_send(
                recipient_group_name,
                {
                    "type": "comment_notification_message",  # Updated to match handler method
                    "sender": sender_id,
                    "message": message,
                },
            )

    # Receive message from room group
    async def comment_notification_message(self, event):
        sender_id = event.get("sender")  # Correct key names
        author_id = event.get("author")
        post_id = event.get("post_id")
        message = event.get("message")
        notification_count = event.get(
            "notification_count", 0
        )  # Provide default values
        comment_count = event.get("comment_count", 0)
        category = event.get("category", "")

        # Send the data to the WebSocket client
        await self.send(
            text_data=json.dumps(
                {
                    "sender": sender_id,
                    "message": message,
                    "author": author_id,
                    "notification_count": notification_count,
                    "comment_count": comment_count,
                    "post": post_id,
                    "category": category,
                }
            )
        )
