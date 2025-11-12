// Estado do questionário
let currentQuestion = 1;
const totalQuestions = 15;
let answeredQuestions = new Set(); // Rastrear quais perguntas já foram respondidas

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Setup dashboard
    setupDashboard();
    
    // Controlar overlay inicial
    const btnConfirm = document.getElementById('btnConfirm');
    const initialOverlay = document.getElementById('initial-overlay');
    const mainContent = document.getElementById('mainContent');
    
    if (btnConfirm && initialOverlay && mainContent) {
        btnConfirm.addEventListener('click', function() {
            initialOverlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                initialOverlay.style.display = 'none';
                mainContent.style.display = 'flex';
                updateProgress();
                setupEventListeners();
                showQuestion(1);
                // Mostrar botão mobile se estiver em mobile
                const mobileBtn = document.getElementById('mobileDashboardBtn');
                if (mobileBtn && window.innerWidth <= 768) {
                    mobileBtn.style.display = 'flex';
                }
            }, 300);
        });
    } else {
        // Se não houver overlay, inicializar normalmente
        updateProgress();
        setupEventListeners();
        showQuestion(1);
        // Mostrar botão mobile se estiver em mobile
        const mobileBtn = document.getElementById('mobileDashboardBtn');
        if (mobileBtn && window.innerWidth <= 768) {
            mobileBtn.style.display = 'flex';
        }
    }
});

