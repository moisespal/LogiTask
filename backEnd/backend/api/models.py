from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
import pytz


# Create your models here.
class userProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    timezone = models.CharField(max_length=100, default='UTC')
class Company(models.Model):
    companyName = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    def save(self, *args, **kwargs):
        if self.logo:
            try:
                img = Image.open(self.logo)
                img.thumbnail((400, 400))
                buffer = BytesIO()
                img.save(buffer, format='PNG', quality=80, optimize=True)
                buffer.seek(0)
                self.logo.save(self.logo.name, ContentFile(buffer.getvalue()), save=False)
            except Exception as e:
                print("error processing image", e)
        super().save(*args, **kwargs)

class Client(models.Model):
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    phoneNumber = models.CharField(max_length=15)
    email = models.EmailField(max_length=254, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    author  = models.ForeignKey(User, on_delete=models.CASCADE, related_name="clients")

    def __str__(self):
        return self.firstName
    

class Property(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="properties")
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2, default="TX")
    zipCode = models.CharField(max_length=5)   

    def __str__(self):
        return self.street

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title



class Schedule(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="schedules")
    frequency = models.CharField(max_length=50)
    nextDate = models.DateField(null=False,blank=False)
    endDate = models.DateField(null=True,blank=True)
    service = models.CharField(max_length=50)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    isActive = models.BooleanField(default=True)
    
    @classmethod
    def generate_jobs(cls, user):
        try:
            profile = userProfile.objects.get(user=user)
            user_timezone = pytz.timezone(profile.timezone)
        except (userProfile.DoesNotExist, pytz.exceptions.UnknownTimeZoneError):
            user_timezone = pytz.UTC

        # Get current UTC time and convert to user's timezone
        utc_now = timezone.now()
        local_now = utc_now.astimezone(user_timezone)
        today_in_user_tz = local_now.date()

        schedules = cls.objects.filter(
            nextDate=today_in_user_tz,
            isActive=True,
            property__client__author=user  # Only get schedules for this user
        )

        for schedule in schedules:
            Job.objects.create(schedule=schedule, cost=schedule.cost, jobDate=schedule.nextDate, client=schedule.property.client)
            if schedule.endDate and schedule.nextDate > schedule.endDate:
                schedule.isActive = False
                schedule.save()
                continue
            else:
                if schedule.frequency.lower() == "daily":
                    schedule.nextDate += timedelta(days=1)
                elif schedule.frequency.lower() == "weekly":
                    schedule.nextDate += timedelta(weeks=1)
                elif schedule.frequency.lower() == "biweekly":
                    schedule.nextDate += timedelta(weeks=2)
                elif schedule.frequency.lower() == "once":
                    schedule.isActive = False
            schedule.save()

    def __str__(self):
        return f"{self.service} - {self.nextDate}"

class Job(models.Model):
    STATUS_CHOICES = [
        ('complete', 'Complete'),
        ('uncomplete', 'Uncomplete'),
    ]
    schedule = models.ForeignKey(Schedule,on_delete=models.SET_NULL,null=True)
    client = models.ForeignKey(Client,on_delete=models.CASCADE)
    jobDate = models.DateField(null=False,blank=False)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='uncomplete')
    cost = models.DecimalField(max_digits=10,decimal_places=2)

class Payment(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10,decimal_places=2)
    paymentType = models.CharField(max_length=50,default='cash')
    paymentDate = models.DateField(auto_now_add=True)
