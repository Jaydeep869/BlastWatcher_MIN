# BlastWatcher Backend API

A comprehensive mining blast monitoring and prediction system backend built with Node.js, Express, and MongoDB.

## Features

- **JWT Authentication** with role-based access control
- **MongoDB Atlas Integration** with Mongoose ODM
- **Role-based Permissions** (Normal, Data Entry, Admin users)
- **RESTful API** design with comprehensive error handling
- **AI-powered Blast Predictions** (dummy implementation for demo)
- **Comprehensive Data Models** for mines, blast data, and predictions
- **Security** with Helmet.js, CORS, and input validation
- **Logging** with Morgan
- **Environment Configuration** with dotenv

## User Roles

- **Normal User**: Can access dashboard, view mines, generate predictions
- **Data Entry User**: Can also create, edit, and manage blast data
- **Admin**: Full access to all features including mine management

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout user

### Mines
- `GET /api/v1/mines` - Get all mines
- `GET /api/v1/mines/:id` - Get single mine
- `POST /api/v1/mines` - Create mine (Admin only)
- `PUT /api/v1/mines/:id` - Update mine (Admin only)
- `DELETE /api/v1/mines/:id` - Delete mine (Admin only)

### Blast Data
- `GET /api/v1/blastdata/:mineId` - Get blast data for mine
- `GET /api/v1/blastdata/single/:id` - Get single blast record
- `POST /api/v1/blastdata` - Create blast data (Data Entry/Admin only)
- `PUT /api/v1/blastdata/:id` - Update blast data (Data Entry/Admin only)
- `DELETE /api/v1/blastdata/:id` - Delete blast data (Data Entry/Admin only)

### Predictions
- `POST /api/v1/predict` - Generate blast prediction
- `GET /api/v1/predict/history` - Get prediction history
- `GET /api/v1/predict/:id` - Get single prediction
- `DELETE /api/v1/predict/:id` - Delete prediction

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mineblaster_backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blastwatch_db
   JWT_SECRET=your_super_secret_jwt_key
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

5. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

- `MONGODB_URI` - MongoDB Atlas connection string
- `MONGODB_URI_LOCAL` - Local MongoDB connection (fallback)
- `JWT_SECRET` - Secret key for JWT token generation
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origin
- `API_VERSION` - API version (default: v1)

## Data Models

### User Schema
- `username` (String, required, unique)
- `email` (String, required, unique)
- `passwordHash` (String, required)
- `role` (Enum: normal, data_entry, admin)
- `isActive` (Boolean)
- `lastLogin` (Date)

### Mine Schema
- `name` (String, required, unique)
- `location` (String, required)
- `description` (String)
- `coordinates` (Object: latitude, longitude)
- `status` (Enum: active, inactive, maintenance)
- `capacity` (Number)
- `operatingCompany` (String)
- `createdBy` (ObjectId, ref: User)

### BlastData Schema
- `mineId` (ObjectId, ref: Mine)
- `blastId` (String, required)
- `inputs` (Object with 14 blast parameters)
- `outputs` (Object with actual results)
- `enteredBy` (ObjectId, ref: User)
- `blastDate` (Date)
- `notes` (String)
- `isVerified` (Boolean)

### Prediction Schema
- `mineId` (ObjectId, ref: Mine)
- `inputs` (Object with 14 blast parameters)
- `result` (Object with predicted outcomes)
- `requestedBy` (ObjectId, ref: User)
- `modelVersion` (String)
- `processingTime` (Number)

## 14 Input Parameters for Blast Prediction

### Geological Parameters
1. `rockType` - Type of rock (Granite, Limestone, Sandstone, Basalt, Quartzite)
2. `rockDensity` - Rock density in kg/m³
3. `rockStrength` - Rock strength in MPa
4. `waterContent` - Water content percentage

### Blast Design Parameters
5. `holeDepth` - Drill hole depth in meters
6. `holeDiameter` - Drill hole diameter in mm
7. `explosiveAmount` - Amount of explosive in kg

### Pattern Parameters
8. `burden` - Burden distance in meters
9. `spacing` - Spacing between holes in meters
10. `subdrill` - Subdrill depth in meters

### Environmental Parameters
11. `weatherCondition` - Weather condition (Clear, Cloudy, Rainy, Windy)
12. `temperature` - Temperature in Celsius
13. `humidity` - Humidity percentage

## Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** with bcryptjs
- **Role-based Access Control** middleware
- **Input Validation** and sanitization
- **Security Headers** with Helmet.js
- **CORS Configuration** for frontend integration
- **Error Handling** without sensitive data exposure

## Testing

Visit the following endpoints to test the API:

- Health Check: `GET http://localhost:5000/health`
- API Documentation: `GET http://localhost:5000/docs`
- Create User: `POST http://localhost:5000/api/v1/auth/signup`
- Login: `POST http://localhost:5000/api/v1/auth/login`

## Development

The server includes:
- **Hot reload** with nodemon in development
- **Comprehensive logging** with Morgan
- **Error handling** middleware
- **Graceful shutdown** handling
- **Database connection** management

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Use a strong JWT secret
4. Set up SSL/TLS certificates
5. Configure proper CORS origins
6. Set up monitoring and logging

## License

This project is licensed under the ISC License.
