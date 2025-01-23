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
        extra_kwargs = {"firstName": {"read_only":True},
                        "lastName": {"read_only":True},
                        "phoneNumber": {"read_only":True},
                        "email": {"read_only":True},
                        "created_at": {"read_only":True}
                    }

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ["id","street", "city", "state","zipCode"]
        extra_kwargs = {"client": {"read_only":True},
                        "street": {"read_only":True},
                        "city": {"read_only":True},
                        "state": {"read_only":True},
                        "zipCode": {"read_only":True}
                    }
