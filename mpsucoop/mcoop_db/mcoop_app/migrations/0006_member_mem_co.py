# Generated by Django 5.1.4 on 2025-01-20 12:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mcoop_app', '0005_member_tin'),
    ]

    operations = [
        migrations.AddField(
            model_name='member',
            name='mem_co',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
