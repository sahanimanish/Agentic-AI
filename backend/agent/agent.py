import os
import asyncio
import json
from google.adk.agents import Agent
# from google.adk.models.lite_llm import LiteLlm # For multi-model support
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types # For creating message Content/Parts

from models.model import PresentationContent ,MermaidOutput  , SlideContent

import warnings
# Ignore all warnings
warnings.filterwarnings("ignore")

ppt_agent = Agent(
    name="powerpoint_agent",
    model="gemini-2.5-flash-preview-05-20", # Can be a string for Gemini or a LiteLlm object
    description="You are a helpful assistant designed to providde high quality power point prsentation",
    instruction="always follow user instruction "
                """
                 For each slide, provide:
                    1.  A concise and impactful 'title'.
                    2.  'bullet_points' (list of strings): Key information or talking points. Keep them concise and informative.
                    3.  'image_description' (optional string): A brief, descriptive phrase for a relevant image that would enhance the slide.

                provide an 'overall_theme' for the entire presentation,  and the value for in between this (e.g., 'professional', 'minimalist', 'playful', 'academic', 'dynamic').
                """
,output_schema=PresentationContent,
    output_key="result"

)


edit_agent = Agent(
    name="powerpoint_agent",
    model="gemini-2.5-flash-preview-05-20", # Can be a string for Gemini or a LiteLlm object
    description="You are a helpful assistant designed to providde high quality power point prsentation",
    instruction="always follow user instruction "
                """
                 For each slide, provide:
                    1.  A concise and impactful 'title'.
                    2.  'bullet_points' (list of strings): Key information or talking points. Keep them concise and informative.
                    3.  'image_description' (optional string): A brief, descriptive phrase for a relevant image that would enhance the slide.

                provide an 'overall_theme' for the entire presentation,  and the value for in between this (e.g., 'professional', 'minimalist', 'playful', 'academic', 'dynamic').
                """
,output_schema=SlideContent,
    output_key="result"

)




worflow = Agent(
    model='gemini-2.5-flash-preview-05-20',
    name='mermaid_creator',
    description="""A creative assistant that can help users with creating workflows.
        It can interpret user instructions to generate diagrams, flowcharts, and other visual mermaid syntax to create worflow""",
    instruction="""You're a creative assistant that helps users create  workflows based on their instructions.
        When a user provides a description or instruction, analyze it and generate the appropriate mermaid syntax
        If asked to translate or explain, do so helpfully.

        Guidelines:
        - Focus on understanding the user's intent and translating it into visual elements.
        - always provide a clear and concise response.
        - if you don't understand the user's request, ask for clarification.
        - always create relationship between the elements, even if it's just a simple connection.
        - if the user asks to delete an element, make sure to remove it from the diagram.
        - always provide an explanation in markdown format.
        - never user mermaid word or similar words in the response.
        """,

    output_schema=MermaidOutput,
    output_key="Result",
)


session_service = InMemorySessionService()

# Define constants for identifying the interaction context
APP_NAME = "workspace"
USER_ID = "user_1"
SESSION_ID = "session_001" # Using a fixed ID for simplicity

async def create_session():
    session = await session_service.create_session(
            app_name=APP_NAME,
            user_id=USER_ID,
            session_id=SESSION_ID
        )
    print(f"Session created: App='{APP_NAME}', User='{USER_ID}', Session='{SESSION_ID}'")
    return session

session = asyncio.run(create_session())

async def get_runner_session(agent):
    """
    Returns the runner instance for the agent.
    This allows other parts of the application to access the runner.

    """

    # Create the specific session where the conversation will happen
    

    # --- Runner ---
    # Key Concept: Runner orchestrates the agent execution loop.
    runner = Runner(
        agent=agent, # The agent we want to run
        app_name=APP_NAME,   # Associates runs with our app
        session_service=session_service # Uses our session manager
    )
    print(f"Runner created for agent '{runner.agent.name}'.")
    return runner, session


async def call_llm(
    agent: Agent,
    query: str,
    runner: Runner,
    session_id: str
):
    """Sends a query to the specified agent/runner and prints results."""
    

    user_content = types.Content(role='user', parts=[types.Part(text=query)])

    
    async for event in runner.run_async(user_id=USER_ID, session_id=session_id, new_message=user_content):
        # print(f"Event: {event.type}, Author: {event.author}") # Uncomment for detailed logging
        if event.is_final_response() and event.content and event.content.parts:
            # For output_schema, the content is the JSON string itself
            final_response_content = event.content.parts[0].text


    current_session = await session_service.get_session(app_name=APP_NAME,
                                            user_id=USER_ID,
                                            session_id=SESSION_ID)

    try:
        # Attempt to parse and pretty print if it's JSON
        # parsed_output = json.loads(stored_output)
        # print(json.dumps(parsed_output, indent=2))
        stored_output = current_session.state.get(agent.output_key)
        return stored_output
    except (json.JSONDecodeError, TypeError):
          # Otherwise, print as string
        print("heloo")
    print("-" * 30)