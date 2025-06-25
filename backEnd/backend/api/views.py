from django.shortcuts import render,get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics, status
from .serializers import ClientSerializer, userSerializer, PropertySerializer, ClientPropertySetUpSerializer, JobSerializer ,PropertyAndScheduleSetUp, ScheduleSerializer ,PaymentSerializer,CompanySerializer,ScheduleJobsSerializer,PropertyServiceInfoSerializer, BalanceSerializer,BalanceHistorySerializer,BalanceAdjustmentSerializer,UserProfileSerializer,JobInfoSerializer,JobOnlySerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Client, Property, Schedule, Job,Payment,Company,userProfile, Balance, BalanceHistory,BalanceAdjustment
from rest_framework.generics import ListAPIView,UpdateAPIView
from django.http import JsonResponse
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
import pandas as pd
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
import pytz
from django.utils import timezone
from django.db.models import Prefetch
from django.db.models.functions import Lower
from django.db.models import Sum
from decimal import Decimal
from collections import defaultdict




# Create your views here.

class ClientListCreate(generics.ListCreateAPIView):
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

    #retrive notes
    def get_queryset(self):
        user = self.request.user
        return Client.objects.filter(author=user)
    
    #creating note
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)
    

class ClientDelete(generics.DestroyAPIView):
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Client.objects.filter(author=user)
    

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = userSerializer
    permission_classes = [AllowAny]

class PropertyListCreate(generics.ListCreateAPIView):
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Property.objects.filter(client__author=self.request.user)
        
    def perform_create(self, serializer):
        client_id = self.request.data.get("clientId")
        if serializer.is_valid ():
            client = Client.objects.get(id=client_id,author=self.request.user)
            serializer.save(client=client)
        else:
            print(serializer.errors)

class ClientScheduleSetUp(generics.ListCreateAPIView):
    serializer_class = ClientPropertySetUpSerializer
    permission_classes = [IsAuthenticated]
    queryset = Client.objects.all()
   
    
    def perform_create(self, serializer):
        
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generateTodaysJobs(request):
   Schedule.generate_jobs(request.user)
   return JsonResponse({"message": "Jobs generated successfully"}, status=200)


