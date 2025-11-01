from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsTeacherOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ('T', 'A') # Teacher or Admin

class IsOwnerTeacherOrAdmin(BasePermission):
    """
    Para objetos ligados a un curso: solo el profesor dueño del curso o admin.
    """
def has_object_permission(self, request, view, obj):
    if request.user.role == 'A':
        return True
    # Si obj ya es un Curso
    if hasattr(obj, 'profesor_id'):
        return obj.profesor_id == request.user.id
    # Si obj es Tarea
    curso = getattr(obj, 'curso', None)
    if curso is None and hasattr(obj, 'tarea'):
        curso = obj.tarea.curso
    # Si obj es Entrega
    if curso is None and hasattr(obj, 'entrega'):
        curso = obj.entrega.tarea.curso
    return curso and curso.profesor_id == request.user.id
