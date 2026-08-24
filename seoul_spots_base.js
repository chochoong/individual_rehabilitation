/**
 * 서울 주요 여행지 10선 데이터
 * seoul-images/ 폴더의 장소 이미지를 분석하여 추출한 정보입니다.
 *
 * category: '역사' | '자연' | '쇼핑' | '전망' | '엔터테인먼트'
 */
export const seoulPlaces = [
  {
    image: "seoul-images/01_경복궁.png",
    place_name: "경복궁 (근정전)",
    category: "역사",
    tags: ["#전통미", "#한복나들이", "#조선왕조", "#북악산뷰", "#인생샷"],
    summary:
      "북악산 능선을 병풍처럼 두른 근정전 앞에 서면 조선 600년의 위엄이 그대로 전해지는, 한복 입고 서울의 첫 페이지를 열고 싶은 여행객에게 완벽한 곳이에요.",
  },
  {
    image: "seoul-images/02_북촌한옥마을.jpg",
    place_name: "북촌한옥마을",
    category: "역사",
    tags: ["#전통미", "#골목산책", "#한옥스테이", "#과거와현재", "#감성사진"],
    summary:
      "기와 담장 너머로 남산타워가 겹쳐 보이는 이 골목은, 과거와 현대가 한 프레임에 담기는 순간을 사랑하는 감성 여행객에게 최고의 산책길입니다.",
  },
  {
    image: "seoul-images/03_국립중앙박물관.jpg",
    place_name: "국립중앙박물관",
    category: "역사",
    tags: ["#실내데이트", "#비오는날추천", "#야경맛집", "#지식충전", "#무료입장"],
    summary:
      "웅장한 '열린마당' 프레임 사이로 남산타워가 걸리는 뷰까지 챙길 수 있어, 오천 년 역사를 한나절에 훑고 싶은 지적 호기심 많은 여행객에게 강력 추천합니다.",
  },
  {
    image: "seoul-images/04_N서울타워.png",
    place_name: "N서울타워 (남산타워)",
    category: "전망",
    tags: ["#야경맛집", "#노을명소", "#커플여행", "#서울랜드마크", "#인생샷"],
    summary:
      "분홍빛 노을이 남산 능선을 물들일 때 타워 조명이 켜지는 그 찰나를 기다릴 줄 아는, 로맨틱한 야경 헌터들을 위한 서울의 정점입니다.",
  },
  {
    image: "seoul-images/05_서울숲.jpg",
    place_name: "서울숲",
    category: "자연",
    tags: ["#도심속휴식", "#피크닉", "#가족여행", "#숲길산책", "#반려동물동반"],
    summary:
      "키 큰 소나무 사이로 난 산책로가 반겨주는 도심 속 허파로, 빡빡한 일정 사이에 초록빛 쉼표 하나를 찍고 싶은 여행객에게 딱 맞습니다.",
  },
  {
    image: "seoul-images/06_한강공원.png",
    place_name: "한강공원",
    category: "자연",
    tags: ["#자전거라이딩", "#치맥성지", "#피크닉", "#강뷰맛집", "#여유로움"],
    summary:
      "강 건너 스카이라인을 배경으로 자전거 페달을 밟는 순간, 진짜 서울 사람들의 일상 속으로 스며들고 싶은 자유로운 여행객을 위한 공간이에요.",
  },
  {
    image: "seoul-images/07_명동.jpg",
    place_name: "명동",
    category: "쇼핑",
    tags: ["#K뷰티", "#길거리음식", "#쇼핑천국", "#외국인필수코스", "#먹방투어"],
    summary:
      "화장품 로드샵과 붕어빵·타이야키 노점이 어깨를 맞댄 거리에서, 두 손 가득 쇼핑백을 채우며 K-뷰티를 정복하고 싶은 여행객의 성지입니다.",
  },
  {
    image: "seoul-images/08_홍대.png",
    place_name: "홍대 걷고싶은거리",
    category: "엔터테인먼트",
    tags: ["#버스킹", "#청춘거리", "#인디문화", "#밤이더좋아", "#핫플레이스"],
    summary:
      "거리 한복판에서 울려 퍼지는 버스킹 선율과 젊음의 에너지가 뒤섞이는 곳, 계획 없이 걷다가 우연한 즐거움을 만나고 싶은 여행객에게 어울립니다.",
  },
  {
    image: "seoul-images/09_롯데월드.png",
    place_name: "롯데월드 어드벤처",
    category: "엔터테인먼트",
    tags: ["#가족여행", "#실내테마파크", "#날씨무관", "#아이스링크", "#동화속세계"],
    summary:
      "거대한 유리 돔 아래 동화 속 마을과 아이스링크가 펼쳐지는 실내 테마파크로, 비가 오나 눈이 오나 하루 종일 신나게 놀고 싶은 가족·연인에게 최적입니다.",
  },
  {
    image: "seoul-images/10_DDP동대문디자인플라자.jpg",
    place_name: "DDP 동대문디자인플라자",
    category: "엔터테인먼트",
    tags: ["#미래건축", "#전시나들이", "#포토스팟", "#자하하디드", "#심야쇼핑"],
    summary:
      "곡선으로 흐르는 은빛 우주선 같은 건축물 자체가 작품인 곳으로, 감각적인 전시와 심야 쇼핑까지 즐기려는 트렌디한 여행객에게 딱입니다.",
  },
];

/** 카테고리별로 장소를 묶어 반환합니다. */
export function groupByCategory(places = seoulPlaces) {
  return places.reduce((acc, place) => {
    (acc[place.category] ||= []).push(place);
    return acc;
  }, {});
}

/** 특정 해시태그를 가진 장소만 필터링합니다. (예: '#인생샷') */
export function findByTag(tag, places = seoulPlaces) {
  return places.filter((place) => place.tags.includes(tag));
}

export default seoulPlaces;
