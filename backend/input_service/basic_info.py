from typing import Optional
from pydantic import BaseModel


class BasicInfo(BaseModel):
    """
    개인회생 신청자의 기본 정보
    """

    # 이름
    name: str = ""

    # 거주지역
    region: str = ""

    # 부양가족 수
    family_count: Optional[int] = None

    # 이전 회생/파산/면책 이력 체크 여부
    has_previous_rehabilitation_history: bool = False

