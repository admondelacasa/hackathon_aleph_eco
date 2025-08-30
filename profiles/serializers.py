from rest_framework import serializers
from .models import User, Service, ContractorProfile, ClientProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name', 'description']

class ContractorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) # Nested serializer for user details
    services = ServiceSerializer(many=True, read_only=True) # Nested serializer for services

    class Meta:
        model = ContractorProfile
        fields = ['id', 'user', 'bio', 'location', 'hourly_rate', 'services', 'portfolio_link']

class ClientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) # Nested serializer for user details

    class Meta:
        model = ClientProfile
        fields = ['id', 'user', 'company_name', 'contact_phone', 'location']