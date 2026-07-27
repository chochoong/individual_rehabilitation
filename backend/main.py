from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import router

app = FastAPI()


# CORSMiddleware는 다른 라우터나 미들웨어보다 상단에 위치해야 합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5191",
        "http://127.0.0.1:5191",
        "*"  # 개발 단계에서는 전체 허용으로 테스트
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router)