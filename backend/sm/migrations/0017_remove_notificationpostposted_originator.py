# Generated by Django 5.1 on 2024-08-11 18:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sm', '0016_remove_notification_text_remove_notification_user_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='notificationpostposted',
            name='originator',
        ),
    ]
