from rest_framework import serializers
from .models import UsuarioPersonalizado
<<<<<<< Updated upstream
=======
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RegistroSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = UsuarioPersonalizado
        fields = ("first_name", "last_name", "email", "password", "rol", "gender")
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = UsuarioPersonalizado(**validated_data)
        user.set_password(password)
        user.save()
        return user
    


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs.get("email"), password=attrs.get("password"))
        if not user:
            raise serializers.ValidationError("Credenciales inválidas.")
        attrs["user"] = user
        return attrs
    

class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioPersonalizado
        fields = ("id", "username", "email", "full_name")


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = getattr(user, "role", None)
        token["username"] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["role"] = getattr(self.user, "role", None)
        data["username"] = self.user.username
        return data
    
>>>>>>> Stashed changes

class UsuarioPersonalizadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioPersonalizado
        fields = '__all__'
        extra_kwargs = {
            'contraseña': {'write_only': True}  # (Para que la contraseña no se devuelva en las respuestas)
        }
