<?php
// backend/templates/pdi-template.php

// --- INCLUDES E HELPERS ---
include_once __DIR__ . '/partials/document-start.php';
include_once __DIR__ . '/partials/header.php';

// Helper function específica para este template
function render_aspectos_table($items, $aspectos) {
    $html = "<table style='font-size: 9pt;'><tr>";
    $html .= "<th style='width: 40%'>ASPECTOS</th>";
    $html .= "<th style='width: 15%'>APRESENTA</th>";
    $html .= "<th style='width: 15%'>APRESENTA COM AJUDA</th>";
    $html .= "<th style='width: 15%'>NÃO APRESENTA</th>";
    $html .= "<th style='width: 15%'>NÃO OBSERVADO</th>";
    $html .= "</tr>";

    foreach ($items as $key => $label) {
        $valor = $aspectos[$key] ?? '';
        $html .= "<tr>";
        $html .= "<td>" . $label . "</td>";
        $html .= "<td style='text-align: center'>" . checkbox($valor, 'apresenta') . "</td>";
        $html .= "<td style='text-align: center'>" . checkbox($valor, 'apresenta_com_ajuda') . "</td>";
        $html .= "<td style='text-align: center'>" . checkbox($valor, 'nao_apresenta') . "</td>";
        $html .= "<td style='text-align: center'>" . checkbox($valor, 'nao_observado') . "</td>";
        $html .= "</tr>";
    }

    $html .= "</table>";
    return $html;
}

// --- PREPARAÇÃO DE DADOS ---
$pdi = $data['pdi'];
$aspectos_psicomotores = $data['aspectos_psicomotores'];
$aspectos_pedagogicos = $data['aspectos_pedagogicos'];
$photo_path = $data['photo_path'];

$fotoHtml = '';
if ($photo_path && file_exists($photo_path)) {
    // Note: o caminho para a imagem deve ser absoluto ou relativo ao script que gera o PDF
    $fotoHtml = '<img src="' . $photo_path . '" class="student-photo">';
}
?>

<!-- TÍTULO DO DOCUMENTO -->
<div style="text-align: center;">
    <h1 style="font-size: 14pt; font-weight: bold; margin-bottom: 5px;">PLANO DE DESENVOLVIMENTO INDIVIDUAL – PDI</h1>
    <p style="font-size: 9pt; margin-bottom: 15px;">Modelo para as Redes Públicas e Privadas de Ensino</p>
</div>

<?php echo $fotoHtml; ?>

<!-- SEÇÃO I - DADOS INSTITUCIONAIS -->
<div class="section">
    <div class="section-title">I. DADOS INSTITUCIONAIS</div>
    <div class="field-row"><span class="field-label">1. Data da elaboração:</span> <span class="field-value"><?php echo v($pdi, 'data_elaboracao') ? date('d/m/Y', strtotime(v($pdi, 'data_elaboracao'))) : ''; ?></span></div>
    <div class="field-row"><span class="field-label">2. SRE:</span> <span class="field-value"><?php echo v($pdi, 'sre'); ?></span></div>
    <div class="field-row"><span class="field-label">3. Nome da escola:</span> <span class="field-value"><?php echo v($pdi, 'nome_escola'); ?></span></div>
    <div class="field-row"><span class="field-label">4. Código:</span> <span class="field-value"><?php echo v($pdi, 'codigo_escola'); ?></span></div>
    <div class="field-row"><span class="field-label">5. Endereço:</span> <span class="field-value"><?php echo v($pdi, 'endereco_escola'); ?></span></div>

    <div class="field-row">
        <span class="field-label">6. Etapas da Ed. Básica:</span>
        <?php $etapas = v($pdi, 'etapas_educacao_basica'); ?>
        <?php echo checkbox($etapas, 'ef_iniciais'); ?> EF anos iniciais &nbsp;
        <?php echo checkbox($etapas, 'ef_finais'); ?> EF anos finais &nbsp;
        <?php echo checkbox($etapas, 'ensino_medio'); ?> Ensino Médio
    </div>

    <div class="field-row"><span class="field-label">7. Escola com acessibilidade física:</span> <?php echo checkbox(v($pdi, 'escola_acessibilidade'), 'sim'); ?> Sim <?php echo checkbox(v($pdi, 'escola_acessibilidade'), 'nao'); ?> Não</div>
    <div class="field-row"><span class="field-label">8. Possui Sala de recursos:</span> <?php echo checkbox(v($pdi, 'possui_sala_recursos'), 'sim'); ?> Sim <?php echo checkbox(v($pdi, 'possui_sala_recursos'), 'nao'); ?> Não
        <?php if (v($pdi, 'nome_escola_encaminhada')): ?> - Escola encaminhada: <?php echo v($pdi, 'nome_escola_encaminhada'); ?><?php endif; ?>
    </div>

    <div class="field-row"><span class="field-label">9. Diretor(a):</span> <span class="field-value"><?php echo v($pdi, 'diretor'); ?></span></div>
    <div class="field-row"><span class="field-label">10. Vice-diretor(a):</span> <span class="field-value"><?php echo v($pdi, 'vice_diretor'); ?></span></div>

    <h3 style="font-size: 10pt; font-weight: bold; margin-top: 10px;">11. Responsáveis pela elaboração PDI</h3>
    <div class="field-row"><span class="field-label">Especialista:</span> <span class="field-value"><?php echo v($pdi, 'especialista'); ?></span></div>
    <div class="field-row"><span class="field-label">Professor de Apoio:</span> <span class="field-value"><?php echo v($pdi, 'professor_apoio'); ?></span></div>
    <div class="field-row"><span class="field-label">Guia Intérprete:</span> <span class="field-value"><?php echo v($pdi, 'guia_interprete'); ?></span></div>
    <div class="field-row"><span class="field-label">TILS:</span> <span class="field-value"><?php echo v($pdi, 'tils'); ?></span></div>
    <div class="field-row"><span class="field-label">Professor de Sala de Recursos:</span> <span class="field-value"><?php echo v($pdi, 'professor_sala_recursos'); ?></span></div>
    <div class="field-row"><span class="field-label">Regente(s) de turma/aula:</span> <div class="textarea-field" style="min-height: 20px;"><?php echo nl2br(v($pdi, 'regentes_turma')); ?></div></div>
    <div class="field-row"><span class="field-label">Elaborado por:</span> <span class="field-value"><?php echo v($pdi, 'elaborado_por'); ?></span></div>
