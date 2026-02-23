import { GoogleGenAI, Type } from "@google/genai";

export interface PromoConcept {
  promotionName: string;
  conceptSummary: string;
  layout: {
    sectionName: string;
    visualDescription: string;
    copy: string;
  }[];
  copywriting: {
    mainCopy: string;
    subCopy: string;
    keywords: string[];
  };
  directorNotes: string;
}

export async function generatePromoConcept(
  period: string,
  features: string,
  creativity: number,
  customApiKey?: string
): Promise<PromoConcept> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  const ai = new GoogleGenAI({ apiKey });

  // Map creativity (1-10) to temperature (0.2 to 1.8)
  const temperature = (creativity / 10) * 1.6 + 0.2;

  const prompt = `
당신은 '아토젯(Atojet)' 필터 샤워기 브랜드의 수석 디자이너이자 크리에이티브 디렉터입니다.
부하 디자이너들에게 프로모션 웹페이지/배너 디자인 작업을 지시하기 위한 기획안(콘티)을 작성해야 합니다.

[입력 정보]
- 프로모션 기간/시즌: ${period}
- 강조할 제품 특징: ${features}
- 창의력 수준: ${creativity}/10 (높을수록 파격적이고 독창적인 컨셉, 낮을수록 직관적이고 안정적인 컨셉)

[요청 사항]
디자이너들이 바로 작업에 착수할 수 있도록 구체적이고 시각적인 지시사항을 포함하여 아래 JSON 형식으로 응답해주세요.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      temperature,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          promotionName: {
            type: Type.STRING,
            description: "프로모션의 매력적인 타이틀",
          },
          conceptSummary: {
            type: Type.STRING,
            description: "전체적인 디자인 컨셉과 무드 (예: 깨끗하고 청량한 느낌, 고급스러운 호텔 스파 느낌 등)",
          },
          layout: {
            type: Type.ARRAY,
            description: "웹페이지 또는 배너의 섹션별 레이아웃 구성",
            items: {
              type: Type.OBJECT,
              properties: {
                sectionName: { type: Type.STRING, description: "섹션 이름 (예: Hero, 특징 1, 리뷰 등)" },
                visualDescription: { type: Type.STRING, description: "디자이너가 그려야 할 시각적 요소 및 배치 설명" },
                copy: { type: Type.STRING, description: "해당 섹션에 들어갈 카피" }
              },
              required: ["sectionName", "visualDescription", "copy"]
            }
          },
          copywriting: {
            type: Type.OBJECT,
            properties: {
              mainCopy: { type: Type.STRING, description: "가장 크게 들어갈 메인 카피" },
              subCopy: { type: Type.STRING, description: "메인 카피를 보조하는 서브 카피" },
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "디자인에 참고할 핵심 키워드 3~5개"
              }
            },
            required: ["mainCopy", "subCopy", "keywords"]
          },
          directorNotes: {
            type: Type.STRING,
            description: "디자이너에게 전하는 팀장의 특별 지시사항이나 주의점 (말투는 프로페셔널하고 명확하게)"
          }
        },
        required: ["promotionName", "conceptSummary", "layout", "copywriting", "directorNotes"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