class GetTodaysJobs(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobSerializer
    
    def get_queryset(self):
        profile = userProfile.objects.get(user=self.request.user)
        user_timezone = profile.timezone
        try:
            user_timezone = pytz.timezone(user_timezone)
        except pytz.exceptions.UnknownTimeZoneError:
            user_timezone = pytz.UTC
        utc_now = timezone.now()
        local_now = utc_now.astimezone(user_timezone)
        today_in_user_tz = local_now.date()
        
        return Job.objects.filter(
            jobDate=today_in_user_tz,
            client__author=self.request.user
        )

class PropertyListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PropertyAndScheduleSetUp
    queryset = Property.objects.all()



class UpdateSchedule(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobSerializer
    queryset = Job.objects.all()
    
    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

class UploadExcelView(APIView):
    parser_classes = [MultiPartParser]  # Allows file uploads

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return JsonResponse({"error": "No file uploaded"}, status=400)

        try:
            df = pd.read_excel(file)  # Read Excel file
            for _, row in df.iterrows():
                client = Client.objects.create(
                    firstName=row['firstName'],
                    lastName=row['lastName'],  # Change column names based on Excel file
                    email=row['email'],
                    phoneNumber=row['phoneNumber'],
                    author=self.request.user
                )
                property_obj = Property.objects.create(
                    street=row['street'],
                    city=row['city'],
                    state=row['state'],
                    zipCode=row['zipCode'],
                    client=client
                ) 
                Schedule.objects.create(
                    property=property_obj,
                    frequency=row['frequency'],
                    nextDate=row['nextDate'],
                    service=row['service'],
                    cost=row['cost']
                )


            return JsonResponse({"message": "Clients uploaded successfully"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

class PaymentListCreate(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Payment.objects.all()
        client_id = self.requeste.query_params.get("client_id")
        if client_id:
            queryset = Payment.filter(client=client_id)
        return queryset
        
    def perform_create(self, serializer):
        client_id = self.request.data.get("client_id")

        if client_id:
            client = Client.objects.get(id=client_id)
            serializer.save(client=client)
        else:
            print(serializer.errors)

class CompanyListCreate(generics.ListCreateAPIView):
    permission_classes=[IsAuthenticated]
    serializer_class = CompanySerializer

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(user=self.request.user)
        else:
            print(serializer)
    
    def get_queryset(self):
        return Company.objects.filter(user=self.request.user)

class CompanyUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CompanySerializer
    queryset = Company.objects.all()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_timezone(request):
    timezone = request.data.get('timezone')
    profile, created = userProfile.objects.get_or_create(user=request.user)
    profile.timezone = timezone
    profile.save()
    return Response({'status': 'success', 'timezone': timezone})

class ScheduleJobsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ScheduleJobsSerializer

    def get_queryset(self):
        property_id = self.request.query_params.get("property_id")
        if not property_id:
            return Schedule.objects.none()

        # Get all Jobs related to Schedules under this property
        jobs_queryset = Job.objects.filter(schedule__property_id=property_id)

        # Prefetch these Jobs and attach them to their Schedules
        return Schedule.objects.filter(
            property_id=property_id
        ).prefetch_related(
            Prefetch('job_set', queryset=jobs_queryset, to_attr='jobs')
        )

class PropertyServiceInfoView(ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        client_id = request.query_params.get("client_id")
        if not client_id:
            return Response({"error": "client_id is required"}, status=400)

        # Get all properties for this client
        properties = Property.objects.filter(client_id=client_id).prefetch_related(
            'schedules__job_set'
        )

        # Get all payments for this client
        payments = Payment.objects.filter(client_id=client_id)

        # Serialize both
        property_data = PropertyServiceInfoSerializer(properties, many=True).data
        payment_data = PaymentSerializer(payments, many=True).data

        return Response({
            "properties": property_data,
            "payments": payment_data
        })
    
class ScheduleCreate(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ScheduleSerializer
        
    
    
    def perform_create(self, serializer):
        property_id =  self.request.data.get('property_id')
        if property_id:
            property_obj = Property.objects.get(id=property_id)
            serializer.save(property= property_obj)
        else:
            print(serializer.errors)

class update_balance_view(ListAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        client_id = request.query_params.get("client_id")
        if not client_id:
            return Response({"error": "client_id is required"}, status=400)

        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)


        #get balance table
        balance= Balance.objects.get(client=client)

        #recalculate
        balance.recalculate_balance()
        
        serializer = BalanceSerializer(balance)
        return Response(serializer.data)

#needs to be fixed

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unique_jobs(request):
    jobs = Schedule.objects \
        .filter(property__client__author=request.user) \
        .annotate(lower_service=Lower('service')) \
        .values_list('lower_service', flat=True) \
        .distinct()

    return Response(jobs)

class UpdateScheduleStatus(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ScheduleSerializer
    queryset = Schedule.objects.all()
    

# views.py (DRF ViewSet or APIView)
class ClientLedgerAPIView(APIView):
    def get(self, request, client_id):
        history = BalanceHistory.objects.filter(balance__client_id=client_id)
        serializer = BalanceHistorySerializer(history, many=True)
        return Response(serializer.data)

class estimated_balance_view(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request , client_id):
        if not client_id:
            return Response({"error": "client_id is required"}, status=400)

        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)


        #get balance table
        balance, _ = Balance.objects.get_or_create(client=client)

        #recalculate
        estimated_balance = balance.calculate_estimated_balace()
       
        
        serializer = BalanceSerializer(balance)
        data = serializer.data
        data['estimated_balance'] = str(estimated_balance)  
        return Response(data)

class GetUserProfile(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = userProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except userProfile.DoesNotExist:
            return Response({"detail": "User profile not found."}, status=status.HTTP_404_NOT_FOUND)

class GetUnappliedObjects(APIView):
    permission_classes = [IsAuthenticated]
        
    def get(self,request, client_id):
        if not client_id:
            return Response({"error": "client_id is required"}, status=400)

        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
        
        unapplied_jobs = Job.objects.filter(client=client, is_applied_to_balance=False, status='complete').select_related('schedule__property')
        unapplied_payments = Payment.objects.filter(client=client, is_applied_to_balance=False)
        unapplied_adjustments = BalanceAdjustment.objects.filter(client=client, is_applied_to_balance=False)

        total_jobs = unapplied_jobs.aggregate(Sum("cost"))["cost__sum"] or 0
        total_payments = unapplied_payments.aggregate(Sum("amount"))["amount__sum"] or 0
        total_adjustments = unapplied_adjustments.aggregate(Sum("amount"))["amount__sum"] or 0
            
        total_jobs = Decimal(total_jobs)
        total_payments = Decimal(total_payments)
        total_adjustments= Decimal(total_adjustments)

        delta = total_payments - total_jobs + total_adjustments


        grouped = defaultdict(lambda: defaultdict(list))  # {property: {schedule: [jobs]}}

        for job in unapplied_jobs:
            prop = job.schedule.property
            sched = job.schedule
            grouped[prop][sched].append(job)

        final_data = []

        for prop, schedules_dict in grouped.items():
            property_data = PropertySerializer(prop).data
            schedules_data = []

            for schedule, jobs in schedules_dict.items():
                schedule_data = ScheduleSerializer(schedule).data
                schedule_data['jobs'] = JobOnlySerializer(jobs, many=True).data
                schedules_data.append(schedule_data)

            final_data.append({
                'property': property_data,
                'schedules': schedules_data
            })


        #jobs_data = JobInfoSerializer(unapplied_jobs,many=True).data
        payments_data =  PaymentSerializer(unapplied_payments,many=True).data
        adjustments_data = BalanceAdjustmentSerializer(unapplied_adjustments, many=True).data

        return Response({
            "unapplied_jobs": final_data,
            "unapplied_payments": payments_data,
            "unapplied_adjustments": adjustments_data,
            "delta": str(delta)  # Use str to avoid JSON serialization errors with Decimal
        })

class JobDelete(generics.DestroyAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Job.objects.filter(client__author=user)