const API_URL = 'http://localhost:3000/api';
let usuarioLogado = null;
let charts = []; // Array global para controlar os gráficos e não dar erro de sobreposição

// --- 1. LOGIN ---
const formLogin = document.getElementById('form-login');
if(formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            const res = await fetch(`${API_URL}/login`, { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ email, password }) 
            });
            const data = await res.json();
            if (res.ok) { 
                usuarioLogado = data.user; 
                iniciarSistema(); 
            } else { 
                alert(data.message || "Erro no login"); 
            }
        } catch (error) { console.error(error); alert("ERRO DE CONEXÃO"); }
    });
}

function iniciarSistema() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('sistema-principal').style.display = 'flex';
    document.getElementById('nome-usuario').innerText = `${usuarioLogado.nome} (${usuarioLogado.perfil})`;
    
    // MENUS
    const btnVistoria = document.getElementById('menu-vistoria');
    if (usuarioLogado.perfil === 'Aluno' || usuarioLogado.perfil === 'Professor') {
        btnVistoria.style.display = 'none';
    } else {
        btnVistoria.style.display = 'flex';
    }
    
    const btnSoftware = document.querySelector("li[onclick=\"showSection('software')\"]");
    if(btnSoftware) {
        if (usuarioLogado.perfil === 'Chefe' || usuarioLogado.perfil === 'Professor') {
            btnSoftware.style.display = 'flex';
            const pcField = document.getElementById('container-pc-especifico');
            if(pcField) pcField.style.display = 'block';
        } else {
            btnSoftware.style.display = 'none';
        }
    }

    const menuItems = document.querySelectorAll('.sidebar ul li');
    menuItems.forEach(li => {
        if(li.getAttribute('onclick') && li.getAttribute('onclick').includes("'historico'")) {
            li.onclick = () => { showSection('historico'); carregarHistorico(); };
        }
    });

    carregarListaEquipamentos();
    renderizarDashboard();
}

async function carregarListaEquipamentos() {
    try {
        const res = await fetch(`${API_URL}/equipamentos`);
        if(res.ok) {
            const equipamentos = await res.json();
            const select = document.getElementById('reserva-equip');
            if(select) {
                select.innerHTML = '<option value="">Selecione um equipamento...</option>';
                equipamentos.forEach(eq => { select.innerHTML += `<option value="${eq.id}">${eq.nome} (Pat: ${eq.patrimonio})</option>`; });
            }
        }
    } catch (error) { console.error("Erro lista equipamentos"); }
}

function getStatusBadge(status) {
    if (['Concluído', 'Concluída', 'Instalado', 'Aprovado'].includes(status)) {
        return `<span class="badge success"><i class="fas fa-check-circle"></i> ${status}</span>`;
    } else if (['Pendente', 'Aguardando', 'Em Andamento'].includes(status)) {
        if(status === 'Em Andamento') return `<span class="badge warning" style="background:#e0f2fe; color:#0284c7; border-color:#7dd3fc;"><i class="fas fa-tools"></i> ${status}</span>`;
        return `<span class="badge high"><i class="fas fa-clock"></i> ${status}</span>`;
    } else if (['Recusado'].includes(status)) {
        return `<span class="badge" style="background-color:#ef4444; color:white;"><i class="fas fa-times-circle"></i> ${status}</span>`;
    } else if (['Em Uso'].includes(status)) {
        return `<span class="badge warning" style="background-color:#fef3c7; color:#d97706;"><i class="fas fa-hand-holding"></i> ${status}</span>`;
    } else {
        return `<span class="badge warning"><i class="fas fa-info-circle"></i> ${status}</span>`;
    }
}

