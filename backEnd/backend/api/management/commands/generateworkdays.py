from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import *




class Command(BaseCommand):
    help = "Adjust work days for all schedule objects"

    def handle(self, *args, **kwargs):
        schedules = Schedule.objects.all()
        updated = 0

        for schedule in schedules:
            schedule.save()
            updated += 1
        self.stdout.write(self.style.SUCCESS(f"Updated {updated} schedules."))