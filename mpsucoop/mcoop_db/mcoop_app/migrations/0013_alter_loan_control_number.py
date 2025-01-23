# Generated by Django 4.2.1 on 2025-01-23 03:58

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('mcoop_app', '0012_remove_loan_co_make_remove_loan_relationships_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='loan',
            name='control_number',
            field=models.CharField(default=uuid.uuid4, max_length=5, primary_key=True, serialize=False, unique=True),
        ),
    ]
