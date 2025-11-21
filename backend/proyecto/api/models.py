from django.contrib.auth.models import AbstractUser
from django.db import models

class UsuarioPersonalizado(AbstractUser):
    """
    Modelo de usuario personalizado extendiendo AbstractUser.
    """
    email = models.EmailField(unique=True, null=True, blank=True)

    #roles
    class Role(models.TextChoices):
        ADMIN = "A", "Administrador"
        TEACHER = "T", "Profesor"
        STUDENT = "S", "Alumno"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT
    )

    class Gender(models.TextChoices):
        Male = "M", "masculino"
        Female = "F", "femenino"

    gender = models.CharField(
        max_length=20,
        choices=Gender.choices,
        blank=True
    )
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

