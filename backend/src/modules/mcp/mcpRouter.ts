
import { Router } from 'express';
import { askMcpController } from './mcpService';

const mcpRouter = Router();

mcpRouter.post('/ask', askMcpController);

export default mcpRouter;
