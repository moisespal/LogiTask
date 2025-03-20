from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Client, Property,Schedule,Job

class userSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only":True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ["id", "street", "city", "state", "zipCode"]

class ClientSerializer(serializers.ModelSerializer):
    properties = PropertySerializer(many=True, read_only=True)
    class Meta:
        model = Client
        fields = ["id", "firstName", "lastName", "phoneNumber", "email", "properties"]
        extra_kwargs = {
            "created_at": {"read_only":True}
        }

class ScheduleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Schedule
        fields = ["id", "frequency","nextDate","service","cost"]

class PropertyAndSchedule(serializers.ModelSerializer):
    schedules = ScheduleSerializer(many=True)

    class Meta:
        model = Property
        fields = ["id","street", "city", "state","zipCode","schedules"]

class ClientPropertySetUpSerializer(serializers.ModelSerializer):
    properties = PropertyAndSchedule(many=True)
    
    class Meta:
        model = Client
        fields = ["id","firstName", "lastName", "phoneNumber","email","properties"]
    
    def create(self, validated_data):
        properties_data = validated_data.pop('properties',[])
        author = validated_data.pop('author', None)
        client = Client.objects.create(author=author,**validated_data)
        
        for property_data in properties_data:
            try:
                schedules_data = property_data.pop('schedules', [])
                property_instance = Property.objects.create(client=client, **property_data)
                for schedule_data in schedules_data:
                    Schedule.objects.create(property=property_instance ,**schedule_data)
            except Exception as e:
                client.delete()
                raise serializers.ValidationError(f"Error Creating Property or Schedule")
        
        return client

class OnlyClientSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Client
        fields = ["id", "firstName", "lastName", "phoneNumber", "email"]
        extra_kwargs = {
            "created_at": {"read_only":True}
        }


class JobSerializer(serializers.ModelSerializer):
    property = PropertySerializer()
    schedule = ScheduleSerializer()
    client = OnlyClientSerializer()

    class Meta:
        model = Job
        fields = ['id', 'jobDate', 'status','cost','property','schedule','client']



class PropertyAndScheduleSetUp(serializers.ModelSerializer):
    schedules = ScheduleSerializer(many=True)
    clientId = serializers.IntegerField(write_only=True)
    class Meta:
        model = Property
        fields = ["id","street", "city", "state","zipCode","clientId","schedules"]
    
    def create(self, validated_data):
        schedules_data = validated_data.pop('schedules', [])
        client_id = validated_data.pop('clientId')
        
        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            raise serializers.ValidationError({"client_id": "Invalid client ID"})
        
        property_instance = Property.objects.create(client=client,**validated_data)
        
        for schedule_data in schedules_data:
            Schedule.objects.create(property=property_instance, **schedule_data)
        return property_instance