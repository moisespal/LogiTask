from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now
from datetime import timedelta, datetime


# Create your models here.
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
    def generate_jobs(cls):
        today = now().date()
        schedules = cls.objects.filter(nextDate=today, isActive=True)

        
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
