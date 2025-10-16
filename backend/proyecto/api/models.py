from django.db import models
from django.contrib.auth.hashers import make_password

class UsuarioPersonalizado(models.Model):
    GENEROS = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    ]

    #roles
    class rol(models.TextChoices):
        ADMIN = "A", "Administrador"
        TEACHER = "P", "Profesor"
        STUDENT = "E", "Estudiante"

    rol = models.CharField(
        max_length=20,
        choices=rol.choices,
        default=rol.STUDENT
    )

    #genero
    class gender(models.TextChoices):
        MALE = "M", "Masculino"
        FEMALE = "F", "Femenino"

    def __str__(self):
        return f"{self.name} {self.last_name} ({self.role})"

>>>>>>> Stashed changes
