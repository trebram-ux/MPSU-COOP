# Generated by Django 4.2.1 on 2025-01-24 05:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mcoop_app', '0007_alter_paymentschedule_options_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='loan',
            name='control_number',
            field=models.CharField(default='3b038', max_length=5, primary_key=True, serialize=False, unique=True),
        ),
    ]
