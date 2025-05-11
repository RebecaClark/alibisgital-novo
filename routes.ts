import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import express from "express";
import { insertEmotionalEvaluationSchema, insertFaceAnalysisSchema, insertAlibiSchema } from "@shared/schema";
import { ZodError } from "zod";
import dotenv from 'dotenv';
import * as fs from 'fs';

// Carregar variáveis de ambiente
dotenv.config();

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // User routes
  apiRouter.post('/users', async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  });
  
  // Emotional Evaluation routes
  apiRouter.post('/emotional-evaluations', async (req: Request, res: Response) => {
    try {
      const validatedData = insertEmotionalEvaluationSchema.parse(req.body);
      const evaluation = await storage.createEmotionalEvaluation(validatedData);
      res.status(201).json(evaluation);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Invalid data format', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create emotional evaluation' });
      }
    }
  });
  
  apiRouter.get('/emotional-evaluations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const evaluation = await storage.getEmotionalEvaluation(id);
      if (!evaluation) {
        return res.status(404).json({ error: 'Emotional evaluation not found' });
      }
      res.json(evaluation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve emotional evaluation' });
    }
  });
  
  // Face Analysis routes
  apiRouter.post('/face-analyses', async (req, res) => {
    try {
      const validatedData = insertFaceAnalysisSchema.parse(req.body);
      const analysis = await storage.createFaceAnalysis(validatedData);
      res.status(201).json(analysis);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Invalid data format', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create face analysis' });
      }
    }
  });
  
  apiRouter.get('/face-analyses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getFaceAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ error: 'Face analysis not found' });
      }
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve face analysis' });
    }
  });
  
  // Alibi routes
  apiRouter.post('/alibis', async (req, res) => {
    try {
      const validatedData = insertAlibiSchema.parse(req.body);
      const alibi = await storage.createAlibi(validatedData);
      res.status(201).json(alibi);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Invalid data format', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create alibi' });
      }
    }
  });
  
  apiRouter.get('/alibis/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alibi = await storage.getAlibi(id);
      if (!alibi) {
        return res.status(404).json({ error: 'Alibi not found' });
      }
      res.json(alibi);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve alibi' });
    }
  });
  
  // Mount API router
  app.use('/api', apiRouter);
  
  // Serve static files from the 'public' directory
  app.use(express.static('public'));
  
  // Criar diretório para arquivos gerados
  const dirPath = path.join(process.cwd(), 'public/screenshots');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const audioPath = path.join(process.cwd(), 'public/audios');
  if (!fs.existsSync(audioPath)) {
    fs.mkdirSync(audioPath, { recursive: true });
  }
  
  // Rota para gerar TTS (text-to-speech)
  apiRouter.post('/text-to-speech', async (req, res) => {
    try {
      const { text, voice_id } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Texto é obrigatório' });
      }
      
      // Salvar temporariamente como um arquivo de texto
      const fileName = `speech_${Date.now()}.txt`;
      const filePath = path.join(process.cwd(), 'public/audios', fileName);
      
      fs.writeFileSync(filePath, text);
      
      // Retornar uma URL para o arquivo (simulando TTS)
      res.json({ 
        success: true, 
        message: 'Para integração com a API do ElevenLabs, é necessário a chave de API',
        filePath: `/audios/${fileName}` 
      });
      
    } catch (error) {
      console.error('Erro ao gerar áudio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({ error: 'Erro ao processar requisição', details: errorMessage });
    }
  });
  
  // Rota para salvar capturas de tela
  apiRouter.post('/save-screenshot', async (req, res) => {
    try {
      const { base64Image } = req.body;
      
      if (!base64Image) {
        return res.status(400).json({ error: 'A imagem em base64 é obrigatória' });
      }
      
      // Remover cabeçalho da string base64 (ex: 'data:image/png;base64,')
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      
      // Gerar nome único para o arquivo
      const fileName = `screenshot_${Date.now()}.png`;
      const filePath = path.join(process.cwd(), 'public/screenshots', fileName);
      
      // Salvar a imagem como arquivo
      fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
      
      // Retornar URL da imagem
      const imageUrl = `/screenshots/${fileName}`;
      res.json({ success: true, imageUrl });
      
    } catch (error: any) {
      console.error('Erro ao salvar captura de tela:', error);
      res.status(500).json({ error: 'Erro ao processar requisição', details: error.message });
    }
  });
  
  // Route for the main page - serve index.html
  app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public/index.html'));
  });
  
  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
