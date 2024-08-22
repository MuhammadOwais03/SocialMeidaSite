"""
ASGI config for Pinsta project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from notification.consumers import NotificationConsumer, LikeNotification

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Pinsta.settings")

# Initialize Django ASGI application early to ensure the app is ready
django_asgi_app = get_asgi_application()

websocket_urlpatterns = [
    path("ws/notifications/", NotificationConsumer.as_asgi()),
    path("ws/like-notifications/", LikeNotification.as_asgi()),
    path("ws/dislike-notifications/", LikeNotification.as_asgi()),
]

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
    }
)
