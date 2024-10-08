# Generated by Django 5.1 on 2024-08-11 12:52

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sm', '0013_friend_accepted_at_friend_created_at_friend_user_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='FriendAccepted',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('friend', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_requests', to='sm.friend')),
            ],
        ),
    ]
