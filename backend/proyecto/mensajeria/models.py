from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL


class Conversacion(models.Model):
    asunto = models.CharField(max_length=255, blank=True)
    participantes = models.ManyToManyField(User, related_name='conversaciones')
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.asunto or f"Conversación #{self.pk}"


class Mensaje(models.Model):
    conversacion = models.ForeignKey(Conversacion, on_delete=models.CASCADE, related_name='mensajes')
    autor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mensajes_enviados')
    texto = models.TextField()
    creado_en = models.DateTimeField(auto_now_add=True)
    leido_por = models.ManyToManyField(User, related_name='mensajes_leidos', blank=True)

    class Meta:
        ordering = ['creado_en']

    def __str__(self):
        return f"Msg {self.autor}: {self.texto[:30]}"
