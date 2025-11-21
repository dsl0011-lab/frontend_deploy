from django.conf import settings
from django.db import models
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class Curso(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    profesor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cursos_impartidos")
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} - {self.profesor}"


class Matricula(models.Model):
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name="matriculas")
    alumno = models.ForeignKey(User, on_delete=models.CASCADE, related_name="matriculas")
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("curso", "alumno")

    def __str__(self):
        return f"{self.alumno} @ {self.curso}"


class Tarea(models.Model):
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name="tareas")
    titulo = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    fecha_entrega = models.DateTimeField(null=True, blank=True)
    publicado = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} ({self.curso})"


class Entrega(models.Model):
    tarea = models.ForeignKey(Tarea, on_delete=models.CASCADE, related_name="entregas")
    alumno = models.ForeignKey(User, on_delete=models.CASCADE, related_name="entregas")
    texto = models.TextField(blank=True)
    archivo = models.FileField(upload_to="entregas/", blank=True, null=True)
    enviada_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("tarea", "alumno")

    def __str__(self):
        return f"Entrega {self.alumno} - {self.tarea}"


class Calificacion(models.Model):
    entrega = models.OneToOneField(Entrega, on_delete=models.CASCADE, related_name="calificacion")
    nota = models.DecimalField(max_digits=5, decimal_places=2)
    feedback = models.TextField(blank=True)
    calificada_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Calificacion {self.entrega}: {self.nota}"


class Tutoria(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente"
        CONFIRMADA = "confirmada", "Confirmada"
        COMPLETADA = "completada", "Completada"
        CANCELADA = "cancelada", "Cancelada"

    profesor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tutorias_impartidas",
    )
    alumno = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tutorias_recibidas",
    )
    asignatura = models.CharField(max_length=150)
    fecha = models.DateTimeField(default=timezone.now)
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
    )
    notas = models.TextField(blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-fecha"]

    def __str__(self):
        return f"Tutoria {self.asignatura} - {self.profesor} / {self.alumno}"
