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
                sh 'docker build -t dmitrj/wallpaper-bot .'
                sh 'docker push dkrasiev/wallpaper-bot'
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
        }
    }
}
