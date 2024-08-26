import json
import jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.exceptions import StopConsumer
from django.conf import settings

class LikeNotification(AsyncWebsocketConsumer):
    async def connect(self):
        token = self.scope["query_string"].decode().split("=")[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            self.user = payload.get("user_id")

            if self.user:
                self.room_group_name = f"user_{self.user}"
                print(f"User {self.user} joining room {self.room_group_name}")

                await self.channel_layer.group_add(self.room_group_name, self.channel_name)
                await self.accept()
            else:
                await self.close()
        except jwt.ExpiredSignatureError:
            print("Token expired.")
            await self.close()
        except jwt.InvalidTokenError:
            print("Invalid token.")
            await self.close()

    async def disconnect(self, close_code):
        print("1", 31)
        if hasattr(self, 'room_group_name'):
            print("2", 33)
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print("3", 35)
        raise StopConsumer()

    async def receive(self, text_data):
        # Handle incoming messages if needed
        pass

    async def like_notification_message(self, event):
        category = event.get("category", "").lower()

        response_data = {
            "category": category,
            "sender_id": event.get("sender_id", ""),
            "author_id": event.get("author_id", ""),
            "notification_count": event.get("notification_count", 0),
            "like_count": event.get("like_count", 0),
            "post_id": event.get("post_id", ""),
            "sender": event.get("sender", ""),
            "message": event.get("message", ""),
            "comment_count": event.get("comment_count", 0),
            "post": event.get("post", ""),
            "receiving": event.get("receiving", ""),
            "data": event.get("data", {}),
        }

        await self.send(text_data=json.dumps(response_data))
