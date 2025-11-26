from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from cursos.models import Curso

User = settings.AUTH_USER_MODEL

class TipoEvaluacion(models.TextChoices):
    EXAMEN = 'EXAMEN', 'Examen'
    PROYECTO = 'PROYECTO', 'Proyecto'
    PRACTICA = 'PRACTICA', 'Práctica'
    PARTICIPACION = 'PARTICIPACION', 'Participación'


class NotaAcademica(models.Model):
    """Modelo para calificaciones generales (exámenes, proyectos, etc.)"""
    estudiante = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='notas_academicas'
    )
    curso = models.ForeignKey(
        Curso, 
        on_delete=models.CASCADE, 
        related_name='notas_academicas'
    )
    profesor = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='notas_asignadas'
    )
    
    tipo_evaluacion = models.CharField(
        max_length=20,
        choices=TipoEvaluacion.choices,
        default=TipoEvaluacion.EXAMEN
    )
    
    nombre_evaluacion = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    
    nota = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        help_text="Nota del 0 al 10"
    )
    
    porcentaje = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=100.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Porcentaje que representa en la nota final"
    )
    
    fecha_evaluacion = models.DateField()
    fecha_registro = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
    
    observaciones = models.TextField(blank=True, null=True)
    visible_estudiante = models.BooleanField(default=True)

    class Meta:
        ordering = ['-fecha_evaluacion']
        verbose_name = 'Nota Académica'
        verbose_name_plural = 'Notas Académicas'
        indexes = [
            models.Index(fields=['estudiante', 'curso']),
            models.Index(fields=['fecha_evaluacion']),
        ]

    def __str__(self):
        return f"{self.estudiante.username} - {self.curso.nombre} - {self.nombre_evaluacion}: {self.nota}"

    @property
    def calificacion_texto(self):
        """Devuelve la calificación en texto según la nota"""
        if self.nota < 5.0:
            return "Suspenso"
        elif self.nota < 6.0:
            return "Aprobado"
        elif self.nota < 7.0:
            return "Bien"
        elif self.nota < 9.0:
            return "Notable"
        else:
            return "Sobresaliente"


class Asistencia(models.Model):
    """Modelo para control de asistencias"""
    estudiante = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='asistencias'
    )
    curso = models.ForeignKey(
        Curso, 
        on_delete=models.CASCADE, 
        related_name='asistencias'
    )
    profesor = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='asistencias_registradas'
    )
    
    fecha = models.DateField()
    presente = models.BooleanField(default=True)
    justificada = models.BooleanField(default=False)
    observaciones = models.TextField(blank=True, null=True)
    
    fecha_registro = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha']
        verbose_name = 'Asistencia'
        verbose_name_plural = 'Asistencias'
        unique_together = ['estudiante', 'curso', 'fecha']
        indexes = [
            models.Index(fields=['estudiante', 'curso', 'fecha']),
        ]

    def __str__(self):
        estado = "Presente" if self.presente else ("Falta Justificada" if self.justificada else "Falta")
        return f"{self.estudiante.username} - {self.curso.nombre} - {self.fecha}: {estado}"


class EventoExamen(models.Model):
    """
    Evento de examen para mostrar en calendarios (independiente de la nota).
    """
    curso = models.ForeignKey(
        Curso,
        on_delete=models.CASCADE,
        related_name="eventos_examen",
    )
    profesor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="eventos_examen_creados",
    )
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    fecha_examen = models.DateTimeField()
    visible_estudiantes = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["fecha_examen"]
        indexes = [
            models.Index(fields=["curso", "fecha_examen"]),
        ]

    def __str__(self) -> str:
        return f"Examen {self.titulo} - {self.curso.nombre} ({self.fecha_examen})"