</div>

<!-- SEÇÃO II - DADOS DO ESTUDANTE -->
<div class="section">
    <div class="section-title">II. DADOS DO(A) ESTUDANTE</div>
    <div class="field-row"><span class="field-label">1. Nome do Estudante:</span> <span class="field-value"><?php echo v($pdi, 'nome_aluno'); ?></span></div>
    <div class="field-row"><span class="field-label">2. Data de nascimento:</span> <span class="field-value"><?php echo v($pdi, 'data_nascimento') ? date('d/m/Y', strtotime(v($pdi, 'data_nascimento'))) : ''; ?></span> <span class="field-label">Idade:</span> <span class="field-value"><?php echo v($pdi, 'idade'); ?></span></div>
    <div class="field-row"><span class="field-label">3. Responsável/parentesco:</span> <span class="field-value"><?php echo v($pdi, 'responsavel_parentesco'); ?></span></div>
    <div class="field-row"><span class="field-label">4. Ano de escolaridade:</span> <span class="field-value"><?php echo v($pdi, 'ano_escolaridade'); ?></span></div>
    <div class="field-row"><span class="field-label">5. Deficiência informada:</span> <span class="field-value"><?php echo v($pdi, 'deficiencia_informada'); ?></span></div>
    <div class="field-row"><span class="field-label">6. Acompanhado por profissional?:</span> <?php echo checkbox(v($pdi, 'acompanhado_profissional'), 'sim'); ?> Sim <?php if(v($pdi, 'especialidade_profissional')) echo "(Especialidade: " . v($pdi, 'especialidade_profissional') . ")"; ?></div>
    <div class="field-row"><span class="field-label">7. Uso de medicamento?:</span> <?php echo checkbox(v($pdi, 'uso_medicamento'), 'sim'); ?> Sim <?php if(v($pdi, 'efeitos_colaterais')) echo "(Efeitos: " . v($pdi, 'efeitos_colaterais') . ")"; ?></div>
    <div class="field-row"><span class="field-label">8. Necessidade específica:</span> <span class="field-value"><?php echo v($pdi, 'necessidade_especifica'); ?></span></div>
    <div class="field-row"><span class="field-label">9. Tipo de atendimento:</span> <div class="textarea-field" style="min-height: 20px;"><?php echo nl2br(v($pdi, 'tipo_atendimento')); ?></div></div>
    <div class="field-row"><span class="field-label">10. Recurso de Acessibilidade:</span> <span class="field-value"><?php echo v($pdi, 'recurso_acessibilidade'); ?></span></div>
    <div class="field-row"><span class="field-label">11. Como gosta de se divertir?</span> <span class="field-value"><?php echo v($pdi, 'como_gosta_divertir'); ?></span></div>
</div>

<!-- SEÇÃO III - CONSIDERAÇÕES DA FAMÍLIA -->
<div class="section">
    <div class="section-title">III. CONSIDERAÇÕES DA FAMÍLIA</div>
    <div class="textarea-field"><?php echo nl2br(v($pdi, 'consideracoes_familia')); ?></div>
</div>

