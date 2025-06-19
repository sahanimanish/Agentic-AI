from typing import List, Optional
from pydantic import BaseModel, Field


class SlideContent(BaseModel):
    """
    Represents the structured content for a single presentation slide.
    """
    title: str = Field(..., description="The main title of the slide.")
    bullet_points: List[str] = Field(default_factory=list, description="Key bullet points or paragraphs for the slide.")
    image_description: Optional[str] = Field(None, description="A brief, descriptive phrase for a relevant image to be placed on the slide. This can be used to generate or find an image.")
    image_base64: Optional[str] = Field(None, description="Base64 encoded string of an image to be placed on the slide. If provided, this will override the image_description for direct image insertion.")
    # Future additions could include:
    # layout_type: Optional[str] = Field(None, description="Suggested layout type for the slide (e.g., 'title_only', 'title_and_content', 'two_column').")
    # slide_notes: Optional[str] = Field(None, description="Speaker notes for the slide.")

class PresentationContent(BaseModel):
    """
    Represents the structured content for an entire presentation, composed of multiple slides.
    """
    name: str = Field(..., description="The name or title of the presentation.")
    slides: List[SlideContent] = Field(..., description="A list of slide objects for the presentation.")
    overall_theme: Optional[str] = Field(None, description="A suggested overall theme or style for the presentation (e.g., 'professional', 'minimalist', 'playful', 'academic').")


class MermaidOutput(BaseModel):
    """
    Represents the mermaid syntax
    """
    elements: str = Field(..., description="Mermaid syntax representing the workflows")
    explanation: Optional[str] = Field(
        None, description="Explanation of the generated mermaid syntax"
    )
