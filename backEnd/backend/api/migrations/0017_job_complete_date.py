# Generated by Django 5.1.6 on 2025-05-16 23:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_job_is_applied_to_balance_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='job',
            name='complete_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