<!-- SEÇÃO IV - HISTÓRICO DE ESCOLARIZAÇÃO -->
<div class="section">
    <div class="section-title">IV. HISTÓRICO DE ESCOLARIZAÇÃO</div>
    <div class="field-row"><span class="field-label">1. Idade que começou a frequentar a escola:</span> <span class="field-value"><?php echo v($pdi, 'idade_comecou_escola'); ?></span></div>
    <div class="field-row"><span class="field-label">2. Percurso escolar:</span> <div class="textarea-field"><?php echo nl2br(v($pdi, 'percurso_escolar')); ?></div></div>
    <div class="field-row"><span class="field-label">3. Frequenta sala de recursos?:</span> <?php echo checkbox(v($pdi, 'frequenta_sala_recursos'), 'sim'); ?> Sim <?php if(v($pdi, 'frequencia_atendimento')) echo "(Frequência: " . v($pdi, 'frequencia_atendimento') . ")"; ?></div>
    <div class="field-row"><span class="field-label">4. Frequenta Educação Integral?:</span> <?php echo checkbox(v($pdi, 'frequenta_educacao_integral'), 'sim'); ?> Sim</div>
</div>

<!-- SEÇÃO V - LIMITES E AGRESSIVIDADE -->
<div class="section">
    <div class="section-title">V. LIMITES E AGRESSIVIDADE</div>
    <div class="field-row">
        <?php echo checkbox(v($pdi, 'autoagressividade'), 1); ?> Autoagressividade &nbsp;
        <?php echo checkbox(v($pdi, 'indisciplina'), 1); ?> Indisciplina &nbsp;
        <?php echo checkbox(v($pdi, 'heteroagressividade'), 1); ?> Heteroagressividade<br>
        <?php echo checkbox(v($pdi, 'desobediencia_regras'), 1); ?> Desobediência às regras &nbsp;
        <?php echo checkbox(v($pdi, 'apatia'), 1); ?> Apatia
    </div>
    <div class="field-row"><span class="field-label">Obs.:</span> <div class="textarea-field"><?php echo nl2br(v($pdi, 'observacoes_comportamento')); ?></div></div>
</div>

<div style="page-break-after: always;"></div>

<!-- SEÇÃO VI - ASPECTOS PSICOMOTORES -->
<div class="section">
    <div class="section-title">VI. ASPECTOS PSICOMOTORES OBSERVADOS</div>
    <?php
    $psicomotores_items = ['esquema_corporal' => 'Esquema corporal', 'consciencia_corporal' => 'Consciência corporal', /* ... (adicione todos) */];
    echo render_aspectos_table($data['psicomotores_items'], $aspectos_psicomotores);
    ?>
</div>

<div style="page-break-after: always;"></div>

<!-- SEÇÃO VII - ASPECTOS PEDAGÓGICOS/COGNITIVOS -->
<div class="section">
    <div class="section-title">VII. ASPECTOS PEDAGÓGICOS/COGNITIVOS OBSERVADOS</div>
    <?php
    $pedagogicos_items = ['memoria_curto_prazo' => 'Memória de Curto Prazo', 'memoria_longo_prazo' => 'Memória de Longo Prazo', /* ... (adicione todos) */];
    echo render_aspectos_table($data['pedagogicos_items'], $aspectos_pedagogicos);
    ?>
    <?php if (v($pdi, 'habilidades_demonstradas')): ?>
        <p style='margin-top: 10px;'><strong>Habilidades demonstradas (caso de >50% "Não Apresenta"/"Não Observado"):</strong></p>
        <div class="textarea-field"><?php echo nl2br(v($pdi, 'habilidades_demonstradas')); ?></div>
    <?php endif; ?>
</div>

<div style="page-break-after: always;"></div>

<!-- SEÇÃO VIII - COMUNICAÇÃO E LINGUAGEM (PARTIAL) -->
<?php include __DIR__ . '/partials/pdi-comunicacao.php'; ?>

<div style="page-break-after: always;"></div>

<!-- SEÇÃO IX - PLANEJAMENTO BIMESTRAL (PARTIAL) -->
<?php include __DIR__ . '/partials/pdi-planejamento.php'; ?>

<!-- SEÇÃO X - RELATÓRIO PEDAGÓGICO SEMESTRAL -->
<div class="section">
    <div class="section-title">X. RELATÓRIO PEDAGÓGICO DO DESENVOLVIMENTO DO ESTUDANTE / SEMESTRAL</div>
    <p style="font-size: 8pt;">Relatório Pedagógico DESCRITIVO elencando os aspectos cognitivos, sociais, comunicacionais e motores de desenvolvimento do estudante durante o semestre:</p>
    <div class="textarea-field" style="min-height: 200px;"><?php echo nl2br(v($pdi, 'relatorio_semestral')); ?></div>
</div>

<?php
// Incluir o rodapé
include __DIR__ . '/partials/footer.php';
include __DIR__ . '/partials/document-end.php';
?>