// --- DASHBOARD PRINCIPAL ATUALIZADO (COM GRÁFICOS) ---
async function renderizarDashboard() {
    showSection('dashboard-area');
    const area = document.getElementById('dashboard-area');
    if(!area) return;
    area.innerHTML = '';
    
    // Destroi gráficos antigos para não bugar
    charts.forEach(c => { if(c) c.destroy(); });
    charts = [];

    try {
        const [resChamados, resReservas, resSoftware] = await Promise.all([
            fetch(`${API_URL}/chamados`), fetch(`${API_URL}/reservas`), fetch(`${API_URL}/software`)
        ]);
        const chamados = await resChamados.json();
        const reservas = await resReservas.json();
        const softwares = await resSoftware.json();

        // 1. CHEFE (PAINEL DE GESTÃO COMPLETO)
        if (usuarioLogado.perfil === 'Chefe') {
            const pendenciasReserva = reservas.filter(r => ['Pendente', 'Aguardando'].includes(r.status));
            const pendenciasSoft = softwares.filter(s => s.status === 'Pendente');

            // HTML DO DASHBOARD
            area.innerHTML = `
                <h2>Painel de Gestão e Métricas</h2>
                
                <div class="kpi-row">
                    <div class="kpi-card" style="border-left-color:#3b82f6">
                        <div class="kpi-title">Total de Chamados</div>
                        <div class="kpi-value">${chamados.length}</div>
                    </div>
                    <div class="kpi-card" style="border-left-color:#ef4444">
                        <div class="kpi-title">Reservas Pendentes</div>
                        <div class="kpi-value">${pendenciasReserva.length}</div>
                    </div>
                    <div class="kpi-card" style="border-left-color:#8b5cf6">
                        <div class="kpi-title">Softwares Pendentes</div>
                        <div class="kpi-value">${pendenciasSoft.length}</div>
                    </div>
                    <div class="kpi-card" style="border-left-color:#10b981">
                        <div class="kpi-title">Equipamentos em Uso</div>
                        <div class="kpi-value">${reservas.filter(r => r.status === 'Em Uso').length}</div>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <div class="chart-card">
                        <div class="chart-header">Status das Reservas</div>
                        <div style="height:250px; display:flex; justify-content:center;">
                            <canvas id="chartReservas"></canvas>
                        </div>
                    </div>
                    <div class="chart-card">
                        <div class="chart-header">Chamados por Local (Top 5)</div>
                        <div style="height:250px;">
                            <canvas id="chartChamados"></canvas>
                        </div>
                    </div>
                </div>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top:20px;">
                    <div>
                        <h3>🚨 Aprovações Pendentes</h3>
                        ${criarTabelaReservas(pendenciasReserva, true)} 
                    </div>
                    <div>
                        <h3>💾 Softwares Pendentes</h3>
                        ${criarTabelaSoftware(pendenciasSoft, false)} 
                    </div>
                </div>

                <div style="margin-top:30px;">
                    <h3>📋 Chamados Recentes</h3>
                    ${criarTabelaChamados(chamados.slice(0, 5), true)}
                </div>
            `;
            
            // GERA OS GRÁFICOS APÓS O HTML EXISTIR
            setTimeout(() => gerarGraficosChefe(reservas, chamados), 100);

        } 
        // 2. PROFESSOR E ALUNO
        else if (usuarioLogado.perfil === 'Aluno' || usuarioLogado.perfil === 'Professor') {
            const meusC = chamados.filter(c => c.usuarioId === usuarioLogado.id);
            const meusR = reservas.filter(r => r.usuarioId === usuarioLogado.id && r.status !== 'Concluída');
            const meusS = softwares.filter(s => s.usuarioId === usuarioLogado.id); 

            let htmlSoftware = '';
            if (usuarioLogado.perfil === 'Professor') {
                htmlSoftware = `<div style="margin-top:40px;"><h3>💾 Minhas Solicitações de Software</h3>${criarTabelaSoftware(meusS, false)}</div>`;
            }

            area.innerHTML = `
                <div class="kpi-row">
                    <div class="kpi-card" style="border-left-color:#2563eb"><div class="kpi-title">Meus Chamados</div><div class="kpi-value">${meusC.length}</div></div>
                    <div class="kpi-card" style="border-left-color:#10b981"><div class="kpi-title">Reservas Ativas</div><div class="kpi-value">${meusR.length}</div></div>
                </div>
                ${htmlSoftware}
                <div style="margin-top:40px;"><h3>📦 Minhas Reservas</h3>${criarTabelaReservas(meusR, false)}</div>
                <div style="margin-top:40px;"><h3>🔧 Meus Chamados</h3>${criarTabelaChamados(meusC, false)}</div>
            `;
        } 
        // 3. ESTAGIÁRIO (STAFF)
        else {
            const chamadosPendentes = chamados.filter(c => c.status !== 'Concluído');
            const reservasVistoria = reservas.filter(r => ['Aprovado', 'Em Uso'].includes(r.status));
            const softwarePendente = softwares.filter(s => s.status === 'Pendente');

            area.innerHTML = `
                <h2>Fila de Atendimento</h2>
                <div class="kpi-row">
                    <div class="kpi-card"><div class="kpi-title">Chamados na Fila</div><div class="kpi-value">${chamadosPendentes.length}</div></div>
                    <div class="kpi-card" style="border-left-color:#f59e0b"><div class="kpi-title">Vistorias</div><div class="kpi-value">${reservasVistoria.length}</div></div>
                    <div class="kpi-card" style="border-left-color:#8b5cf6"><div class="kpi-title">Softwares a Instalar</div><div class="kpi-value">${softwarePendente.length}</div></div>
                </div>
                
                <div style="margin-top:40px;"><h3>💾 Instalação de Software (A Fazer)</h3>${criarTabelaSoftware(softwarePendente, true)}</div>
                <div style="margin-top:40px;"><h3>🚨 Chamados Técnicos</h3>${criarTabelaChamados(chamadosPendentes, true)}</div>
                <div style="margin-top:40px;"><h3>📦 Saída/Retorno (Vistorias)</h3>${criarTabelaReservas(reservasVistoria, true)}</div>
            `;
        }
    } catch (e) { console.error(e); }
}

