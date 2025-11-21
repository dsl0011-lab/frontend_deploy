# backend/proyecto/api/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UsuarioPersonalizado


class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(read_only=True)  # se devuelve, pero NO se acepta

    class Meta:
        model = UsuarioPersonalizado
        fields = ("username", "email", "first_name", "last_name", "password", "gender", "role")
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},   # cambia a False si no quieres obligarlo
        }
    def create(self, validated_data):
        validated_data.pop("role", None)  # ignora cualquier intento de colar role
        password = validated_data.pop("password")
        user = UsuarioPersonalizado(**validated_data)
        user.role = UsuarioPersonalizado.Role.STUDENT  # <- fuerza "S"
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs.get("username"), password=attrs.get("password"))
        if not user:
            raise serializers.ValidationError("Credenciales inválidas.")
        attrs["user"] = user
        return attrs

class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioPersonalizado
        fields = ["id", "username", "first_name", "last_name", "gender", "role"]


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = getattr(user, "role", None)
        token["username"] = user.username
        token["id"] = user.id
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({
            "role": getattr(self.user, "role", None),
            "username": self.user.username,
            "gender": self.user.gender
        })
        return data


class UsuarioPersonalizadoSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8, allow_blank=False)

    class Meta:
        model = UsuarioPersonalizado
        fields = [
            "id", "username", "first_name", "last_name",
            "email", "role", "password", "gender",
            "is_active", "last_login", "date_joined",
        ]
        read_only_fields = ["id", "last_login", "date_joined", "role"]
        extra_kwargs = {
            "email": {"required": False},
            "username": {"required": False},
        }

    def _is_admin(self):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        # Usa SIEMPRE el enum (tu "ADMIN" es "A")
        return bool(user and (user.is_superuser or getattr(user, "role", None) == UsuarioPersonalizado.Role.ADMIN))

    def create(self, validated_data):
        password = validated_data.pop("password", None)

        # Bloqueo extra por si te entran role/is_active
        if (("role" in validated_data) or ("is_active" in validated_data)) and not self._is_admin():
            raise serializers.ValidationError({"detail": "Solo ADMIN puede asignar rol o activar/desactivar usuarios."})

        user = UsuarioPersonalizado(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        # Cambios de role/is_active solo admin
        if (("role" in validated_data) or ("is_active" in validated_data)) and not self._is_admin():
            raise serializers.ValidationError({"detail": "Solo ADMIN puede cambiar rol o estado del usuario."})

        # Si quieres obligar a usar SIEMPRE el endpoint set-role incluso para superuser, descomenta:
        # validated_data.pop("role", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["role_label"] = instance.get_role_display()  # "Administrador", "Profesor", "Alumno"
        return data