// Mostrar pergunta específica
function showQuestion(num) {
    // Esconder todas as perguntas
    document.querySelectorAll('.question-slide').forEach(slide => {
        slide.classList.remove('active');
    });

    // Mostrar pergunta atual
    const questionSlide = document.querySelector(`[data-question="${num}"]`);
    if (questionSlide) {
        questionSlide.classList.add('active');
        
        // Garantir que nenhum input da pergunta anterior esteja com foco
        document.querySelectorAll('input:focus').forEach(input => {
            input.blur();
        });
        
        // Se a pergunta ainda não foi respondida, garantir que nenhum input esteja marcado
        if (!answeredQuestions.has(num)) {
            // Desmarcar todos os radios da pergunta
            const allRadiosInSlide = questionSlide.querySelectorAll('input[type="radio"]');
            allRadiosInSlide.forEach(radio => {
                radio.checked = false;
            });
            
            // Desmarcar todos os checkboxes da pergunta
            const allCheckboxesInSlide = questionSlide.querySelectorAll('input[type="checkbox"]');
            allCheckboxesInSlide.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
    }

    // Atualizar botões de navegação
    updateNavigationButtons();
    updateProgress();
}

// Atualizar botões de navegação
function updateNavigationButtons() {
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnSubmit = document.getElementById('btnSubmit');

    // Botão Anterior
    if (currentQuestion === 1) {
        btnPrev.style.display = 'none';
    } else {
        btnPrev.style.display = 'block';
    }

    // Botão Próxima/Enviar
    if (currentQuestion === totalQuestions) {
        btnNext.style.display = 'none';
        btnSubmit.style.display = 'block';
    } else {
        btnNext.style.display = 'block';
        btnSubmit.style.display = 'none';
    }
}

// Atualizar barra de progresso
function updateProgress() {
    const progress = (currentQuestion / totalQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('currentQuestion').textContent = currentQuestion;
    document.getElementById('totalQuestions').textContent = totalQuestions;
}

// Event Listeners
let eventListenersSetup = false;

function setupEventListeners() {
    // Evitar adicionar listeners múltiplas vezes
    if (eventListenersSetup) return;
    eventListenersSetup = true;
    
    // Botão Anterior
    document.getElementById('btnPrev').addEventListener('click', () => {
        if (currentQuestion > 1) {
            currentQuestion--;
            showQuestion(currentQuestion);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // Botão Próxima
    document.getElementById('btnNext').addEventListener('click', () => {
        if (validateCurrentQuestion()) {
            if (currentQuestion < totalQuestions) {
                currentQuestion++;
                showQuestion(currentQuestion);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

    // Botão Enviar
    document.getElementById('btnSubmit').addEventListener('click', (e) => {
        e.preventDefault();
        if (validateCurrentQuestion() && validateAllQuestions()) {
            submitForm();
        }
    });

    // Auto-avançar quando selecionar uma opção (apenas para radio buttons)
    // Usar event delegation para evitar múltiplos listeners
    const form = document.getElementById('questionarioForm');
    if (form && !form.hasAttribute('data-auto-advance-setup')) {
        form.setAttribute('data-auto-advance-setup', 'true');
        form.addEventListener('change', function(e) {
            const questionSlide = e.target.closest('.question-slide');
            if (questionSlide) {
                const questionNum = parseInt(questionSlide.dataset.question);
                
                // Marcar a pergunta como respondida
                if (e.target.type === 'radio' && e.target.checked) {
                    answeredQuestions.add(questionNum);
                } else if (e.target.type === 'checkbox') {
                    // Para checkboxes, verificar se pelo menos um está marcado
                    const checkboxes = questionSlide.querySelectorAll('input[type="checkbox"]');
                    const hasChecked = Array.from(checkboxes).some(cb => cb.checked);
                    if (hasChecked) {
                        answeredQuestions.add(questionNum);
                    } else {
                        answeredQuestions.delete(questionNum);
                    }
                }
                
                // Auto-avançar apenas para radio buttons
                if (e.target.type === 'radio' && e.target.checked) {
                    if (questionSlide.classList.contains('active')) {
                        // Verificar se é a pergunta atual antes de avançar
                        if (questionNum === currentQuestion) {
                            // Pequeno delay para melhor UX
                            setTimeout(() => {
                                if (currentQuestion < totalQuestions) {
                                    currentQuestion++;
                                    showQuestion(currentQuestion);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }, 600);
                        }
                    }
                }
            }
        });
    }

    // Campos "Outro"
    setupOutroFields();
}

// Configurar campos "Outro"
function setupOutroFields() {
    // Cargo
    const cargoOutroRadio = document.getElementById('cargo-outro-radio');
    const cargoOutroWrapper = document.getElementById('cargo-outro-wrapper');
    const cargoOutroText = document.getElementById('cargo-outro-text');

    if (cargoOutroRadio) {
        cargoOutroRadio.addEventListener('change', function() {
            if (this.checked) {
                cargoOutroWrapper.style.display = 'block';
                cargoOutroText.required = true;
            } else {
                cargoOutroWrapper.style.display = 'none';
                cargoOutroText.required = false;
                cargoOutroText.value = '';
            }
        });

        // Esconder quando outro cargo for selecionado
        document.querySelectorAll('input[name="cargo"]').forEach(radio => {
            if (radio.value !== 'Outro') {
                radio.addEventListener('change', function() {
                    if (this.checked) {
                        cargoOutroWrapper.style.display = 'none';
                        cargoOutroText.required = false;
                        cargoOutroText.value = '';
                    }
                });
            }
        });
    }

    // Setor
    const setorOutroRadio = document.getElementById('setor-outro-radio');
    const setorOutroWrapper = document.getElementById('setor-outro-wrapper');
    const setorOutroText = document.getElementById('setor-outro-text');

    if (setorOutroRadio) {
        setorOutroRadio.addEventListener('change', function() {
            if (this.checked) {
                setorOutroWrapper.style.display = 'block';
                setorOutroText.required = true;
            } else {
                setorOutroWrapper.style.display = 'none';
                setorOutroText.required = false;
                setorOutroText.value = '';
            }
        });

        // Esconder quando outro setor for selecionado
        document.querySelectorAll('input[name="setor"]').forEach(radio => {
            if (radio.value !== 'Outro') {
                radio.addEventListener('change', function() {
                    if (this.checked) {
                        setorOutroWrapper.style.display = 'none';
                        setorOutroText.required = false;
                        setorOutroText.value = '';
                    }
                });
            }
        });
    }
}

// Validar pergunta atual
function validateCurrentQuestion() {
    const currentSlide = document.querySelector(`[data-question="${currentQuestion}"].active`);
    if (!currentSlide) return true;

    // Verificar se é pergunta de checkbox (9 ou 12)
    if (currentQuestion === 9) {
        const checked = currentSlide.querySelectorAll('input[name="riscos-relevantes"]:checked');
        if (checked.length === 0) {
            showError('Por favor, selecione pelo menos um risco relevante.');
            return false;
        }
    } else if (currentQuestion === 12) {
        const checked = currentSlide.querySelectorAll('input[name="medidas-eficazes"]:checked');
        if (checked.length === 0) {
            showError('Por favor, selecione pelo menos uma medida eficaz.');
            return false;
        }
    } else {
        // Verificar radio buttons obrigatórios
        const requiredRadio = currentSlide.querySelector('input[type="radio"][required]');
        if (requiredRadio) {
            const name = requiredRadio.name;
            const checked = currentSlide.querySelector(`input[name="${name}"]:checked`);
            if (!checked) {
                showError('Por favor, selecione uma opção antes de continuar.');
                return false;
            }

            // Validar campo "Outro" se necessário
            if (checked.value === 'Outro') {
                if (name === 'cargo') {
                    const outroText = document.getElementById('cargo-outro-text');
                    if (!outroText.value.trim()) {
                        showError('Por favor, especifique seu cargo.');
                        return false;
                    }
                } else if (name === 'setor') {
                    const outroText = document.getElementById('setor-outro-text');
                    if (!outroText.value.trim()) {
                        showError('Por favor, especifique o setor.');
                        return false;
                    }
                }
            }
        }
    }

    return true;
}

// Validar todas as perguntas
function validateAllQuestions() {
    // Validar checkboxes
    const riscosRelevantes = document.querySelectorAll('input[name="riscos-relevantes"]:checked');
    const medidasEficazes = document.querySelectorAll('input[name="medidas-eficazes"]:checked');

    if (riscosRelevantes.length === 0) {
        showError('Por favor, responda a pergunta 9 (riscos relevantes).');
        currentQuestion = 9;
        showQuestion(9);
        return false;
    }

    if (medidasEficazes.length === 0) {
        showError('Por favor, responda a pergunta 12 (medidas eficazes).');
        currentQuestion = 12;
        showQuestion(12);
        return false;
    }

    // Validar todos os campos obrigatórios
    const requiredFields = document.querySelectorAll('input[required]');
    for (let field of requiredFields) {
        if (field.type === 'radio') {
            const name = field.name;
            const checked = document.querySelector(`input[name="${name}"]:checked`);
            if (!checked) {
                const questionNum = field.closest('.question-slide')?.dataset.question;
                if (questionNum) {
                    showError(`Por favor, responda a pergunta ${questionNum}.`);
                    currentQuestion = parseInt(questionNum);
                    showQuestion(currentQuestion);
                    return false;
                }
            }
        }
    }

    return true;
}

// Mostrar erro
function showError(message) {
    // Criar ou atualizar mensagem de erro
    let errorDiv = document.getElementById('error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(255, 68, 68, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        document.body.appendChild(errorDiv);
    }

    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    // Remover após 4 segundos
    setTimeout(() => {
        errorDiv.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 300);
    }, 4000);
}

// Enviar formulário
function submitForm() {
    const form = document.getElementById('questionarioForm');
    const formData = new FormData(form);
    const respostas = {};

    // Processar campos de radio
    formData.forEach((value, key) => {
        if (key !== 'riscos-relevantes' && key !== 'medidas-eficazes' && key !== 'cargo-outro' && key !== 'setor-outro') {
            respostas[key] = value;
        }
    });

    // Processar cargo com "Outro"
    const cargo = formData.get('cargo');
    if (cargo === 'Outro') {
        respostas['cargo'] = 'Outro: ' + (formData.get('cargo-outro') || '');
    }

    // Processar setor com "Outro"
    const setor = formData.get('setor');
    if (setor === 'Outro') {
        respostas['setor'] = 'Outro: ' + (formData.get('setor-outro') || '');
    }

    // Processar checkboxes
    const riscosRelevantes = document.querySelectorAll('input[name="riscos-relevantes"]:checked');
    const medidasEficazes = document.querySelectorAll('input[name="medidas-eficazes"]:checked');
    respostas['riscos-relevantes'] = Array.from(riscosRelevantes).map(cb => cb.value);
    respostas['medidas-eficazes'] = Array.from(medidasEficazes).map(cb => cb.value);

    // Adicionar timestamp
    respostas['data_preenchimento'] = new Date().toISOString();

    // Salvar no localStorage
    let respostasSalvas = JSON.parse(localStorage.getItem('respostasQuestionario') || '[]');
    respostasSalvas.push(respostas);
    localStorage.setItem('respostasQuestionario', JSON.stringify(respostasSalvas));

    // Criar arquivo JSON para download
    const jsonStr = JSON.stringify(respostas, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resposta_questionario_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Mostrar mensagem de sucesso
    document.getElementById('success-overlay').style.display = 'flex';
}

// Adicionar estilos de animação para erro
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Dashboard Functions
let dashboardOpen = false;
const DASHBOARD_PASSWORD = 'admin123'; // Senha simples para acesso

// Setup dashboard (será chamado no DOMContentLoaded principal)
function setupDashboard() {
    const btnCloseDashboard = document.getElementById('btnCloseDashboard');
    const btnGenerateReport = document.getElementById('btnGenerateReport');
    const btnEndResearch = document.getElementById('btnEndResearch');
    const dashboardOverlay = document.getElementById('dashboard-overlay');
    const mobileDashboardBtn = document.getElementById('mobileDashboardBtn');
    
    // Botão mobile para abrir dashboard
    if (mobileDashboardBtn) {
        mobileDashboardBtn.addEventListener('click', function() {
            showPasswordModal();
        });
    }
    
    // Setup modal de senha
    const passwordOverlay = document.getElementById('password-overlay');
    const passwordInput = document.getElementById('passwordInput');
    const btnConfirmPassword = document.getElementById('btnConfirmPassword');
    const btnCancelPassword = document.getElementById('btnCancelPassword');
    
    if (btnConfirmPassword) {
        btnConfirmPassword.addEventListener('click', function() {
            checkPassword();
        });
    }
    
    if (btnCancelPassword) {
        btnCancelPassword.addEventListener('click', function() {
            closePasswordModal();
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }
    
    if (passwordOverlay) {
        passwordOverlay.addEventListener('click', function(e) {
            if (e.target === passwordOverlay) {
                closePasswordModal();
            }
        });
    }

    if (btnCloseDashboard) {
        btnCloseDashboard.addEventListener('click', closeDashboard);
    }

    if (btnGenerateReport) {
        btnGenerateReport.addEventListener('click', generateFullReport);
    }

    if (btnEndResearch) {
        btnEndResearch.addEventListener('click', endResearch);
    }

    if (dashboardOverlay) {
        dashboardOverlay.addEventListener('click', function(e) {
            if (e.target === dashboardOverlay) {
                closeDashboard();
            }
        });
    }
}

// Abrir dashboard com Ctrl+Shift+D
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        if (dashboardOpen) {
            closeDashboard();
        } else {
            showPasswordModal();
        }
    }
    if (e.key === 'Escape') {
        if (dashboardOpen) {
            closeDashboard();
        } else {
            closePasswordModal();
        }
    }
});

// Funções de senha
function showPasswordModal() {
    const passwordOverlay = document.getElementById('password-overlay');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    
    if (passwordOverlay) {
        passwordOverlay.style.display = 'flex';
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
        if (passwordError) {
            passwordError.style.display = 'none';
        }
    }
}

function closePasswordModal() {
    const passwordOverlay = document.getElementById('password-overlay');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    
    if (passwordOverlay) {
        passwordOverlay.style.display = 'none';
        if (passwordInput) {
            passwordInput.value = '';
        }
        if (passwordError) {
            passwordError.style.display = 'none';
        }
    }
}

function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    
    if (!passwordInput) return;
    
    const enteredPassword = passwordInput.value.trim();
    
    if (enteredPassword === DASHBOARD_PASSWORD) {
        closePasswordModal();
        openDashboard();
    } else {
        if (passwordError) {
            passwordError.style.display = 'block';
        }
        passwordInput.value = '';
        passwordInput.focus();
        // Adicionar animação de erro
        passwordInput.style.borderColor = '#e53e3e';
        setTimeout(() => {
            passwordInput.style.borderColor = '';
        }, 1000);
    }
}

function openDashboard() {
    const dashboardOverlay = document.getElementById('dashboard-overlay');
    if (dashboardOverlay) {
        dashboardOverlay.style.display = 'flex';
        dashboardOpen = true;
        loadDashboardData();
        // Esconder botão mobile quando dashboard abrir
        const mobileBtn = document.getElementById('mobileDashboardBtn');
        if (mobileBtn) {
            mobileBtn.style.display = 'none';
        }
    }
}

function closeDashboard() {
    const dashboardOverlay = document.getElementById('dashboard-overlay');
    if (dashboardOverlay) {
        dashboardOverlay.style.display = 'none';
        dashboardOpen = false;
        // Mostrar botão mobile novamente quando dashboard fechar (se estiver em mobile)
        const mobileBtn = document.getElementById('mobileDashboardBtn');
        if (mobileBtn && window.innerWidth <= 768) {
            mobileBtn.style.display = 'flex';
        }
    }
}

function loadDashboardData() {
    const respostas = JSON.parse(localStorage.getItem('respostasQuestionario') || '[]');
    const total = respostas.length;
    
    // Atualizar estatísticas
    document.getElementById('totalRespostas').textContent = total;
    
    // Calcular taxa de conclusão (assumindo que todas as respostas salvas estão completas)
    const taxaConclusao = total > 0 ? '100%' : '0%';
    document.getElementById('taxaConclusao').textContent = taxaConclusao;
    
    // Carregar métricas
    loadMetrics(respostas);
}

function loadMetrics(respostas) {
    if (respostas.length === 0) {
        document.getElementById('dashboardMetrics').innerHTML = '<p style="text-align: center; color: #718096; padding: 40px;">Nenhuma resposta coletada ainda.</p>';
        return;
    }

    const metricsContainer = document.getElementById('dashboardMetrics');
    let html = '';

    // Mapear perguntas
    const questions = {
        'idade': '1. Qual a sua idade?',
        'cargo': '2. Qual o seu cargo/função na empresa?',
        'tempo-setor': '3. Há quanto tempo você trabalha no setor de petróleo e gás?',
        'setor': '4. Qual o seu setor de atuação na empresa?',
        'treinamento': '5. Você já participou de treinamentos ou capacitações sobre riscos no transporte de petróleo?',
        'conhecimento-riscos': '6. Você conhece os principais riscos associados ao transporte de petróleo por dutos?',
        'risco-ambiental': '7. Na sua opinião, o transporte de petróleo por dutos representa risco ambiental significativo?',
        'risco-carmopolis': '8. Você acredita que a região de Carmópolis-SE apresenta risco maior de vazamentos devido às características geográficas?',
        'riscos-relevantes': '9. Quais destes riscos você considera mais relevantes no transporte de petróleo por dutos?',
        'monitoramento': '10. Você acha que os sistemas de monitoramento dos dutos em Carmópolis-SE são suficientes para prevenir acidentes?',
        'incidente': '11. Você já presenciou ou teve conhecimento de algum incidente envolvendo dutos na região?',
        'medidas-eficazes': '12. Na sua opinião, quais medidas seriam mais eficazes para reduzir riscos no transporte de petróleo?',
        'populacao-informada': '13. Você acha que a população local está bem-informada sobre os riscos do transporte de petróleo produtos?',
        'plano-emergencia': '14. A empresa responsável pelo transporte de petróleo possui plano de emergência acessível à população?',
        'seguranca': '15. Você se sente seguro (a) vivendo próximo a um duto de petróleo em Carmópolis-SE?'
    };

    // Processar cada pergunta
    Object.keys(questions).forEach(key => {
        const questionText = questions[key];
        const counts = {};
        let total = 0;

        respostas.forEach(resposta => {
            const value = resposta[key];
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    // Para checkboxes (múltipla escolha)
                    value.forEach(v => {
                        counts[v] = (counts[v] || 0) + 1;
                        total++;
                    });
                } else {
                    counts[value] = (counts[value] || 0) + 1;
                    total++;
                }
            }
        });

        if (total > 0) {
            html += `<div class="metric-section">
                <h3>${questionText}</h3>`;

            // Ordenar por contagem
            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
            
            sorted.forEach(([label, count]) => {
                const percentage = ((count / respostas.length) * 100).toFixed(1);
                html += `
                <div class="metric-item">
                    <div class="metric-answer">
                        <span class="metric-answer-label">${label}</span>
                        <div class="metric-answer-bar">
                            <div class="metric-answer-fill" style="width: ${percentage}%">${percentage}%</div>
                        </div>
                        <span class="metric-answer-count">${count}/${respostas.length}</span>
                    </div>
                </div>`;
            });

            html += `</div>`;
        }
    });

    metricsContainer.innerHTML = html || '<p style="text-align: center; color: #718096; padding: 40px;">Nenhuma métrica disponível.</p>';
}

function generateFullReport() {
    const respostas = JSON.parse(localStorage.getItem('respostasQuestionario') || '[]');
    
    if (respostas.length === 0) {
        alert('Não há respostas coletadas para gerar o relatório.');
        return;
    }

    // Verificar se jsPDF está disponível
    let jsPDF;
    if (typeof window.jspdf !== 'undefined') {
        jsPDF = window.jspdf.jsPDF;
    } else if (typeof window.jsPDF !== 'undefined') {
        jsPDF = window.jsPDF;
    } else {
        alert('Erro ao carregar biblioteca de PDF. Tente recarregar a página.');
        return;
    }

    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;
    const margin = 15;
    const lineHeight = 7;
    const maxWidth = pageWidth - (margin * 2);

    // Função para adicionar nova página se necessário
    function checkNewPage(spaceNeeded = 10) {
        if (yPosition + spaceNeeded > pageHeight - margin) {
            doc.addPage();
            yPosition = 20;
            return true;
        }
        return false;
    }

    // Cabeçalho
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO COMPLETO DA PESQUISA', margin, yPosition, { maxWidth });
    yPosition += lineHeight + 2;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Mapeamento dos riscos no transporte de petróleo por dutos em Carmópolis-SE', margin, yPosition, { maxWidth });
    yPosition += lineHeight + 5;

    // Informações gerais
    doc.setFontSize(10);
    doc.text(`Data de geração: ${new Date().toLocaleString('pt-BR')}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Total de respostas coletadas: ${respostas.length}`, margin, yPosition);
    yPosition += lineHeight + 3;

    // Linha divisória
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += lineHeight + 3;

    // Estatísticas gerais
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTATÍSTICAS GERAIS', margin, yPosition);
    yPosition += lineHeight + 2;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const statsData = [
        ['Total de participantes', respostas.length.toString()],
        ['Taxa de conclusão', '100%'],
        ['Período da pesquisa', `${respostas[0]?.data_preenchimento ? new Date(respostas[0].data_preenchimento).toLocaleDateString('pt-BR') : 'N/A'} - ${respostas[respostas.length - 1]?.data_preenchimento ? new Date(respostas[respostas.length - 1].data_preenchimento).toLocaleDateString('pt-BR') : 'N/A'}`]
    ];

    doc.autoTable({
        startY: yPosition,
        head: [['Métrica', 'Valor']],
        body: statsData,
        theme: 'striped',
        headStyles: { fillColor: [139, 69, 19], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
        margin: { left: margin, right: margin },
        columnStyles: { 0: { fontStyle: 'bold' } }
    });

    yPosition = doc.lastAutoTable.finalY + 10;
    checkNewPage(15);

    // Métricas detalhadas por pergunta
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MÉTRICAS DETALHADAS POR PERGUNTA', margin, yPosition);
    yPosition += lineHeight + 5;

    const questions = {
        'idade': '1. Qual a sua idade?',
        'cargo': '2. Qual o seu cargo/função na empresa?',
        'tempo-setor': '3. Há quanto tempo você trabalha no setor de petróleo e gás?',
        'setor': '4. Qual o seu setor de atuação na empresa?',
        'treinamento': '5. Você já participou de treinamentos ou capacitações sobre riscos no transporte de petróleo?',
        'conhecimento-riscos': '6. Você conhece os principais riscos associados ao transporte de petróleo por dutos?',
        'risco-ambiental': '7. Na sua opinião, o transporte de petróleo por dutos representa risco ambiental significativo?',
        'risco-carmopolis': '8. Você acredita que a região de Carmópolis-SE apresenta risco maior de vazamentos devido às características geográficas?',
        'riscos-relevantes': '9. Quais destes riscos você considera mais relevantes no transporte de petróleo por dutos?',
        'monitoramento': '10. Você acha que os sistemas de monitoramento dos dutos em Carmópolis-SE são suficientes para prevenir acidentes?',
        'incidente': '11. Você já presenciou ou teve conhecimento de algum incidente envolvendo dutos na região?',
        'medidas-eficazes': '12. Na sua opinião, quais medidas seriam mais eficazes para reduzir riscos no transporte de petróleo?',
        'populacao-informada': '13. Você acha que a população local está bem-informada sobre os riscos do transporte de petróleo produtos?',
        'plano-emergencia': '14. A empresa responsável pelo transporte de petróleo possui plano de emergência acessível à população?',
        'seguranca': '15. Você se sente seguro (a) vivendo próximo a um duto de petróleo em Carmópolis-SE?'
    };

    Object.keys(questions).forEach((key, index) => {
        checkNewPage(30);
        
        const questionText = questions[key];
        const counts = {};

        respostas.forEach(resposta => {
            const value = resposta[key];
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(v => {
                        counts[v] = (counts[v] || 0) + 1;
                    });
                } else {
                    counts[value] = (counts[value] || 0) + 1;
                }
            }
        });

        if (Object.keys(counts).length > 0) {
            // Título da pergunta
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            const questionLines = doc.splitTextToSize(questionText, maxWidth);
            doc.text(questionLines, margin, yPosition, { maxWidth });
            yPosition += (questionLines.length * lineHeight) + 3;

            // Tabela com resultados
            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
            const tableData = sorted.map(([label, count]) => {
                const percentage = ((count / respostas.length) * 100).toFixed(1);
                return [label, count.toString(), `${percentage}%`];
            });

            doc.autoTable({
                startY: yPosition,
                head: [['Resposta', 'Quantidade', 'Percentual']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [139, 69, 19], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 2.5 },
                margin: { left: margin, right: margin },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { halign: 'center', cellWidth: 30 },
                    2: { halign: 'center', cellWidth: 25 }
                }
            });

            yPosition = doc.lastAutoTable.finalY + 8;
        }
    });

    // Rodapé em todas as páginas
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(
            `Página ${i} de ${totalPages} | Relatório gerado em ${new Date().toLocaleString('pt-BR')}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    // Salvar PDF
    const fileName = `relatorio_pesquisa_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}

function endResearch() {
    if (confirm('Tem certeza que deseja encerrar a pesquisa? Esta ação irá limpar todos os dados coletados.')) {
        if (confirm('Esta ação é IRREVERSÍVEL. Deseja continuar?')) {
            localStorage.removeItem('respostasQuestionario');
            alert('Pesquisa encerrada. Todos os dados foram removidos.');
            closeDashboard();
            location.reload();
        }
    }
}