// --- FUNÇÃO PARA GERAR GRÁFICOS (Chart.js) ---
function gerarGraficosChefe(reservas, chamados) {
    if(typeof Chart === 'undefined') return;

    // 1. DADOS PARA GRÁFICO DE RESERVAS (Pizza)
    const statusCounts = { 'Pendente': 0, 'Aprovado': 0, 'Em Uso': 0, 'Concluída': 0, 'Recusado': 0 };
    reservas.forEach(r => {
        // Normaliza status (Aguardando vira Pendente)
        let st = r.status === 'Aguardando' ? 'Pendente' : r.status;
        if (statusCounts[st] !== undefined) statusCounts[st]++;
        else if (st === 'Concluído') statusCounts['Concluída']++; // Ajuste plural
    });

    const ctx1 = document.getElementById('chartReservas').getContext('2d');
    charts.push(new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['Pendente', 'Aprovado', 'Em Uso', 'Concluída', 'Recusado'],
            datasets: [{
                data: [statusCounts.Pendente, statusCounts.Aprovado, statusCounts['Em Uso'], statusCounts.Concluída, statusCounts.Recusado],
                backgroundColor: ['#f59e0b', '#3b82f6', '#d97706', '#10b981', '#ef4444'],
                borderWidth: 1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
    }));

    // 2. DADOS PARA GRÁFICO DE CHAMADOS (Barras por Local)
    const locaisCount = {};
    chamados.forEach(c => {
        locaisCount[c.local] = (locaisCount[c.local] || 0) + 1;
    });
    // Ordenar e pegar top 5
    const locaisSorted = Object.entries(locaisCount).sort((a,b) => b[1] - a[1]).slice(0, 5);
    
    const ctx2 = document.getElementById('chartChamados').getContext('2d');
    charts.push(new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: locaisSorted.map(i => i[0]),
            datasets: [{
                label: 'Chamados',
                data: locaisSorted.map(i => i[1]),
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    }));
}

