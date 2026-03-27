pipeline {
    agent any

    stages {

        stage('Clone Code') {
            steps {
                git 'https://github.com/imjhaji03/Datadrop-File-Sharing-System.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t datadrop-backend -f Dockerfile.backend .'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t datadrop-frontend -f Dockerfile.frontend .'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose up -d --build'
            }
        }
    }
}
