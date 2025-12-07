#!/bin/bash

# EC2 초기 설정 스크립트
# 새 EC2 서버에서 처음 한 번만 실행: bash setup-ec2.sh

set -e

echo "🔧 EC2 초기 설정 시작..."

# 1. 시스템 업데이트
echo "📦 시스템 업데이트..."
sudo apt update
sudo apt upgrade -y

# 2. Node.js 설치 (없으면)
if ! command -v node &> /dev/null; then
    echo "📥 Node.js 설치..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo "✅ Node.js 버전: $(node --version)"
echo "✅ npm 버전: $(npm --version)"

# 3. MySQL 설치 및 시작
if ! command -v mysql &> /dev/null; then
    echo "📥 MySQL 설치..."
    sudo apt install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
fi

echo "✅ MySQL 설치 완료"

# 4. MySQL root 비밀번호 설정
echo "🔐 MySQL 설정..."
sudo mysql << MYSQLEOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'ww001009!';
CREATE DATABASE IF NOT EXISTS damara;
FLUSH PRIVILEGES;
MYSQLEOF

echo "✅ MySQL 설정 완료"

# 5. PM2 설치
if ! command -v pm2 &> /dev/null; then
    echo "📥 PM2 설치..."
    sudo npm install -g pm2
fi

echo "✅ PM2 설치 완료"

# 6. Git 설치 (없으면)
if ! command -v git &> /dev/null; then
    echo "📥 Git 설치..."
    sudo apt install -y git
fi

echo "✅ Git 설치 완료"

# 7. 프로젝트 클론 (Git URL이 있으면)
echo ""
echo "📋 다음 단계:"
echo "1. 프로젝트 클론: git clone <your-repo-url> ~/damara-BE"
echo "2. 또는 프로젝트 파일을 ~/damara-BE에 업로드"
echo "3. 배포 실행: cd ~/damara-BE && bash deploy.sh"
echo ""
echo "✅ EC2 초기 설정 완료!"