// --- TABELAS ---

function criarTabelaSoftware(lista, isStaff) {
    if (lista.length === 0) return '<div style="padding:20px; border:1px solid #e2e8f0; border-radius:8px; text-align:center; color:#64748b;">Nenhuma solicitação de software.</div>';
    let html = `<div class="table-responsive"><table class="data-table"><thead><tr><th>Software</th><th>Local</th><th>Prazo</th><th>Solicitante</th><th>Status</th>${isStaff ? '<th style="text-align:right">Ação</th>' : ''}</tr></thead><tbody>`;
    lista.forEach(s => {
        const prazo = new Date(s.dataLimite).toLocaleDateString();
        let btn = isStaff ? `<button class="btn-sm" style="background-color:var(--success); color:white; border:none;" onclick="concluirSoftware(${s.id})">✔ Instalado</button>` : '';
        html += `<tr><td><strong>${s.nome}</strong></td><td>${s.labsDestino}</td><td>${prazo}</td><td>${s.usuario ? s.usuario.nome : 'Desconhecido'}</td><td>${getStatusBadge(s.status)}</td>${isStaff ? `<td style="text-align:right">${btn}</td>` : ''}</tr>`;
    });
    return html + `</tbody></table></div>`;
}

function criarTabelaChamados(lista, isStaff) {
    if (lista.length === 0) return '<div style="padding:20px; border:1px solid #e2e8f0; border-radius:8px; text-align:center; color:#64748b;">Nenhum chamado aberto.</div>';
    let html = `<div class="table-responsive"><table class="data-table"><thead><tr><th>Local</th><th>Problema</th><th>Status</th>${isStaff ? '<th style="text-align:right">Ação</th>' : ''}</tr></thead><tbody>`;
    lista.forEach(c => {
        let btn = isStaff ? `<button class="btn-action" onclick='abrirModalChamado(${JSON.stringify(c).replace(/"/g, '&quot;')})'>Ver</button>` : '';
        html += `<tr><td><span style="font-weight:600; color:var(--primary)">${c.local}</span></td><td style="max-width:300px;">${c.descricao}</td><td>${getStatusBadge(c.status)}</td>${isStaff ? `<td style="text-align:right">${btn}</td>` : ''}</tr>`;
    });
    return html + `</tbody></table></div>`;
}

function criarTabelaReservas(lista, showActions) {
    if (lista.length === 0) return '<div style="padding:20px; border:1px solid #e2e8f0; border-radius:8px; text-align:center; color:#64748b;">Nenhum registro.</div>';
    let html = `<div class="table-responsive"><table class="data-table"><thead><tr><th>ID</th><th>Equipamento</th><th>Solicitante</th><th>Datas</th><th>Status</th><th style="text-align:right">Ação</th></tr></thead><tbody>`;
    lista.forEach(r => {
        let btn = '';
        const dataFmt = `${new Date(r.dataRetirada).toLocaleDateString()} - ${new Date(r.dataDevolucao).toLocaleDateString()}`;
        if (usuarioLogado.perfil === 'Chefe' && (r.status === 'Pendente' || r.status === 'Aguardando')) {
            btn = `<button class="btn-sm" style="background-color:#10b981; color:white; border:none; margin-right:5px;" onclick="avaliarReserva(${r.id}, 'Aprovado')">✅</button><button class="btn-sm" style="background-color:#ef4444; color:white; border:none;" onclick="avaliarReserva(${r.id}, 'Recusado')">❌</button>`;
        } else if (usuarioLogado.perfil === 'Estagiario' && (r.status === 'Aprovado' || r.status === 'Em Uso')) {
             btn = `<button class="btn-action" onclick="irParaVistoria('${r.equipamento?.patrimonio}')">🔎 Vistoriar</button>`;
        } else if (r.status === 'Recusado') {
            btn = `<small style="color:#ef4444">${r.justificativa || ''}</small>`;
        }
        html += `<tr><td><strong>#${r.id}</strong></td><td>${r.equipamento ? r.equipamento.nome : '?'}</td><td>${r.usuario ? r.usuario.nome : 'Eu'}</td><td style="font-size:0.9em">${dataFmt}</td><td>${getStatusBadge(r.status)}</td><td style="text-align:right">${btn}</td></tr>`;
    });
    return html + `</tbody></table></div>`;
}

