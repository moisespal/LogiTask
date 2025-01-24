from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Client, Property

class userSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only":True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ["id","firstName", "lastName", "phoneNumber","email"]
        extra_kwargs = {
            "created_at": {"read_only":True}
        }

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ["id","street", "city", "state","zipCode"]
       
