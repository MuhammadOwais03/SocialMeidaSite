import json
from channels.generic.websocket import WebsocketConsumer, AsyncJsonWebsocketConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from django.conf import settings
import jwt
from django.contrib.auth.models import User

# class NotificationConsumer(WebsocketConsumer):

#     def connect(self):
#         self.room_name = "notification"
#         self.room_group_name = "notification_group"

#         # Join the WebSocket group
#         async_to_sync(self.channel_layer.group_add)(
#             self.room_group_name,  # Use the group name for adding
#             self.channel_name      # The unique channel name
#         )

#         self.accept()
#         self.send(text_data=json.dumps({"status": "connected"}))

#     def receive(self, text_data):
#         # Print received message for debugging
#         print(text_data)
#         self.send(text_data=json.dumps({"status": "Got Your Msg"}))

#     def disconnect(self, code):
#         # Leave the WebSocket group
#         async_to_sync(self.channel_layer.group_discard)(
#             self.room_group_name,  # Use the group name for discarding
#             self.channel_name      # The unique channel name
#         )

#     def send_notification(self, event):
#         # Handle the message sent from the channel layer
#         print(event)
#         self.send(text_data=json.dumps({
            
#             "data": event.get('value', {})
#         }))
# class NotificationConsumer(AsyncWebsocketConsumer):
#     async def connect(self):

#         self.user = self.scope['user']
#         self.room_group_name = f'user_{self.user.id}'
#         print(self.room_group_name)

#         # Join room group
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )

#         await self.accept()

#     async def disconnect(self, close_code):
#         # Leave room group
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         message = data['message']

#         # Send message to room group
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'notification_message',
#                 'message': message
#             }
#         )

#     async def notification_message(self, event):
#         message = event['message']

#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'message': message
#         }))



# class NotificationConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.user = self.scope['user']
#         if self.user.is_authenticated:
#             self.room_name = f"user_{self.user.id}"
#             self.room_group_name = f"notifications_{self.user.id}"

#             print(self.room_group_name)

#             await self.channel_layer.group_add(
#                 self.room_group_name,
#                 self.channel_name
#             )

#             await self.accept()

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )

#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         message = text_data_json['message']

#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'notification_message',
#                 'message': message
#             }
#         )

#     async def notification_message(self, event):
#         message = event['message']

#         await self.send(text_data=json.dumps({
#             'message': message
#         }))



#web2 => user_3 m_o
#web => user_5 m_o1

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # print(self.scope['cookies']['accessToken'])
        payload = jwt.decode(self.scope['cookies']['accessToken'], settings.SECRET_KEY, algorithms=["HS256"])
        # print(self.scope.keys())
        
        self.user = payload.get('user_id')
        print(f'user_{self.user}')
        if self.user:
            # Add the user to their own group
            self.room_group_name = f"user_{self.user}"
            # print(self.room_group_name)
            # Join the room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()

            self.send({
                "message":self.user
            })

    async def disconnect(self, close_code):
        # Leave the room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        sender_id = text_data_json['sender_id']
        recipient_id = text_data_json['recipient_id']
        message = text_data_json['message']

        # Determine the recipient's room group
        recipient_group_name = f"user_{recipient_id}"

        # Send the message to the recipient's room group
        await self.channel_layer.group_send(
            recipient_group_name,
            {
                'type': 'notification_message',
                'sender_id': sender_id,
                'message': message
            }
        )

    async def notification_message(self, event):
        message = event['message']
        sender_id = event['sender_id']
        author = event['author_id']

        print(sender_id, message)
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'sender_id': sender_id,
            'author': author,
            'message': message
        }))