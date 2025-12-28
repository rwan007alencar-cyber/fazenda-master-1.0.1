
import { GoogleGenAI } from "@google/genai";
import { GameState } from "../types";

export const getFarmAdvice = async (state: GameState) => {
  try {
    // Inicializa dentro da função para garantir que o process.env esteja disponível
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Como um consultor agrícola experiente no Brasil, analise minha fazenda atual:
      - Dinheiro: R$ ${state.money}
      - Nível: ${state.level}
      - Funcionários: ${state.staffCount}
      - Máquinas: ${state.machineryCount}
      
      Dê uma dica curta e estratégica (máximo 2 parágrafos) em português do Brasil sobre o que eu deveria focar agora para crescer minha produção.`,
      config: {
        systemInstruction: "Você é o 'AgroConsultor AI', um assistente especializado em gestão de agronegócio no Brasil.",
      }
    });
    return response.text || "Continue plantando e investindo em tecnologia para maximizar seus lucros.";
  } catch (error) {
    console.error("Erro ao obter conselho da IA:", error);
    return "O mercado está instável hoje, mantenha o foco na colheita!";
  }
};
