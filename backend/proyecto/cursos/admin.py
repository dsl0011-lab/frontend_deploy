from django.contrib import admin
from .models import Curso, Matricula, Tarea, Entrega, Calificacion, Tutoria

@admin.register(Curso)
class CursoAdmin(admin.ModelAdmin):
    list_display = ('id','nombre','profesor','creado_en')
    search_fields = ('nombre','profesor__username')

admin.site.register(Matricula)
admin.site.register(Tarea)
admin.site.register(Entrega)
admin.site.register(Calificacion)
admin.site.register(Tutoria)
