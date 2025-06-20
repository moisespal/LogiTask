# Generated by Django 5.1.6 on 2025-05-21 23:33

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_merge_20250521_1656'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='balance',
            name='balance_adjustment',
        ),
        migrations.CreateModel(
            name='BalanceAdjustment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('reason', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_applied_to_balance', models.BooleanField(default=False)),
                ('Client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='adjustments', to='api.client')),
            ],
        ),
        migrations.AddField(
            model_name='balancehistory',
            name='adjustments',
            field=models.ManyToManyField(to='api.balanceadjustment'),
        ),
    ]
