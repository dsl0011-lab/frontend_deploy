from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioPersonalizadoViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioPersonalizadoViewSet, basename='usuario')

urlpatterns = [
    path('', include(router.urls)),
]
