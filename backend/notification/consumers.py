import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class NotificationConsumer(WebsocketConsumer):

    def connect(self):
        self.room_name = "notification"
        self.room_group_name = "notification_group"

        # Join the WebSocket group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,  # Use the group name for adding
            self.channel_name      # The unique channel name
        )

        self.accept()
        self.send(text_data=json.dumps({"status": "connected"}))

    def receive(self, text_data):
        # Print received message for debugging
        print(text_data)
        self.send(text_data=json.dumps({"status": "Got Your Msg"}))

    def disconnect(self, code):
        # Leave the WebSocket group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,  # Use the group name for discarding
            self.channel_name      # The unique channel name
        )

    def send_notification(self, event):
        # Handle the message sent from the channel layer
        print(event)
        self.send(text_data=json.dumps({
            
            "data": event.get('value', {})
        }))
