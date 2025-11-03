# Script para criar dados de teste para o sistema ConectEDU
$token = (mysql -u root -sN conectedu -e 'SELECT token FROM sessions ORDER BY created_at DESC LIMIT 1')
$baseUrl = "http://localhost/conectedu/backend/api.php"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "=== Criando dados de teste ===" -ForegroundColor Cyan
Write-Host "Token: $token" -ForegroundColor Yellow

# Alunos existentes: 18, 19, 20 (professor 4)

# 1. ENTREVISTAS COM RESPONSÁVEL
Write-Host "`n1. Criando Entrevistas com Responsável..." -ForegroundColor Green

$entrevista1 = @{
    student_id = 18
    teacher_id = 4
    data_entrevista = "2025-10-15"
    nome_estudante = "Zezinho da Esquina"
    data_nascimento = "2018-01-14"
    naturalidade = "São Paulo"
    nome_escola = "EMEF Maria Santos"
    serie_ano = "7º ano"
    turno = "matutino"
    nome_pai = "Francisco da Silva"
    idade_pai = 45
    escolaridade_pai = "Ensino Médio Completo"
    nome_mae = "Maria da Silva"
    idade_mae = 42
    escolaridade_mae = "Ensino Fundamental Completo"
    endereco = "Rua Da Vida, 123"
    bairro = "Centro"
    cidade = "São Paulo"
    telefone = "919988666666"
    composicao_familiar = "Pai, mãe e 2 irmãos"
    renda_familiar = "De 2 a 3 salários mínimos"
    gestacao_tipo = "Normal"
    tempo_gestacao = "9 meses"
    parto_tipo = "Normal"
    intercorrencias = "Nenhuma"
    desenvolvimento_motor = "Dentro do esperado"
    desenvolvimento_linguagem = "Atraso moderado"
    autonomia_alimentacao = "Independente"
    autonomia_higiene = "Parcialmente independente"
    autonomia_locomocao = "Independente"
    medicacao_uso = "sim"
    medicacao_qual = "Ritalina 10mg"
    acompanhamento_medico = "sim"
    acompanhamento_qual = "Neurologista e Psiquiatra"
    restricoes_alimentares = "Não possui"
    observacoes = "Aluno participativo, necessita de apoio em atividades de leitura e escrita"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/entrevistas/create" -Method POST -Headers $headers -Body $entrevista1
    Write-Host "  ✓ Entrevista criada para aluno 18" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Erro ao criar entrevista: $_" -ForegroundColor Red
}

$entrevista2 = @{
    student_id = 19
    teacher_id = 4
    data_entrevista = "2025-10-20"
    nome_estudante = "João Pedro Silva Santos"
    data_nascimento = "2015-03-20"
    naturalidade = "São Paulo"
    nome_escola = "EMEF Maria Santos"
    serie_ano = "5º Ano"
    turno = "vespertino"
    nome_pai = "Pedro Santos"
    idade_pai = 38
    escolaridade_pai = "Superior Completo"
    nome_mae = "Maria Silva Santos"
    idade_mae = 36
    escolaridade_mae = "Superior Completo"
    endereco = "Rua das Flores, 123"
    bairro = "Centro"
    cidade = "São Paulo"
    telefone = "11987654321"
    composicao_familiar = "Pai, mãe e 1 irmã"
    renda_familiar = "Acima de 5 salários mínimos"
    gestacao_tipo = "Normal"
    tempo_gestacao = "9 meses"
    parto_tipo = "Cesárea"
    intercorrencias = "Nenhuma"
    desenvolvimento_motor = "Dentro do esperado"
    desenvolvimento_linguagem = "Dentro do esperado"
    autonomia_alimentacao = "Independente"
    autonomia_higiene = "Independente"
    autonomia_locomocao = "Independente"
    medicacao_uso = "nao"
    medicacao_qual = ""
    acompanhamento_medico = "sim"
    acompanhamento_qual = "Psicólogo"
    restricoes_alimentares = "Alergia a amendoim"
    observacoes = "Aluno com TEA nível 1, boa interação social, necessita rotina estruturada"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/entrevistas/create" -Method POST -Headers $headers -Body $entrevista2
    Write-Host "  ✓ Entrevista criada para aluno 19" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Erro ao criar entrevista: $_" -ForegroundColor Red
}

# 2. PDIs (Planos de Desenvolvimento Individual)
Write-Host "`n2. Criando PDIs..." -ForegroundColor Green

