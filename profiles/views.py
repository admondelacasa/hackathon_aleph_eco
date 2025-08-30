from rest_framework import viewsets
from .models import User, Service, ContractorProfile, ClientProfile
from .serializers import (
    UserSerializer,
    ServiceSerializer,
    ContractorProfileSerializer,
    ClientProfileSerializer
)

# Example: ViewSet for Services (Contractors offer these)
class ServiceViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows services to be viewed or edited.
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

# Example: ViewSet for Contractor Profiles
class ContractorProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows contractor profiles to be viewed or edited.
    """
    queryset = ContractorProfile.objects.all()
    serializer_class = ContractorProfileSerializer

# Example: ViewSet for Client Profiles
class ClientProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows client profiles to be viewed or edited.
    """
    queryset = ClientProfile.objects.all()
    serializer_class = ClientProfileSerializer

# We'll need more complex views for user registration, login,
# and specific actions like creating a job, applying to a job, etc.
# But these ModelViewSets give us basic CRUD (Create, Retrieve, Update, Delete)
# operations for our models.