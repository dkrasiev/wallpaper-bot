pipeline {
    agent {
        docker { image 'node:18-alpine' }
    }

    stages {
        // stage('Install dependencies') {
        //     steps {
        //         sh 'npm install --global pnpm'
        //         sh 'pnpm install'
        //     }
        // }
        // stage('Lint') {
        //     steps {
        //         sh 'npm run lint'
        //     }
        // }
        // stage('Build') {
        //     steps {
        //         sh 'npm run build'
        //     }
        // }
        stage('Build docker') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub_token') {
                        docker.build('dkrasiev/wallpaper-bot:latest').push()
                    }
                }
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
        }
    }
}
