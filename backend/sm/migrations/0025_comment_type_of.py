# Generated by Django 5.1 on 2024-08-24 21:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sm', '0024_remove_comment_parent'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='type_of',
            field=models.CharField(default=1, max_length=20),
            preserve_default=False,
        ),
    ]
