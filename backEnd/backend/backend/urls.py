from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="getToken"),
    path("api/token/refresh/", TokenRefreshView.as_view(),name="refresh"),
    path("api-auth", include("rest_framework.urls")),
    path("api/", include("api.urls")),


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
