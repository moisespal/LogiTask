from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import ClientSerializer, userSerializer, PropertySerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Client, Property
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
        return Property.objects.all()
    
    
    def perform_create(self, serializer):
        client_id = self.request.data.get("clientId")
        if serializer.is_valid ():
            client = Client.objects.get(id=client_id,author=self.request.user)
            serializer.save(client=client)
        else:
            print(serializer.errors)
    
   
        