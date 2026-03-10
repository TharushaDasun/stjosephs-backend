# St. Joseph's College Media Unit — Backend Setup Guide

## 📁 File Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── cloudinary.js      # Image upload config
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   ├── Admin.js           # Admin user schema
│   ├── Gallery.js         # Photo gallery schema
│   ├── Event.js           # Events schema
│   ├── LiveStream.js      # Live stream schema
│   └── Visitor.js         # Visitor stats schema
├── routes/
│   ├── auth.js            # Login, auth endpoints
│   ├── gallery.js         # Gallery CRUD
│   ├── events.js          # Events CRUD
│   ├── livestream.js      # Live stream control
│   └── visitors.js        # Visitor tracking
├── server.js              # Main Express server
├── seed.js                # Creates first admin user
├── .env.example           # Environment variable template
├── package.json
├── NEW_script.js          # ← Replace your script.js with this
└── NEW_admin-script.js    # ← Replace your admin-script.js with this
```

---

## 🚀 Step-by-Step Setup

### Step 1: Install Node.js
Download from https://nodejs.org (LTS version)

### Step 2: Get a Free MongoDB Database
1. Go to https://cloud.mongodb.com
2. Click **"Try Free"** and create an account
3. Create a **Free Cluster** (M0 Sandbox - free forever)
4. Under **Database Access**: create a user with a password
5. Under **Network Access**: click "Add IP Address" → "Allow Access From Anywhere"
6. Click **Connect** → **Connect your application** → copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`

### Step 3: Get Free Cloudinary (Image Hosting)
1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account
3. From your Dashboard, copy:
   - **Cloud Name**
   - **API Key**  
   - **API Secret**

### Step 4: Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values:
MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/stjosephs_media
JWT_SECRET=some_very_long_random_secret_string_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecurePassword123!
```

### Step 5: Install & Run
```bash
# Install dependencies
npm install

# Create the first admin user (run only once!)
node seed.js

# Start the server
npm start

# OR for development with auto-restart:
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 Server running on port 5000
📡 API: http://localhost:5000/api
```

### Step 6: Update Your Frontend Files
1. **Replace** `script.js` with `NEW_script.js` (rename it to `script.js`)
2. **Replace** `admin-script.js` with `NEW_admin-script.js` (rename it)
3. Both files have `const API_BASE = 'http://localhost:5000/api'` at the top
   - For production, change this to your deployed server URL

---

## 🌐 API Endpoints Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/login | Admin login | ❌ |
| GET | /api/auth/me | Get current admin | ✅ |
| PUT | /api/auth/change-password | Change password | ✅ |

### Gallery
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/gallery | Get all photos | ❌ |
| GET | /api/gallery?category=sports | Filter by category | ❌ |
| POST | /api/gallery | Upload photo | ✅ |
| PUT | /api/gallery/:id | Edit photo info | ✅ |
| DELETE | /api/gallery/:id | Delete photo | ✅ |

### Events
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/events | Get upcoming events | ❌ |
| GET | /api/events?all=true | Get all events | ❌ |
| POST | /api/events | Create event | ✅ |
| PUT | /api/events/:id | Update event | ✅ |
| DELETE | /api/events/:id | Delete event | ✅ |

### Live Stream
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/livestream | Get stream status | ❌ |
| POST | /api/livestream/go-live | Start live stream | ✅ |
| POST | /api/livestream/end | End live stream | ✅ |
| PUT | /api/livestream | Update stream info | ✅ |

### Visitors
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/visitors | Get visitor stats | ❌ |
| POST | /api/visitors/track | Track a session | ❌ |
| GET | /api/visitors/admin | Detailed analytics | ✅ |

---

## ☁️ Deploy to Production (Free Hosting)

### Option A: Render.com (Recommended - Free)
1. Push your backend folder to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`
6. Add all environment variables from your .env
7. Deploy! You'll get a URL like `https://your-app.onrender.com`
8. Update `API_BASE` in both script files to this URL

### Option B: Railway.app (Free tier available)
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add environment variables
4. Done!

---

## 🔒 Security Notes
- Never commit your `.env` file to GitHub (it's in `.gitignore`)
- Change the default admin password immediately after first login
- JWT tokens expire after 7 days (configurable in .env)
- All admin routes require a valid token in the `Authorization` header

---

## ❓ Troubleshooting

**"Cannot connect to server"** → Make sure `npm start` is running

**"Invalid credentials"** → Run `node seed.js` to reset the admin user

**"Image upload failed"** → Check your Cloudinary credentials in `.env`

**"MongoDB connection error"** → Check your MONGO_URI and network access settings in MongoDB Atlas
