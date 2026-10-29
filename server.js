// server.js - Backend COMPLETO com Professor na Criação Automática
// Aumentando o limite global do corpo da requisição para suportar vídeos grandes
const fastify = require('fastify')({ 
    logger: true,
    bodyLimit: 104857600 // 100MB
});

const cors = require('@fastify/cors');
const multipart = require('@fastify/multipart');
const staticFiles = require('@fastify/static');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);

const prisma = new PrismaClient();

// CONFIGURAÇÃO DO CORS
fastify.register(cors, { 
    origin: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

// CONFIGURAÇÃO DE UPLOAD (MULTIPART)
fastify.register(multipart, {
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    }
});

// CRIA PASTA DE UPLOADS SE NÃO EXISTIR
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// SERVIR ARQUIVOS ESTÁTICOS
fastify.register(staticFiles, {
    root: path.join(__dirname, 'uploads'),
    prefix: '/uploads/',
});

fastify.get('/', async () => { return { status: 'online' } });

// --- LOGIN ---
fastify.post('/api/login', async (req, reply) => {
    const { email, password } = req.body;
    const user = await prisma.usuario.findUnique({ where: { email } });
    
    if (user && user.senha === password) {
        return { success: true, user };
    }
    return reply.code(401).send({ message: "Login inválido" });
});

// --- CHAMADOS ---
fastify.post('/api/chamados', async (req) => {
    const { local, descricao, usuarioId } = req.body;
    return await prisma.chamado.create({
        data: { local, descricao, usuarioId: Number(usuarioId), status: 'Pendente' }
    });
});

fastify.get('/api/chamados', async () => {
    return await prisma.chamado.findMany({ 
        orderBy: { createdAt: 'desc' }, include: { usuario: true } 
    });
});

fastify.put('/api/chamados/:id/status', async (req, reply) => {
    const { id } = req.params;
    const { status } = req.body;
    return await prisma.chamado.update({
        where: { id: Number(id) },
        data: { status }
    });
});

// --- EQUIPAMENTOS ---
fastify.get('/api/equipamentos', async () => {
    return await prisma.equipamento.findMany({ orderBy: { nome: 'asc' } });
});

// --- RESERVAS ---

// Criar nova reserva
fastify.post('/api/reservas', async (req) => {
    const { equipamentoId, dataRetirada, dataDevolucao, usuarioId } = req.body;
    return await prisma.reserva.create({
        data: {
            equipamentoId: Number(equipamentoId),
            usuarioId: Number(usuarioId),
            dataRetirada: new Date(dataRetirada),
            dataDevolucao: new Date(dataDevolucao)
        }
    });
});

// Listar reservas
fastify.get('/api/reservas', async () => {
    return await prisma.reserva.findMany({ 
        orderBy: { id: 'desc' }, 
        include: { equipamento: true, usuario: true } 
    });
});

// Chefe Aprovar/Recusar Reserva
fastify.put('/api/reservas/:id/analise', async (req, reply) => {
    const { id } = req.params;
    const { status, justificativa } = req.body; 

    try {
        const reservaAtualizada = await prisma.reserva.update({
            where: { id: Number(id) },
            data: { 
                status: status,
                justificativa: justificativa || null 
            }
        });
        return reservaAtualizada;
    } catch (error) {
        console.error(error);
        return reply.code(500).send({ message: "Erro ao atualizar reserva." });
    }
});

// Buscar reserva ativa pelo patrimônio (para Vistoria)
fastify.get('/api/reservas/patrimonio/:codigo', async (req, reply) => {
    const { codigo } = req.params;
    const equipamento = await prisma.equipamento.findUnique({ where: { patrimonio: codigo } });
    if (!equipamento) return reply.code(404).send({ message: "Patrimônio não cadastrado." });
    
    const reserva = await prisma.reserva.findFirst({
        where: { 
            equipamentoId: equipamento.id, 
            status: { in: ['Aprovado', 'Em Uso'] } 
        },
        orderBy: { id: 'desc' }, 
        include: { equipamento: true, usuario: true }
    });
    
    if (!reserva) return reply.code(404).send({ message: "Nenhuma reserva aprovada ou ativa para este item." });
    return reserva;
});

// --- VISTORIA (UPLOAD) ---
fastify.post('/api/vistorias', async (req, reply) => {
    const parts = req.parts();
    let midiaUrl = '';
    let tipo = '';
    let reservaId = '';
    
    for await (const part of parts) {
        if (part.file) {
            const filename = `${Date.now()}_${part.filename}`;
            await pump(part.file, fs.createWriteStream(`./uploads/${filename}`));
            midiaUrl = `/uploads/${filename}`;
        } else {
            if (part.fieldname === 'tipo') tipo = part.value;
            if (part.fieldname === 'reservaId') reservaId = part.value;
        }
    }
    
    const vistoria = await prisma.vistoria.create({ data: { tipo, reservaId: Number(reservaId), midiaUrl } });
    
    const novoStatus = (tipo === 'Retirada') ? 'Em Uso' : 'Concluída';
    await prisma.reserva.update({ where: { id: Number(reservaId) }, data: { status: novoStatus } });
    
    return vistoria;
});

// --- SOFTWARE ---
fastify.post('/api/software', async (req) => {
    const { nome, labsDestino, dataLimite, usuarioId } = req.body;
    return await prisma.softwareRequest.create({
        data: { 
            nome, 
            labsDestino, 
            dataLimite: new Date(dataLimite), 
            status: "Pendente",
            usuarioId: Number(usuarioId)
        }
    });
});

fastify.get('/api/software', async () => {
    return await prisma.softwareRequest.findMany({ 
        orderBy: { id: 'desc' },
        include: { usuario: true } 
    });
});

fastify.put('/api/software/:id/status', async (req, reply) => {
    const { id } = req.params;
    const { status } = req.body;
    return await prisma.softwareRequest.update({
        where: { id: Number(id) },
        data: { status }
    });
});

// --- POPULAR BANCO (SEED) ---
async function popularBancoSeVazio() {
    const count = await prisma.usuario.count();
    if (count === 0) {
        console.log("Criando dados iniciais...");
        await prisma.usuario.createMany({
            data: [
                { nome: "Lenon Aluno", email: "lenon@alunos.utfpr.edu.br", senha: "123", perfil: "Aluno" },
                { nome: "Carlos Staff", email: "suporte@utfpr.edu.br", senha: "123", perfil: "Estagiario" },
                { nome: "Chefe Silva", email: "chefe@utfpr.edu.br", senha: "123", perfil: "Chefe" },
                // ADICIONADO: PROFESSOR PADRÃO
                { nome: "João Paulo", email: "prof@utfpr.edu.br", senha: "123", perfil: "Professor" }
            ]
        });
        
        const equipamentos = [];
        for (let i = 1; i <= 13; i++) equipamentos.push({ nome: `MacBook Pro M1 (Unidade ${i})`, tipo: "Notebook", patrimonio: `MB-10${i.toString().padStart(2, '0')}` });
        
        const drones = [{ modelo: "DJI Mavic Air 2", qtd: 4, prefix: "MV" }, { modelo: "DJI Mini 2", qtd: 4, prefix: "MN" }, { modelo: "DJI Mini SE", qtd: 3, prefix: "MS" }, { modelo: "Ryze Tello EDU", qtd: 4, prefix: "TL" }];
        let dIndex = 1;
        drones.forEach(d => { for (let i = 1; i <= d.qtd; i++) { equipamentos.push({ nome: `${d.modelo} #${i}`, tipo: "Drone", patrimonio: `DR-${d.prefix}-${100 + dIndex}` }); dIndex++; } });
        
        equipamentos.push({ nome: "Smart TV 43\" 4K Samsung", tipo: "Audiovisual", patrimonio: "TV-2023" }, { nome: "PC Gamer i7 RTX 3060", tipo: "Desktop", patrimonio: "PC-GAMER-01" });
        for (let i = 1; i <= 10; i++) equipamentos.push({ nome: `Kit Arduino Uno R3 (Caixa ${i})`, tipo: "Eletrônica", patrimonio: `ARD-50${i}` });
        
        await prisma.equipamento.createMany({ data: equipamentos });
    }
}

const start = async () => {
    try {
        await popularBancoSeVazio();
        await fastify.listen({ port: 3000 });
        console.log('SERVIDOR RODANDO EM: http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();