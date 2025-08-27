import os
import logging
import numpy as np
import joblib
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="MineBlast ML Prediction Service",
    description="Linear Regression model for PPV prediction based on blast parameters",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:3000",
        "https://blastwatcher2429.vercel.app",
        "https://mineblaster869.vercel.app",
        "https://blastwatcher869.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class PredictionRequest(BaseModel):
    distance: float  # D - Distance in meters
    charge_weight: float  # Q - Maximum charge weight per delay in kg
    mine_id: str  # Mine identifier for model selection

class PredictionResponse(BaseModel):
    ppv: float
    scaled_distance: float
    mine_id: str
    model_used: str
    calculation_steps: Optional[dict] = None

# Global variable to store loaded models
loaded_models = {}

def load_model_for_mine(mine_id: str):
    """Load the appropriate model for the given mine"""
    try:
        # First check if model is already loaded
        if mine_id in loaded_models:
            return loaded_models[mine_id]
        
        # Try to load mine-specific model
        model_path = f"./models/{mine_id}_linear_model.pkl"
        
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            loaded_models[mine_id] = model
            logger.info(f"✅ Loaded model for mine: {mine_id}")
            return model
        else:
            # Fallback to default model
            default_path = "./models/linear_model.pkl"
            if os.path.exists(default_path):
                model = joblib.load(default_path)
                loaded_models[mine_id] = model
                logger.info(f"⚠️ Using default model for mine: {mine_id}")
                return model
            else:
                raise FileNotFoundError(f"No model found for mine {mine_id} or default model")
                
    except Exception as e:
        logger.error(f"❌ Error loading model for mine {mine_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load model for mine {mine_id}")

def predict_ppv(D: float, Q: float, model, mine_id: str, show_steps: bool = True):
    """
    Predict PPV using the linear regression model
    Based on: PPV = exp(c) * SD^m where SD = D / sqrt(Q)
    """
    try:
        # Step 1: Calculate Scaled Distance
        SD = D / np.sqrt(Q)
        
        # Step 2: Log transformation
        log_SD = np.log(SD)
        
        # Step 3: Model prediction
        log_PPV = model.predict([[log_SD]])
        
        # Step 4: Exponential transformation to get final PPV
        PPV = np.exp(log_PPV[0])
        
        calculation_steps = {
            "step_1_scaled_distance": f"SD = {D} / sqrt({Q}) = {SD:.4f}",
            "step_2_log_transform": f"log(SD) = ln({SD:.4f}) = {log_SD:.4f}",
            "step_3_model_prediction": f"log(PPV) = model.predict([{log_SD:.4f}]) = {log_PPV[0]:.4f}",
            "step_4_final_result": f"PPV = exp({log_PPV[0]:.4f}) = {PPV:.4f}"
        }
        
        if show_steps:
            logger.info(f"🔍 Prediction steps for mine {mine_id}:")
            for step, calculation in calculation_steps.items():
                logger.info(f"   {step}: {calculation}")
        
        return PPV, SD, calculation_steps
        
    except Exception as e:
        logger.error(f"❌ Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "MineBlast ML Prediction Service",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "models": "/models"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "loaded_models": list(loaded_models.keys()),
        "available_models": [f for f in os.listdir("./models") if f.endswith(".pkl")] if os.path.exists("./models") else []
    }

@app.get("/models")
async def list_available_models():
    """List all available model files"""
    try:
        if not os.path.exists("./models"):
            return {"available_models": [], "message": "Models directory not found"}
        
        model_files = [f for f in os.listdir("./models") if f.endswith(".pkl")]
        return {
            "available_models": model_files,
            "loaded_models": list(loaded_models.keys()),
            "total_models": len(model_files)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")

@app.post("/predict", response_model=PredictionResponse)
async def predict_blast_damage(request: PredictionRequest):
    """
    Predict Peak Particle Velocity (PPV) based on distance and charge weight
    """
    try:
        # Validate input
        if request.distance <= 0:
            raise HTTPException(status_code=400, detail="Distance must be positive")
        if request.charge_weight <= 0:
            raise HTTPException(status_code=400, detail="Charge weight must be positive")
        
        logger.info(f"🚀 Prediction request - Mine: {request.mine_id}, Distance: {request.distance}m, Charge: {request.charge_weight}kg")
        
        # Load appropriate model
        model = load_model_for_mine(request.mine_id)
        
        # Make prediction
        ppv, scaled_distance, calc_steps = predict_ppv(
            request.distance, 
            request.charge_weight, 
            model, 
            request.mine_id,
            show_steps=True  # Show in console for development
        )
        
        # Determine which model was used
        model_used = f"{request.mine_id}_linear_model.pkl" if f"{request.mine_id}_linear_model.pkl" in os.listdir("./models") else "linear_model.pkl"
        
        logger.info(f"✅ Prediction successful - PPV: {ppv:.4f}")
        
        return PredictionResponse(
            ppv=float(ppv),
            scaled_distance=float(scaled_distance),
            mine_id=request.mine_id,
            model_used=model_used,
            calculation_steps=calc_steps
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error in prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    # Create models directory if it doesn't exist
    os.makedirs("./models", exist_ok=True)
    
    # Copy your linear_model.pkl to the models directory
    logger.info("🚀 Starting MineBlast ML Prediction Service on port 8009")
    logger.info("📁 Models directory: ./models")
    logger.info("📝 Place your .pkl files in the models directory")
    
    uvicorn.run(app, host="0.0.0.0", port=8009, reload=True)
