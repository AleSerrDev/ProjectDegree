# ProjectDegree

````md
# Guía de Instalación y Ejecución del Proyecto GalloSearch

A continuación, se describen los pasos necesarios para configurar y poner en marcha cada uno de los componentes del sistema.

## Requisitos Previos

- Docker: Instalado y configurado en la máquina.  
- Node.js y npm: Para el proyecto de la interfaz de usuario.  
- Python y pip: Para el servicio FastAPI.  
- .NET SDK: Para ejecutar los proyectos desarrollados en C#.  
- Git: Para clonar el repositorio.

## Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/SerranoAlejandroSelaya/Degree-project-GalloSearch.git
````

Estructura del repositorio:

* gallo-locator: Proyecto de la interfaz de usuario desarrollado en React.
* SerchMapServiceGatway: Proyecto del API Gateway.
* ElGalloWebApi: Servicio WebAPI desarrollado en C# para la gestión de datos.
* FastApiProject: Servicio desarrollado en Python usando FastAPI para la búsqueda inteligente.

## Paso 2: Configuración y Ejecución de los Servicios Backend

### Iniciar Contenedores con Docker

```bash
cd ElGalloWebApi
docker compose up -d

cd ../FastApiProject
docker compose up -d
```

### Ejecutar Servicios

```bash
cd ../ElGalloWebApi
dotnet run

cd ../FastApiProject
pip install -r requirements.txt
uvicorn main:app --reload
```

## Paso 3: Configuración y Ejecución del API Gateway

```bash
cd ../SerchMapServiceGatway
dotnet build
dotnet run
```

## Paso 4: Configuración y Ejecución de la Interfaz de Usuario (gallo-locator)

```bash
cd ../gallo-locator
npm install
npm start
```

## Resumen de Comandos

```bash
git clone https://github.com/SerranoAlejandroSelaya/Degree-project-GalloSearch.git

cd ElGalloWebApi
docker compose up -d

cd ../FastApiProject
docker compose up -d

cd ../ElGalloWebApi
dotnet run

cd ../FastApiProject
pip install -r requirements.txt
uvicorn main:app --reload

cd ../SerchMapServiceGatway
dotnet build
dotnet run

cd ../gallo-locator
npm install
npm start
```

## Notas Finales

* Asegúrese de que todos los servicios estén ejecutándose antes de acceder a la aplicación en el navegador.
* El API Gateway es crucial para la comunicación entre servicios; verifique que se ejecute sin errores.
* Todos los servicios deben estar activos para garantizar la correcta operación del buscador y la visualización de datos en el mapa interactivo.

```
```