// --- AÇÕES DO SISTEMA ---
async function concluirSoftware(id) {
    if(!confirm("Confirmar instalação realizada?")) return;
    await fetch(`${API_URL}/software/${id}/status`, {
        method: 'PUT', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ status: 'Instalado' })
    });
    alert("Software marcado como instalado!");
    renderizarDashboard();
}

async function avaliarReserva(id, status) {
    let justificativa = '';
    if (status === 'Recusado') {
        justificativa = prompt("Motivo:");
        if (!justificativa) return;
    }
    await fetch(`${API_URL}/reservas/${id}/analise`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, justificativa }) });
    alert("Salvo!"); renderizarDashboard();
}
window.avaliarReserva = avaliarReserva;

// MODAL DE CHAMADOS
window.abrirModalChamado = (chamado) => {
    const modal = document.getElementById('modal-chamado');
    document.getElementById('modal-id').innerText = chamado.id;
    document.getElementById('modal-local').innerText = chamado.local;
    document.getElementById('modal-solicitante').innerText = chamado.usuario ? chamado.usuario.nome : 'Desconhecido';
    document.getElementById('modal-desc').innerText = chamado.descricao;
    document.getElementById('modal-status').innerHTML = getStatusBadge(chamado.status);
    
    const actionsDiv = document.getElementById('modal-actions');
    actionsDiv.innerHTML = `<button class="btn-sm" onclick="fecharModal()">Fechar</button>`;

    if (chamado.status === 'Pendente') {
        actionsDiv.innerHTML += `<button class="btn-primary" style="width:auto; margin-left:10px;" onclick="atualizarStatusChamado(${chamado.id}, 'Em Andamento')">Assumir</button>`;
    } else if (chamado.status === 'Em Andamento') {
        actionsDiv.innerHTML += `<button class="btn-primary" style="width:auto; margin-left:10px; background-color:var(--success)" onclick="atualizarStatusChamado(${chamado.id}, 'Concluído')">Concluir</button>`;
    }
    modal.style.display = "block";
};
window.fecharModal = () => document.getElementById('modal-chamado').style.display = "none";
window.onclick = (e) => { if(e.target == document.getElementById('modal-chamado')) window.fecharModal(); };

async function atualizarStatusChamado(id, status) { 
    await fetch(`${API_URL}/chamados/${id}/status`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status})}); 
    alert("Chamado atualizado!"); fecharModal(); renderizarDashboard(); 
}
window.atualizarStatusChamado = atualizarStatusChamado;

// VISTORIA E NAVEGAÇÃO
window.irParaVistoria = (pat) => { showSection('vistoria'); document.getElementById('vistoria-patrimonio').value = pat; buscarPorPatrimonio(); };
window.showSection = (id) => { document.querySelectorAll('.container').forEach(e=>e.style.display='none'); document.getElementById(id).style.display='block'; };
window.logout = () => location.reload();
window.irParaInicio = () => renderizarDashboard();
async function buscarPorPatrimonio() {
    const pat = document.getElementById('vistoria-patrimonio').value;
    const res = await fetch(`${API_URL}/reservas/patrimonio/${pat}`);
    const data = await res.json();
    if(res.ok) { document.getElementById('vistoria-info').value = `Reserva #${data.id} - ${data.equipamento.nome}`; document.getElementById('vistoria-reserva-id-oculto').value = data.id; document.getElementById('btn-salvar-vistoria').disabled=false; }
    else alert(data.message);
}
window.buscarPorPatrimonio = buscarPorPatrimonio;

