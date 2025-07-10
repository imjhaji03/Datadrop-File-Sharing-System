# Datadrop Deployment Guide

This guide provides comprehensive instructions for deploying the **Datadrop** application. It covers everything from simple local testing to a production-ready setup on a Virtual Private Server (VPS).

### Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Option 1: Docker Deployment (Recommended)](#-option-1-docker-deployment-recommended)
3. [Option 2: VPS Deployment (Production)](#-option-2-vps-deployment-production)
   - [Automated Setup with `vps-setup.sh`](#automated-setup-with-vps-setupsh)
   - [Manual Setup](#manual-setup)
4. [Option 3: Simple Local Deployment](#-option-3-simple-local-deployment)
5. [Option 4: Cloud Platform Deployment (PaaS)](#-option-4-cloud-platform-deployment-paas)
6. [Important Datadrop Considerations](#-important-Datadrop-considerations)

---

## 📦 Prerequisites

Before you begin, ensure you have the following tools installed on your deployment machine:
- **Git**: For cloning the repository.
- **Docker & Docker Compose**: For the containerized deployment method.
- **Java 11+ (JDK)**: For running the backend.
- **Node.js 18+ & npm**: For building and running the frontend.

---

## 🚀 Option 1: Docker Deployment (Recommended)

Using Docker is the most reliable and consistent way to deploy Datadrop. This repository includes pre-configured Dockerfiles and a Docker Compose file to orchestrate both services.

- `Dockerfile.backend`: Defines the container for the Java backend.
- `Dockerfile.frontend`: Defines the container for the Next.js frontend.
- `docker-compose.yml`: Manages and links both containers.

### Steps:
1.  Ensure Docker and Docker Compose are running on your system.
2.  Clone the repository and navigate into the project directory.
3.  Run the application using Docker Compose:
    ```bash
    docker-compose up --build -d
    ```
    The `--build` flag builds the images if they don't exist, and `-d` runs them in detached mode.

Your application is now running!
-   **Frontend:** `http://localhost:3000`
-   **Backend API:** `http://localhost:8080`

---

## 🏗️ Option 2: VPS Deployment (Production)

For complete control and public access, deploying to a VPS (like AWS Lightsail, DigitalOcean, or Linode) is the best choice. This repository includes helper scripts to simplify this process.

### Automated Setup (with `vps-setup.sh`)

The `vps-setup.sh` script is designed to automate the installation of all necessary dependencies and the configuration of your application on a fresh Ubuntu/Debian server.

**What the script does:**
-   Installs Java, Node.js, Nginx, and PM2.
-   Clones the repository (or uses the existing one).
-   Builds both the backend and frontend applications.
-   Uses **PM2** to run both services persistently.
-   Prompts you to set up Nginx as a reverse proxy.

**Steps:**
1.  Upload your project to the VPS or clone it:
    ```bash
    git clone https://github.com/imjhaji03/Datadrop.git
    cd Datadrop
    ```
2.  Make the setup script executable:
    ```bash
    chmod +x vps-setup.sh
    ```
3.  Run the script with `sudo` privileges and follow the on-screen instructions:
    ```bash
    sudo ./vps-setup.sh
    ```

### Manual Setup

If you prefer to configure the environment yourself:

1.  **SSH into your VPS** and install dependencies:
    ```bash
    sudo apt update
    sudo apt install -y openjdk-11-jdk maven nodejs npm nginx
    sudo npm install -g pm2 # Install PM2 globally
    ```
2.  **Clone the repository** and build the applications:
    ```bash
    git clone https://github.com/imjhaji03/Datadrop.git
    cd Datadrop

    # Build backend
    mvn clean package

    # Build frontend
    cd ui
    npm install
    npm run build
    cd ..
    ```
3.  **Run services with PM2:**
    ```bash
    # Start the backend server
    pm2 start "java -jar target/Datadrop-1.0-SNAPSHOT.jar" --name datadrop-backend

    # Start the frontend production server
    pm2 start "npm --prefix ui start" --name datadrop-frontend
    
    # Save the process list to run on startup
    pm2 save
    pm2 startup
    ```
4.  **Configure Nginx as a reverse proxy.** Use the provided `nginx.conf.example` as a template.
    ```bash
    sudo cp nginx.conf.example /etc/nginx/sites-available/datadrop
    # Edit the file to add your domain name
    sudo nano /etc/nginx/sites-available/datadrop
    
    # Enable the site
    sudo ln -s /etc/nginx/sites-available/datadrop /etc/nginx/sites-enabled/
    sudo nginx -t # Test configuration
    sudo systemctl restart nginx
    ```
5.  **Set up SSL with Let's Encrypt** (Highly Recommended):
    ```bash
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

---

## 💻 Option 3: Simple Local Deployment

This method is ideal for quick testing and development on your local machine.

1.  **Build the applications:**
    ```bash
    # Build backend
    mvn clean package

    # Build frontend
    cd ui
    npm install
    npm run build
    cd ..
    ```
2.  **Run the backend** in one terminal:
    ```bash
    java -jar target/Datadrop-1.0-SNAPSHOT.jar
    ```
3.  **Run the frontend** in a second terminal:
    ```bash
    # Run the production build
    npm --prefix ui start
    ```
4.  Access the application at `http://localhost:3000`.

---

## ☁️ Option 4: Cloud Platform Deployment (PaaS)

For a serverless approach without managing a VPS, you can deploy the frontend and backend to separate Platform-as-a-Service providers.

#### Backend Deployment (e.g., Railway)
1.  Connect your GitHub repository to a new Railway project.
2.  Railway will automatically detect the `pom.xml` and configure a Java environment.
3.  No further configuration is typically needed. Railway will build and deploy the application.

#### Frontend Deployment (e.g., Vercel)
Vercel is the best choice for Next.js applications.
1.  Connect your GitHub repository to a new Vercel project.
2.  When prompted, set the **Root Directory** to `ui`.
3.  Vercel will automatically detect the Next.js framework, build your site, and deploy it to their global CDN.

---

## 🔒 Important Datadrop Considerations

Because Datadrop creates direct peer-to-peer connections, deploying it publicly requires special network configuration.

-   **Port Forwarding**: For the Datadrop file transfer to work across the internet, the **sender** must have the dynamic port (e.g., `57722`) opened on their router and firewall, pointing to the device running their browser. This is a significant hurdle for general public use.
-   **NAT Traversal**: For a more robust solution that doesn't require manual port forwarding, real-world Datadrop apps use **STUN/TURN servers** to help peers discover each other behind NATs. This is a potential future enhancement for Datadrop.
-   **Security**: For any public-facing deployment, ensure you have configured **HTTPS** (with Nginx and Certbot) to protect the web interface and API calls.