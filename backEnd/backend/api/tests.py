from django.test import TestCase, RequestFactory
from rest_framework.exceptions import ValidationError
from .models import Client, Property, Schedule
from .serializers import ClientPropertySetUpSerializer
from django.contrib.auth.models import User

class ClientPropertySetUpSerializerTest(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(username="testuser", password="testpass")

        # Sample client data
        self.client_data = {
            "firstName": "John",
            "lastName": "Doe",
            "phoneNumber": "1234567890",
            "email": "john.doe@example.com",
            "property": [
                {
                    "street": "123 Main St",
                    "city": "Anytown",
                    "state": "CA",
                    "zipCode": "12345",
                    "schedule": {
                        "frequency": "weekly",
                        "nextDate": "2023-10-01",
                        "service": "cleaning",
                        "cost": 100.00,
                    },
                }
            ],
        }

    def test_valid_data(self):
        """Test if valid data creates the Client, Property, and Schedule properly."""
        serializer = ClientPropertySetUpSerializer(data=self.client_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)  # Ensure it's valid

        # Save the data with the test user as the author
        client = serializer.save(author=self.user)  
        
        # Verify database entries
        self.assertEqual(Client.objects.count(), 1)
        self.assertEqual(Property.objects.count(), 1)
        self.assertEqual(Schedule.objects.count(), 1)

        # Verify data correctness
        self.assertEqual(client.firstName, "John")
        property_instance = client.properties.first()
        self.assertEqual(property_instance.street, "123 Main St")
        self.assertEqual(property_instance.schedules.first().frequency, "weekly")

    def test_invalid_data(self):
        """Test validation failure when required fields are missing."""
        invalid_data = self.client_data.copy()
        invalid_data["firstName"] = ""  # Missing firstName

        serializer = ClientPropertySetUpSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("firstName", serializer.errors)

    def test_nested_invalid_data(self):
        """Test validation failure for nested property/schedule data."""
        invalid_data = self.client_data.copy()
        invalid_data["property"][0]["schedule"]["frequency"] = ""  # Invalid frequency

        serializer = ClientPropertySetUpSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())

        # Ensure the error is in the correct nested path
        self.assertIn("property", serializer.errors)
        self.assertIn("schedule", serializer.errors["property"][0])
        self.assertIn("frequency", serializer.errors["property"][0]["schedule"])
