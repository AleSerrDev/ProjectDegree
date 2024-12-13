from fastapi import APIRouter
from services.chat_service import ChatService
from models.chat import ChatMessage

router = APIRouter()
chat_service = ChatService()

@router.post("/chat")
async def chat(message: ChatMessage):
    return {"response": chat_service.get_response(message.message)}