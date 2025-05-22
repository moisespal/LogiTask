from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import *


class Command(BaseCommand):
    help = "Generates jobs for the day"

    def handle(self, *args, **kwargs):
        Schedule.generate_jobs()
        self.stdout.write(self.style.SUCCESS("Jobs generated for all users"))