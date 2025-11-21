from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/profesor/', include('cursos.urls')),
    path('api/estudiante/', include('estudiante.urls')),
    path('api/mensajeria/', include('mensajeria.urls')),
]
