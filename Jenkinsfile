pipeline {
    agent any

    // Trigger the pipeline on GitHub push via webhook
    triggers {
        githubPush()
        // Fallback: Poll GitHub every 5 minutes if webhook fails
        pollSCM('H/5 * * * *')
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
                echo '✅ Skipping tests...'
                // Tests will be added later
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 Deploying application to EC2...'
                sh '''
                    # Copy source code files and public folder
                    scp -i /var/lib/jenkins/MyKey.pem -o StrictHostKeyChecking=no index.js package.json ec2-user@16.171.70.101:/home/ec2-user/kanishk/
                    scp -i /var/lib/jenkins/MyKey.pem -o StrictHostKeyChecking=no -r public ec2-user@16.171.70.101:/home/ec2-user/kanishk/
                    
                    # SSH into EC2 and restart the application
                    ssh -i /var/lib/jenkins/MyKey.pem -o StrictHostKeyChecking=no ec2-user@16.171.70.101 << 'EOF'
                    cd /home/ec2-user/kanishk/
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