$pdi1 = @{
    student_id = 18
    teacher_id = 4
    data_elaboracao = "2025-10-16"
    sre = "SRE São Paulo Centro"
    nome_escola = "EMEF Maria Santos"
    codigo_escola = "SP123456"
    endereco_escola = "Av. Principal, 500"
    etapa_ef_anos_iniciais = 0
    etapa_ef_anos_finais = 1
    etapa_ensino_medio = 0
    escola_acessibilidade_fisica = "sim"
    possui_sala_recursos = "sim"
    nome_escola_sala_recursos = "EMEF Maria Santos"
    nome_completo_estudante = "Zezinho da Esquina"
    data_nascimento_estudante = "2018-01-14"
    serie_ano_estudante = "7º ano"
    turno_estudante = "matutino"
    nome_responsavel = "Francisco da Silva"
    telefone_responsavel = "919988666666"
    deficiencia_tipo = "Intelectual"
    cid = "F70 - Retardo Mental Leve"
    laudo_medico = "sim"
    historico_escolar = "Frequentou educação infantil regular, apresenta dificuldades de aprendizagem desde o 1º ano"
    desenvolvimento_cognitivo = "Apresenta dificuldades em raciocínio abstrato e resolução de problemas complexos"
    desenvolvimento_motor = "Desenvolvimento motor adequado para a idade"
    desenvolvimento_comunicacao = "Comunicação oral adequada, dificuldades na escrita"
    desenvolvimento_social = "Boa socialização com colegas, participativo"
    desenvolvimento_autonomia = "Independente em atividades de vida diária"
    objetivos_gerais = "Desenvolver habilidades de leitura e escrita funcionais; Ampliar raciocínio lógico-matemático; Fortalecer autonomia acadêmica"
    estrategias_metodologicas = "Uso de materiais concretos; Atividades com apoio visual; Tempo estendido para realização de tarefas; Uso de tecnologias assistivas"
    recursos_necessarios = "Tablet educacional; Jogos pedagógicos; Material adaptado impresso"
    avaliacao_processo = "Avaliação contínua através de portfólios e observações; Provas adaptadas com questões objetivas"
    periodicidade_avaliacao = "Trimestral"
    observacoes = "Família participativa e colaborativa no processo educacional"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/pdis/create" -Method POST -Headers $headers -Body $pdi1
    Write-Host "  ✓ PDI criado para aluno 18" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Erro ao criar PDI: $_" -ForegroundColor Red
}

$pdi2 = @{
    student_id = 19
    teacher_id = 4
    data_elaboracao = "2025-10-21"
    sre = "SRE São Paulo Centro"
    nome_escola = "EMEF Maria Santos"
    codigo_escola = "SP123456"
    endereco_escola = "Av. Principal, 500"
    etapa_ef_anos_iniciais = 1
    etapa_ef_anos_finais = 0
    etapa_ensino_medio = 0
    escola_acessibilidade_fisica = "sim"
    possui_sala_recursos = "sim"
    nome_escola_sala_recursos = "EMEF Maria Santos"
    nome_completo_estudante = "João Pedro Silva Santos"
    data_nascimento_estudante = "2015-03-20"
    serie_ano_estudante = "5º ano"
    turno_estudante = "vespertino"
    nome_responsavel = "Maria Silva Santos"
    telefone_responsavel = "11987654321"
    deficiencia_tipo = "Transtorno do Espectro Autista"
    cid = "F84.0 - Autismo Infantil"
    laudo_medico = "sim"
    historico_escolar = "Diagnóstico aos 3 anos, acompanhamento desde a educação infantil"
    desenvolvimento_cognitivo = "Inteligência preservada, habilidades especiais em matemática"
    desenvolvimento_motor = "Desenvolvimento motor típico"
    desenvolvimento_comunicacao = "Boa comunicação verbal, dificuldade em expressão emocional"
    desenvolvimento_social = "Preferência por atividades individuais, está desenvolvendo habilidades sociais"
    desenvolvimento_autonomia = "Independente nas atividades diárias"
    objetivos_gerais = "Desenvolver habilidades socioemocionais; Ampliar repertório de interação social; Trabalhar flexibilidade cognitiva"
    estrategias_metodologicas = "Uso de rotinas visuais; Avisos prévios sobre mudanças; Atividades estruturadas; Uso de interesses especiais como motivação"
    recursos_necessarios = "Agenda visual; Timer; Espaço tranquilo para autorregulação; Materiais de matemática avançados"
    avaliacao_processo = "Observação sistemática do comportamento; Registro de interações sociais; Avaliações acadêmicas regulares"
    periodicidade_avaliacao = "Bimestral"
    observacoes = "Família muito presente e comprometida; Aluno faz acompanhamento semanal com psicólogo"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/pdis/create" -Method POST -Headers $headers -Body $pdi2
    Write-Host "  ✓ PDI criado para aluno 19" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Erro ao criar PDI: $_" -ForegroundColor Red
}

# 3. PAIs (Planos de Atendimento Individual)
Write-Host "`n3. Criando PAIs..." -ForegroundColor Green

