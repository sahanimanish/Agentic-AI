# main.py (FastAPI Application)
from fastapi import FastAPI, HTTPException, Response, Body
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import io
import uuid # For generating unique presentation IDs
from fastapi.middleware.cors import CORSMiddleware  
# Import your agentic modules
from ppt_generator import generate_presentation_pptx
from agent_logic import get_slide_content_from_description, get_edited_content_from_agent, PresentationContent, SlideContent,get_mermaid_output_from_description
import base64

from google import genai
from google.genai import types
import base64

client = genai.Client()



app = FastAPI(
    title="Agentic PPT Creator Backend",
    description="Backend for an agentic website to create and edit presentations from descriptions.",
    version="0.1.0",
)

#enamable CORS for frontend development

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)   

# Pydantic models for request/response
class CreatePptRequest(BaseModel):
    description: str
    num_slides: Optional[int] = 5 # Default to 5 slides
    audience: Optional[str] = "general" # Default audience
    tone: Optional[str] = "informative" # Default tone

class EditPptRequest(BaseModel):
    presentation_id: str # A unique ID for the ongoing presentation session
    slide_index: int
    element_id: str # A unique ID for the element being edited (e.g., "title", "bullet_point_0")
    edit_instruction: str # User's natural language instruction (e.g., "change this to 'Introduction to AI'")
    current_content: str # The current content of the element (important for LLM context)

class PptResponse(BaseModel):
    presentation_id: str # Unique ID for the generated presentation
    slides: List[Dict] # A list of dictionaries representing slides for frontend display
    message: str


# In-memory store for ongoing presentations.
# In a production application, this should be replaced with a persistent database
# (e.g., PostgreSQL, MongoDB, or Firestore) to store data reliably.
# Key: presentation_id (str), Value: {"description": str, "content": PresentationContent, "raw_pptx_data": bytes}
presentations_store: Dict[str, Dict] = {}


@app.post("/create_ppt", response_model=PptResponse, summary="Create a new presentation based on a description")
async def create_ppt(request: CreatePptRequest):
    """
    Endpoint to create a new presentation.
    The agent first generates structured content, then the content is used
    to generate a PPTX file.
    """
    try:
        # Step 1: Agent generates structured content (titles, bullet points, image ideas) using LLMs
        print(f"Generating content for description: '{request.description}'")
        generated_content: PresentationContent = await get_slide_content_from_description(
            description=request.description,
            num_slides=request.num_slides,
            audience=request.audience,
            tone=request.tone
        )
        print("Content generation complete.")

        # Step 2: Generate the initial PPTX file in memory from the structured content
        pptx_buffer = io.BytesIO()
        generate_presentation_pptx(generated_content, pptx_buffer)
        pptx_buffer.seek(0) # Rewind the buffer to the beginning after writing

        # Generate a unique ID for this presentation session
        presentation_id = str(uuid.uuid4())
        presentations_store[presentation_id] = {
            "description": request.description,
            "content": generated_content, # Store the structured content for future edits
            "raw_pptx_data": pptx_buffer.getvalue() # Store the raw bytes for download
        }

        # For the frontend, we'll send a simplified JSON representation of the slides.
        # This allows the frontend to display the content without needing to parse the PPTX.
        frontend_slides = []
        for i, slide in enumerate(generated_content.slides):
            frontend_slides.append({
                "slide_index": i,
                "title": slide.title,
                "bullet_points": slide.bullet_points,
                "image_description": slide.image_description,
                # Add any other fields from SlideContent that the frontend needs to display
            })

        return PptResponse(
            presentation_id=presentation_id,
            slides=frontend_slides,
            message="Presentation created successfully!"
        )

    except ValueError as ve:
        # Catch specific errors from agent_logic (e.g., LLM parsing failure)
        raise HTTPException(status_code=400, detail=f"Content generation error: {str(ve)}")
    except Exception as e:
        print(f"Error creating PPT: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during presentation creation: {str(e)}")


