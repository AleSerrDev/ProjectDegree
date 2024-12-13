# Usa una imagen base oficial de Python
FROM python:3.9-slim

# Establecer el directorio de trabajo
WORKDIR /main

# Copiar los archivos de requerimientos y el script
COPY requirements.txt requirements.txt
COPY main.py main.py

# Instalar las dependencias


# Exponer el puerto en el que correrá la aplicación
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
