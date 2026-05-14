# MERN Stack Application Deployment on AWS EC2

This guide explains how to deploy a full-stack MERN application from GitHub to AWS EC2 using:

- Ubuntu EC2 Instance
- Node.js
- PM2
- Nginx
- MongoDB Atlas
- HTTP (No SSL/HTTPS)

GitHub Repository Used:

https://github.com/Sanket-165/Blog1

---

# Architecture

User
↓
AWS EC2
├── React Frontend (served by Nginx)
├── Node/Express Backend (running with PM2)
└── MongoDB Atlas Database

---

# STEP 1 — Launch EC2 Instance

Go to AWS Console:

https://console.aws.amazon.com/

Open EC2 → Launch Instance

Configuration:

| Option | Value |
|---|---|
| OS | Ubuntu 22.04 |
| Instance Type | t2.micro |
| Storage | 20GB |
| Key Pair | Create New |
| Security Group | Allow SSH, HTTP, Custom TCP |

---

# STEP 2 — Configure Security Group

Allow these ports:

| Type | Port |
|---|---|
| SSH | 22 |
| HTTP | 80 |
| Custom TCP | 5000 |

---

# STEP 3 — Connect to EC2

Open terminal where PEM key exists.

Give permission:

```bash
chmod 400 your-key.pem
```

Connect:

```bash
ssh -i your-key.pem ubuntu@YOUR_PUBLIC_IP
```

Example:

```bash
ssh -i aws.pem ubuntu@51.20.2.24
```

---

# STEP 4 — Update Ubuntu

```bash
sudo apt update && sudo apt upgrade -y
```

---

# STEP 5 — Install Node.js

Install Node.js 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

sudo apt install nodejs -y
```

Verify installation:

```bash
node -v
npm -v
```

---

# STEP 6 — Install Git

```bash
sudo apt install git -y
```

---

# STEP 7 — Clone GitHub Repository

```bash
git clone https://github.com/Sanket-165/Blog1.git
```

Go into project:

```bash
cd Blog1
```

---

# STEP 8 — Setup Backend

Go to backend folder:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

---

# STEP 9 — Create Backend Environment Variables

Create `.env` file:

```bash
nano .env
```

Add:

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_ATLAS_URI
JWT_SECRET=anything_random
```

Save:

CTRL + X  
Y  
ENTER

---

# STEP 10 — Start Backend

Run server:

```bash
node server.js
```

Output:

```bash
Server running on http://localhost:5000
Connected to MongoDB Atlas
```

Backend test:

```text
http://YOUR_PUBLIC_IP:5000
```

If browser shows:

```text
Cannot GET /
```

that means backend is running successfully.

Stop backend:

```bash
CTRL + C
```

---

# STEP 11 — Install PM2

PM2 keeps backend alive permanently.

Install:

```bash
sudo npm install -g pm2
```

Start backend:

```bash
pm2 start server.js --name blog-backend
```

Save PM2 process:

```bash
pm2 save
```

Enable auto startup:

```bash
pm2 startup
```

Run the command PM2 gives.

Check status:

```bash
pm2 status
```

View logs:

```bash
pm2 logs
```

---

# STEP 12 — Setup Frontend

Go to frontend folder:

```bash
cd ../client
```

Install dependencies:

```bash
npm install
```

---

# STEP 13 — Configure Frontend API URL

Create `.env` file:

```bash
nano .env
```

Add:

```env
VITE_API_URL=http://YOUR_PUBLIC_IP:5000/api
```

Example:

```env
VITE_API_URL=http://51.20.2.24:5000/api
```

Save file.

---

# STEP 14 — Build Frontend

Build React/Vite app:

```bash
npm run build
```

This creates:

```text
dist/
```

---

# STEP 15 — Install Nginx

Install:

```bash
sudo apt install nginx -y
```

Start nginx:

```bash
sudo systemctl start nginx
```

Enable nginx:

```bash
sudo systemctl enable nginx
```

---

# STEP 16 — Configure Nginx

Remove default config:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

Create new config:

```bash
sudo nano /etc/nginx/sites-available/blog-app
```

Paste:

```nginx
server {
    listen 80;

    server_name _;

    location / {
        root /home/ubuntu/Blog1/client/dist;
        index index.html;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

Save file.

---

# STEP 17 — Enable Nginx Config

Create symbolic link:

```bash
sudo ln -s /etc/nginx/sites-available/blog-app /etc/nginx/sites-enabled/
```

---

# STEP 18 — Fix Permissions

Allow nginx to access files:

```bash
sudo chmod -R 755 /home/ubuntu
sudo chmod -R 755 /home/ubuntu/Blog1
```

---

# STEP 19 — Test Nginx

```bash
sudo nginx -t
```

If successful:

```bash
sudo systemctl restart nginx
```

---

# STEP 20 — Open Application

Open browser:

```text
http://YOUR_PUBLIC_IP
```

Example:

```text
http://51.20.2.24
```

Application should now work successfully.

---

# MongoDB Atlas Configuration

Go to:

https://www.mongodb.com/cloud/atlas

Steps:

1. Create Cluster
2. Create Database User
3. Network Access → Add IP

Allow:

```text
0.0.0.0/0
```

Copy MongoDB URI into backend `.env`

---

# Useful PM2 Commands

Restart backend:

```bash
pm2 restart blog-backend
```

Stop backend:

```bash
pm2 stop blog-backend
```

View logs:

```bash
pm2 logs
```

Delete process:

```bash
pm2 delete blog-backend
```

---

# Updating Application After Changes

SSH into EC2:

```bash
ssh -i your-key.pem ubuntu@YOUR_PUBLIC_IP
```

Go to project:

```bash
cd Blog1
```

Pull latest code:

```bash
git pull
```

Update backend:

```bash
cd server
npm install
pm2 restart blog-backend
```

Update frontend:

```bash
cd ../client
npm install
npm run build
sudo systemctl restart nginx
```

---

# Final Result

Frontend:

```text
http://YOUR_PUBLIC_IP
```

Backend API:

```text
http://YOUR_PUBLIC_IP:5000
```

---

# Technologies Used

- React + Vite
- Node.js
- Express.js
- MongoDB Atlas
- AWS EC2
- Nginx
- PM2
