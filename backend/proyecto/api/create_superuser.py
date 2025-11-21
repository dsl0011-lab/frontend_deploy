# backend/proyecto/api/create_superuser.py
from django.contrib.auth import get_user_model

def run():
    """
    Crea un superusuario por defecto si no existe.
    Ejecutar con:
        python manage.py shell < api/create_superuser.py
    """
    User = get_user_model()

    # Comprobar si ya existe
    if not User.objects.filter(username="admin").exists():
        user = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="admin12345",
            full_name="Administrador Principal",
            gender="M",
            role=User.Role.ADMIN,
        )
        print(" Superusuario 'admin' creado correctamente.")
        print("   Usuario: admin")
        print("   Contraseña: admin12345")
        print("   Rol: ADMIN")
    else:
        print("  El superusuario 'admin' ya existe, no se ha modificado.")
