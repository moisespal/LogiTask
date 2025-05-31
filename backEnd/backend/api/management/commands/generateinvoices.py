from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import *


class Command(BaseCommand):
    help = "Generates monthly invoices for all clients"

    def handle(self, *args, **options):
        today = timezone.now().date()
        balances = Balance.objects.select_related('client').all()
        updated = 0

        for balance in balances:
            before = balance.current_balance
            after = balance.recalculate_balance()

            if after != before:
                updated += 1
                self.stdout.write(self.style.NOTICE(
                    f"{balance.client} balance changed: {before} → {after}"
                ))

        self.stdout.write(self.style.SUCCESS(
            f"{updated} balances updated on {today}"
        ))
        