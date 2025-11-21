# backend/proyecto/api/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UsuarioPersonalizado

@admin.register(UsuarioPersonalizado)
class UsuarioPersonalizadoAdmin(UserAdmin):
    list_display = ("username", "email", "role", "is_staff", "is_superuser")
    list_filter = ("role", "is_staff", "is_superuser")
    fieldsets = UserAdmin.fieldsets + (
        ("Rol", {"fields": ("role",)}),
    )

    def get_readonly_fields(self, request, obj=None):
        base = super().get_readonly_fields(request, obj)
        if not request.user.is_superuser:
            return base + ("role",)
        return base

