// Gemini temporariamente desabilitado para teste de autenticação
// import { GoogleGenAI, Type } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface NotebookAnalysis {
  name: string;
  description: string;
  category: string;
  tags: string[];
}

export async function analyzeNotebookCode(codeSnippet: string): Promise<NotebookAnalysis> {
  console.warn("🔧 Gemini desabilitado - Modo de teste");
  
  // Retorna dados padrão sem chamar a API
  return {
    name: "Notebook do Google Colab",
    description: "Notebook importado via link. Conecte a API do Gemini para análise automática.",
    category: "Geral",
    tags: ["colab", "importado"]
  };
}

export interface BatchReorganizationUpdate {
  notebookId: string;
  category: string;
  name: string;
}

export async function reorganizeAllCategories(notebooks: { id: string, name: string, description: string, category: string }[]): Promise<BatchReorganizationUpdate[]> {
  console.warn("🔧 Gemini desabilitado - Modo de teste");
  
  // Retorna array vazio sem chamar a API
  return [];
}