$pai1 = @{
    student_id = 18
    teacher_id = 4
    nome_escola = "EMEF Maria Santos"
    nome_estudante = "Zezinho da Esquina"
    data_nascimento = "2018-01-14"
    idade = 7
    serie_ano = "7º ano"
    turno = "matutino"
    nome_responsavel = "Francisco da Silva"
    telefone_contato = "919988666666"
    endereco_residencial = "Rua Da Vida, 123 - Centro"
    diagnostico_caracterizacao = "Deficiência Intelectual Leve"
    cid = "F70"
    objetivo_atendimento = "Desenvolver habilidades de leitura e escrita; Trabalhar raciocínio lógico-matemático básico; Estimular autonomia nas atividades escolares"
    atividades_propostas = "Leitura compartilhada; Jogos matemáticos; Atividades de escrita funcional; Uso de tecnologias educacionais"
    recursos_materiais = "Livros adaptados; Jogos pedagógicos; Tablet com aplicativos educacionais; Material dourado"
    frequencia_atendimento = "3 vezes por semana"
    duracao_atendimento = "50 minutos por sessão"
    local_atendimento = "Sala de Recursos Multifuncionais"
    forma_avaliacao = "Portfólio de atividades; Observação participante; Registro fotográfico; Avaliação descritiva"
    data_inicio = "2025-10-16"
    data_revisao = "2026-01-16"
    observacoes = "Aluno demonstra interesse por atividades práticas e jogos. Necessita reforço positivo constante."
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/pais/create" -Method POST -Headers $headers -Body $pai1
    Write-Host "  ✓ PAI criado para aluno 18" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Erro ao criar PAI: $_" -ForegroundColor Red
}

$pai2 = @{
    student_id = 19
    teacher_id = 4
    nome_escola = "EMEF Maria Santos"
    nome_estudante = "João Pedro Silva Santos"
    data_nascimento = "2015-03-20"
    idade = 10
    serie_ano = "5º ano"
    turno = "vespertino"
    nome_responsavel = "Maria Silva Santos"
    telefone_contato = "11987654321"
    endereco_residencial = "Rua das Flores, 123 - Centro"
    diagnostico_caracterizacao = "Transtorno do Espectro Autista - Nível 1"
    cid = "F84.0"
    objetivo_atendimento = "Desenvolver habilidades sociais; Trabalhar regulação emocional; Ampliar flexibilidade cognitiva; Fortalecer comunicação pragmática"
    atividades_propostas = "Histórias sociais; Jogos de interação; Atividades de identificação emocional; Dramatizações; Jogos de regras"
    recursos_materiais = "Cartões de emoções; Jogos de tabuleiro; Materiais para dramatização; Agenda visual; Timer"
    frequencia_atendimento = "2 vezes por semana"
    duracao_atendimento = "50 minutos por sessão"
    local_atendimento = "Sala de Recursos Multifuncionais"
    forma_avaliacao = "Observação comportamental; Registro de interações; Escala de habilidades sociais; Relatórios descritivos"
    data_inicio = "2025-10-21"
    data_revisao = "2026-01-21"
    observacoes = "Aluno com bom desempenho acadêmico, especialmente em matemática. Família muito colaborativa e presente."
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/pais/create" -Method POST -Headers $headers -Body $pai2
    Write-Host "  ✓ PAI criado para aluno 19" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Erro ao criar PAI: $_" -ForegroundColor Red
}

$pai3 = @{
    student_id = 20
    teacher_id = 4
    nome_escola = "Escola Estadual Professor Carlos Lima"
    nome_estudante = "Aluno Teste"
    data_nascimento = "2019-02-15"
    idade = 6
    serie_ano = "7º ano"
    turno = "matutino"
    nome_responsavel = "Francisca"
    telefone_contato = "9299988855"
    endereco_residencial = "Rua de Teste"
    diagnostico_caracterizacao = "Em avaliação"
    cid = "Aguardando laudo"
    objetivo_atendimento = "Estimular desenvolvimento da linguagem; Trabalhar atenção e concentração; Desenvolver coordenação motora fina"
    atividades_propostas = "Atividades de nomeação; Jogos de atenção; Recorte e colagem; Desenho; Contação de histórias"
    recursos_materiais = "Livros ilustrados; Quebra-cabeças; Material para recorte; Massinha; Blocos de montagem"
    frequencia_atendimento = "3 vezes por semana"
    duracao_atendimento = "45 minutos por sessão"
    local_atendimento = "Sala de Recursos Multifuncionais"
    forma_avaliacao = "Observação do desenvolvimento; Registro de atividades; Portfólio; Relatórios periódicos"
    data_inicio = "2025-10-22"
    data_revisao = "2026-01-22"
    observacoes = "Criança em fase inicial de atendimento. Demonstra interesse por atividades lúdicas."
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/pais/create" -Method POST -Headers $headers -Body $pai3
    Write-Host "  ✓ PAI criado para aluno 20" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Erro ao criar PAI: $_" -ForegroundColor Red
}

Write-Host "`n=== Dados de teste criados com sucesso! ===" -ForegroundColor Cyan
Write-Host "`nResumo:" -ForegroundColor Yellow
Write-Host "  - 2 Entrevistas com Responsável" -ForegroundColor White
Write-Host "  - 2 PDIs (Planos de Desenvolvimento Individual)" -ForegroundColor White
Write-Host "  - 3 PAIs (Planos de Atendimento Individual)" -ForegroundColor White
Write-Host "`nAlunos com formulários:" -ForegroundColor Yellow
Write-Host "  - Aluno 18 (Zezinho da Esquina): Entrevista + PDI + PAI" -ForegroundColor White
Write-Host "  - Aluno 19 (João Pedro Silva Santos): Entrevista + PDI + PAI" -ForegroundColor White
Write-Host "  - Aluno 20 (Aluno Teste): PAI" -ForegroundColor White
