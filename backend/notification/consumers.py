import json
from channels.generic.websocket import WebsocketConsumer, AsyncJsonWebsocketConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync

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
class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):

        self.user = self.scope['user']
        self.room_group_name = f'user_{self.user.id}'
        print(self.room_group_name)

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'notification_message',
                'message': message
            }
        )

    async def notification_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))