# agent_logic.py

import json
import os
from dotenv import load_dotenv
from models.model import PresentationContent, SlideContent , MermaidOutput
from agent.agent import call_llm , get_runner_session,ppt_agent , worflow,edit_agent

# Load environment variables (e.g., for API keys if you integrate real LLMs)
load_dotenv()



async def get_slide_content_from_description(
    description: str,
    num_slides: int,
    audience: str,
    tone: str
) -> PresentationContent:
    """
    Generates a structured PresentationContent object using an LLM
    based on the user's overall presentation description.
    """
    # This is a critical prompt engineering step. You need to guide the LLM precisely
    # to produce the desired structured output.
    prompt = f"""
    You are an expert presentation designer and content creator. Your task is to generate a structured outline for a multi-slide presentation.

    **Presentation Description:** "{description}"
    **Target Audience:** {audience}
    **Tone/Style:** {tone}
    **Number of Slides:** Aim for approximately {num_slides} slides, but adjust if necessary for coherence and completeness.

    Also, suggest an 'overall_theme' for the entire presentation, which can guide the visual design (e.g., 'professional', 'minimalist', 'playful', 'academic', 'dynamic').

    """


    try:
        runner , session = await get_runner_session(ppt_agent)
        agent_output = await call_llm(ppt_agent,prompt,runner,session.id)
        
        agent_output = PresentationContent.model_validate(agent_output)
               # Validate and parse the LLM's JSON output into our Pydantic model
        return agent_output
    except Exception as e:
        # print(f"Error parsing LLM output for content generation: {e}")
        # print(f"Raw LLM output: {agent_output}")
        raise ValueError(f"Failed to parse LLM response for content generation: {e}")
    


async def get_mermaid_output_from_description(
    description: dict
) -> MermaidOutput:
    """
    Generates a MermaidOutput object using an LLM based on the user's description.
    This is used for creating Excalidraw components and workflows.
    """
    

    try:
        runner , session = await get_runner_session(worflow)
        agent_output = await call_llm(worflow,description,runner,session.id)
        agent_output = MermaidOutput.model_validate(agent_output)
        return agent_output
    except Exception as e:
        # print(f"Error parsing LLM output for mermaid generation: {e}")
        # print(f"Raw LLM output: {agent_output}")
        raise ValueError(f"Failed to parse LLM response for mermaid generation: {e}")    


async def get_edited_content_from_agent(
    current_presentation_content: PresentationContent, # Provides context of entire presentation
    slide_index: int,
    element_id: str, # e.g., "title", "bullet_points", "image_description", "bullet_point_0"
    edit_instruction: str,
    current_element_content: str # The specific content of the element being edited
) -> SlideContent:
    """
    Applies an agentic edit to a specific element on a slide using an LLM.
    Returns the updated SlideContent object for that specific slide.
    """
    if slide_index < 0 or slide_index >= len(current_presentation_content.slides):
        raise ValueError(f"Slide index {slide_index} is out of bounds for the current presentation.")

    current_slide = current_presentation_content.slides[slide_index]
    # Convert current_slide to a dictionary for easier LLM context inclusion in the prompt
    current_slide_dict = current_slide.model_dump()

    # Craft a detailed prompt for editing. This prompt provides the LLM with:
    # 1. The full current slide content.
    # 2. The specific element to edit.
    # 3. The user's natural language instruction for the edit.
    # The LLM is then asked to return the *entire* updated SlideContent for that slide.
    prompt = f"""
    You are an intelligent editor assisting in refining a single presentation slide.
    A user wants to make an edit to a specific element on this slide.

    **Current Slide Content (JSON):**
    ```json
    {json.dumps(current_slide_dict, indent=2)}
    ```

    **Element to Target for Edit:** "{element_id}" (This identifies the part of the JSON to focus on, e.g., "title", "bullet_points", or "image_description". If it's like "bullet_point_0", it refers to a specific item in the 'bullet_points' list.)
    **Current Content of this Targeted Element:** "{current_element_content}"
    **User's Edit Instruction:** "{edit_instruction}"

    Based on the 'User's Edit Instruction', carefully update ONLY the relevant part of the JSON structure for this specific slide.
    - If the instruction implies a change to the 'title', 'bullet_points', or 'image_description', modify that field.
    - For 'bullet_points', if the instruction is to add, remove, or modify a specific bullet point, update the list precisely.
    - Maintain the integrity of other fields that are not directly targeted by the instruction.
    - Ensure the updated content aligns with the context of the slide and the overall presentation.

    """

    # llm_output_json = await call_llm(
    #     system_prompt="You are a helpful assistant designed to output JSON.",
    #     user_prompt=prompt,
    #     response_format_json=True
    # )

    try:
        # Validate and parse the LLM's JSON output for the updated slide
        runner , session = await get_runner_session(edit_agent)
        agent_output = await call_llm(edit_agent,prompt,runner,session.id)
        print(f"Agent output for edit operation: {agent_output}")
        # agent_output = PresentationContent.model_validate(agent_output)
        updated_slide_content = SlideContent.model_validate(agent_output)
        return updated_slide_content
    except Exception as e:
        print(f"Error parsing LLM output for edit operation: {e}")
        print(f"Raw LLM edit output: {updated_slide_content}")
        raise ValueError(f"Failed to parse LLM response for editing: {e}")