// HISTORICO
async function carregarHistorico() {
    const area = document.getElementById('tabela-historico');
    if(!area) return; 
    area.innerHTML = '<p>Carregando...</p>';
    try {
        const [resChamados, resReservas, resSoftware] = await Promise.all([
            fetch(`${API_URL}/chamados`), fetch(`${API_URL}/reservas`), fetch(`${API_URL}/software`)
        ]);
        const chamados = await resChamados.json();
        const reservas = await resReservas.json();
        const softwares = await resSoftware.json();
        let itens = [];
        reservas.forEach(r => {
            if ((usuarioLogado.perfil === 'Aluno' || usuarioLogado.perfil === 'Professor') && r.usuarioId !== usuarioLogado.id) return;
            itens.push({ data: new Date(r.dataRetirada), tipo: 'Reserva', descricao: `Item: ${r.equipamento?.nome}`, status: r.status });
        });
        chamados.forEach(c => {
            if ((usuarioLogado.perfil === 'Aluno' || usuarioLogado.perfil === 'Professor') && c.usuarioId !== usuarioLogado.id) return;
            itens.push({ data: new Date(c.createdAt), tipo: 'Chamado', descricao: `Local: ${c.local} - ${c.descricao}`, status: c.status });
        });
        softwares.forEach(s => {
             if ((usuarioLogado.perfil === 'Aluno' || usuarioLogado.perfil === 'Professor') && s.usuarioId !== usuarioLogado.id) return;
             itens.push({ data: new Date(s.createdAt), tipo: 'Software', descricao: `Install: ${s.nome} em ${s.labsDestino}`, status: s.status });
        });
        itens.sort((a, b) => b.data - a.data);
        let html = `<div class="table-responsive"><table class="data-table"><thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Status</th></tr></thead><tbody>`;
        itens.forEach(item => {
            html += `<tr><td>${item.data.toLocaleDateString()}</td><td><span class="badge info">${item.tipo}</span></td><td>${item.descricao}</td><td>${getStatusBadge(item.status)}</td></tr>`;
        });
        area.innerHTML = html + `</tbody></table></div>`;
    } catch (error) { area.innerHTML = '<p>Erro.</p>'; }
}

// ENVIO DE FORMS
document.getElementById('form-chamado').addEventListener('submit', (e) => { e.preventDefault(); enviarForm('/chamados', { local: document.getElementById('chamado-local').value, descricao: document.getElementById('chamado-desc').value, usuarioId: usuarioLogado.id }, 'Chamado Aberto'); });
document.getElementById('form-reserva').addEventListener('submit', async (e) => { e.preventDefault(); await enviarForm('/reservas', { equipamentoId: document.getElementById('reserva-equip').value, dataRetirada: document.getElementById('reserva-retirada').value, dataDevolucao: document.getElementById('reserva-devolucao').value, usuarioId: usuarioLogado.id }, 'Reserva Criada!'); });
document.getElementById('form-software').addEventListener('submit', (e) => { 
    e.preventDefault(); 
    const lab = document.getElementById('soft-labs').value; 
    const pc = document.getElementById('soft-pc')?.value || ''; 
    enviarForm('/software', { 
        nome: document.getElementById('soft-nome').value, 
        labsDestino: pc ? `${lab} - ${pc}` : lab, 
        dataLimite: document.getElementById('soft-data').value,
        usuarioId: usuarioLogado.id
    }, 'Solicitação Enviada'); 
});
document.getElementById('form-vistoria').addEventListener('submit', async (e) => { e.preventDefault(); alert("Vistoria enviada (Simulação)"); });
async function enviarForm(ep, pl, msg) { await fetch(`${API_URL}${ep}`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(pl)}); alert(msg); renderizarDashboard(); }

