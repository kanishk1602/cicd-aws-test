pipeline {
    agent any

    // Trigger the pipeline on GitHub push via webhook
    triggers {
        githubPush()
    }

    // Define environment variables
    environment {
        NODE_ENV = 'production'
        PORT = '3000'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Checking out code from GitHub...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Installing dependencies...'
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                echo '🔨 Building project...'
                sh 'npm list'
            }
        }

        stage('Test') {
            steps {
                echo '✅ Running tests...'
                sh 'npm test'
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 Deploying application to EC2...'
                sh '''
                    # Copy code to EC2 instance
                    scp -i /Users/kanishk/Desktop/MyKey.pem -r -o StrictHostKeyChecking=no * ec2-user@16.171.70.101:/home/ec2-user/kanishk/
                    
                    # SSH into EC2 and restart the application
                    ssh -i /Users/kanishk/Desktop/MyKey.pem -o StrictHostKeyChecking=no ec2-user@16.171.70.101 << 'EOF'
                    cd /home/ec2-user/kanishk/
                    npm install
                    if pgrep -f "node index.js" > /dev/null; then
                        pkill -f "node index.js"
                    fi
                    npm start > /dev/null 2>&1 &
                    echo "Application started on EC2"
EOF
                '''
                echo 'Application deployed successfully to EC2!'
            }
        }
    }

    post {
        always {
            echo '📊 Pipeline execution completed.'
        }
        success {
            echo '✨ Pipeline succeeded! Your application is live.'
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above.'
        }
    }
}
