from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import ClientSerializer, userSerializer, PropertySerializer, ClientPropertySetUpSerializer, JobSerializer ,PropertyAndScheduleSetUp, ScheduleSerializer ,PaymentSerializer,CompanySerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Client, Property, Schedule, Job,Payment,Company,userProfile
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
