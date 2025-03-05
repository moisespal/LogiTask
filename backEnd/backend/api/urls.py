from django.urls import path
from . import views


urlpatterns = [
    path("clients/delete/<int:pk>/", views.ClientDelete.as_view(),name="client-note"),
    path("properties/", views.PropertyListCreate.as_view(), name="property-list-create"),
    path("clients/", views.ClientListCreate.as_view(), name="client-list"),
    path("clientPropertySetUp/", views.ClientScheduleSetUp.as_view(), name="client-property-schedule"),
]