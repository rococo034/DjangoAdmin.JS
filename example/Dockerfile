# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies (including gettext for compilemessages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gettext \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the entire repository contents into the container
COPY . /app

# Install the library and extra dependencies
RUN pip install --no-cache-dir gunicorn django-browser-reload
RUN pip install --no-cache-dir .

# Run translation compilations for the library
WORKDIR /app/django_admin_js
RUN django-admin compilemessages

# Move to the example directory
WORKDIR /app/example

# Run migrations
RUN python manage.py migrate

# Expose the port Gunicorn will run on
EXPOSE 8000

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "demo.wsgi:application"]