// --- FUNÇÃO DE RELATÓRIO PDF RESTAURADA ---
window.gerarRelatorioPDF = async () => {
    if (!window.jspdf) return alert("Erro: Biblioteca PDF não carregada. Verifique o index.html");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let finalY = 20;

    // Cabeçalho
    doc.setFillColor(41, 128, 185); 
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Relatório de Gestão - UTFPR Labs", 14, 20);
    
    finalY = 40;
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(10);
    doc.text(`Gerado por: ${usuarioLogado.nome} (${usuarioLogado.perfil})`, 14, finalY);
    doc.text(`Data de Emissão: ${new Date().toLocaleString()}`, 14, finalY + 5);
    finalY += 15;

    try {
        const [resReservas, resChamados, resSoftware] = await Promise.all([
            fetch(`${API_URL}/reservas`).then(r => r.json()),
            fetch(`${API_URL}/chamados`).then(r => r.json()),
            fetch(`${API_URL}/software`).then(r => r.json())
        ]);

        let dadosR = resReservas;
        let dadosC = resChamados;
        let dadosS = resSoftware;

        // Filtro se não for Chefe/Staff
        if (usuarioLogado.perfil === 'Aluno' || usuarioLogado.perfil === 'Professor') {
            dadosR = dadosR.filter(r => r.usuarioId === usuarioLogado.id);
            dadosC = dadosC.filter(c => c.usuarioId === usuarioLogado.id);
            dadosS = dadosS.filter(s => s.usuarioId === usuarioLogado.id);
        }

        // Tabela Chamados
        if (dadosC.length > 0) {
            doc.setFontSize(14); doc.setTextColor(192, 57, 43); 
            doc.text("1. Chamados Técnicos", 14, finalY);
            const rows = dadosC.map(c => [`#${c.id}`, c.local, c.descricao, c.status, c.usuario ? c.usuario.nome : 'N/A']);
            doc.autoTable({ startY: finalY + 5, head: [['ID', 'Local', 'Problema', 'Status', 'Solicitante']], body: rows, theme: 'grid', headStyles: { fillColor: [231, 76, 60] } });
            finalY = doc.lastAutoTable.finalY + 20;
        }

        // Tabela Reservas
        if (dadosR.length > 0) {
            doc.setFontSize(14); doc.setTextColor(41, 128, 185); 
            doc.text("2. Reservas de Equipamentos", 14, finalY);
            const rows = dadosR.map(r => [`#${r.id}`, r.equipamento?.nome || 'N/A', new Date(r.dataRetirada).toLocaleDateString(), r.status, r.usuario?.nome || 'N/A']);
            doc.autoTable({ startY: finalY + 5, head: [['ID', 'Equipamento', 'Data', 'Status', 'Solicitante']], body: rows, theme: 'grid', headStyles: { fillColor: [52, 152, 219] } });
            finalY = doc.lastAutoTable.finalY + 20;
        }
        
        // Tabela Software
        if (dadosS.length > 0) {
            doc.setFontSize(14); doc.setTextColor(142, 68, 173); 
            doc.text("3. Solicitações de Software", 14, finalY);
            const rows = dadosS.map(s => [s.nome, s.labsDestino, new Date(s.dataLimite).toLocaleDateString(), s.status, s.usuario?.nome || 'N/A']);
            doc.autoTable({ startY: finalY + 5, head: [['Software', 'Local', 'Prazo', 'Status', 'Solicitante']], body: rows, theme: 'grid', headStyles: { fillColor: [155, 89, 182] } });
            finalY = doc.lastAutoTable.finalY + 20;
        }
        
        doc.save(`Relatorio_Gestao_${Date.now()}.pdf`);

    } catch (e) { console.error(e); alert("Erro ao gerar relatório."); }
};