@app.post("/edit_ppt", response_model=PptResponse, summary="Edit a specific element on a slide using agentic instructions")
async def edit_ppt(request: EditPptRequest):
    """
    Endpoint to apply an agentic edit to a specific element on a slide.
    The agent processes the instruction, updates the structured content,
    and then the PPTX is regenerated.
    """
    try:
        
        if request.presentation_id not in presentations_store:
            raise HTTPException(status_code=404, detail="Presentation not found. Please create one first.")

        current_presentation_data = presentations_store[request.presentation_id]
        current_content: PresentationContent = current_presentation_data["content"]

        # Step 1: Agent processes the edit instruction and returns the updated slide content.
        # This function uses LLMs to understand the edit and suggest new content for the element.
        #print(f"Editing slide {request.slide_index}, element '{request.element_id}' with instruction: '{request.edit_instruction}'")
        updated_slide: SlideContent = await get_edited_content_from_agent(
            current_presentation_content=current_content, # Provide full presentation context
            slide_index=request.slide_index,
            element_id=request.element_id,
            edit_instruction=request.edit_instruction,
            current_element_content=request.current_content
        )
        

        # Update the in-memory structured content with the agent's edits for the specific slide.
        # It's crucial that `get_edited_content_from_agent` returns a complete `SlideContent` object.
        current_content.slides[request.slide_index] = updated_slide

        # Step 2: Regenerate the entire PPTX file with the newly updated structured content.
        # This is simpler than trying to modify an existing PPTX document in place for complex edits.
        pptx_buffer = io.BytesIO()
        generate_presentation_pptx(current_content, pptx_buffer)
        pptx_buffer.seek(0)
        presentations_store[request.presentation_id]["raw_pptx_data"] = pptx_buffer.getvalue()

        # For the frontend, send the updated simplified representation of all slides.
        frontend_slides = []
        for i, slide in enumerate(current_content.slides):
            frontend_slides.append({
                "slide_index": i,
                "title": slide.title,
                "bullet_points": slide.bullet_points,
                "image_description": slide.image_description,
            })

        return PptResponse(
            presentation_id=request.presentation_id,
            slides=frontend_slides,
            message="Presentation edited successfully!"
        )

    except HTTPException as he:
        # Re-raise HTTP exceptions generated within this endpoint
        raise he
    except ValueError as ve:
        # Catch specific errors from agent_logic
        raise HTTPException(status_code=400, detail=f"Edit processing error: {str(ve)}")
    except Exception as e:
        print(f"Error editing PPT: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during presentation editing: {str(e)}")


@app.get("/download_ppt/{presentation_id}", summary="Download the generated PPTX file")
async def download_ppt(presentation_id: str):
    """
    Endpoint to download the generated (or edited) PPTX file.
    """
    if presentation_id not in presentations_store:
        raise HTTPException(status_code=404, detail="Presentation not found.")

    pptx_bytes = presentations_store[presentation_id]["raw_pptx_data"]
    name = presentations_store[presentation_id]["content"].name or "presentation"

    return Response(
        content=pptx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f"attachment; filename={name}.pptx"}
    )


#create a /sketch endpoint to test the agentic logic
@app.post("/sketch", summary="Create a sketch based on a description")
async def sketch(description: dict):

    """
    Endpoint to test the agentic logic with a sketch description.
    This is a placeholder for future agentic features.
    """
    
    try:
        # Here you would implement the logic to process the sketch description
        # For now, we just return a mock response
        output = await get_mermaid_output_from_description(description['message'])
        return {"result": output}
    except Exception as e:
        print(f"Error processing sketch: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@app.post("/generate", summary="Generate an image using AI")
async def generate_image(data: dict = Body(...)):
    """
    Generate an image from a description using Google GenAI and return it as base64.
    Expects: { "description": "your prompt here" }
    """
    try:
        # print("Generating image with description:", data)
        prompt = data.get("description")
        slide_index = data.get("slide_index")  # Optional, default to first slide
        presentations_id = data.get("presentation_id")  # Get the presentations store from the request
        # print(presentations_store)
        # current_presentation_data = presentations_store[presentations_id]['content'].slides[slide_index]
        # current_presentation_data = presentations_store[presentations_id]
        # curren_content = current_presentation_data['content']#.slides[slide_index]

        
        current_presentation_data = presentations_store[presentations_id]
        current_content: PresentationContent = current_presentation_data["content"]
        
        if not prompt:
            raise HTTPException(status_code=400, detail="Missing 'description' in request.")

        # Initialize Google GenAI (make sure your API key is set in the environment)
        response = client.models.generate_content(
                    model="gemini-2.0-flash-preview-image-generation",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE']
                    )
                )

        for part in response.candidates[0].content.parts:
            if part.text is not None:
                pass
            elif part.inline_data is not None:
                img_base64 = base64.b64encode(part.inline_data.data).decode("utf-8")
                current_content.slides[slide_index].image_base64 = img_base64
                
                #current_content.slides[request.slide_index] = updated_slide
                # current_content.slides[slide_index] = curren_slide_content
                # print(current_presentation_data)
                pptx_buffer = io.BytesIO()
                generate_presentation_pptx(current_content, pptx_buffer)
                pptx_buffer.seek(0)
                presentations_store[presentations_id]["raw_pptx_data"] = pptx_buffer.getvalue()
                return {"base64": img_base64}

        # The SDK returns a response with a list of generated images (as bytes)
        # We'll take the first image and encode it as base64
        if not response or not hasattr(response, "images") or not response.images:
            raise HTTPException(status_code=500, detail="No image generated.")
        
    except Exception as e:
        print(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")


if __name__ == "__main__":
    # To run this FastAPI application:
    # 1. Ensure you have uvicorn installed: pip install uvicorn
    # 2. Run from your terminal in the 'backend' directory: uvicorn main:app --reload --port 8000
    #    The --reload flag is for development, it reloads the server on code changes.
    #    The --port 8000 matches the frontend's API_BASE_URL.
    uvicorn.run(app, host="0.0.0.0", port=8000)

