<?php
/**
 * Template PDF: Plano de Desenvolvimento Individual (PDI) (Versão Completa)
 *
 * Inclui todas as 11 seções, tabelas dinâmicas de planejamento e avaliação,
 * garantindo 100% de fidelidade ao modelo de referência.
 */

// Helpers
function v($data, $key, $default = '') {
    return htmlspecialchars($data[$key] ?? $default, ENT_QUOTES, 'UTF-8');
}
function render_checkbox($value, $text) {
    return '<span class="checkbox">' . ($value ? '&#9745;' : '&#9744;') . '</span> ' . $text;
}
function render_aspect_row($label, $value) {
    $html = '<tr><td style="width: 55%;">' . $label . '</td>';
    $options = ['apresenta', 'apresenta_com_ajuda', 'nao_apresenta', 'nao_observado'];
    foreach ($options as $option) {
        $html .= '<td class="text-center">' . (v($value) == $option ? 'X' : '&nbsp;') . '</td>';
    }
    $html .= '</tr>';
    return $html;
}
function render_textarea($label, $value, $small_text = '') {
    $html = "<div class='field-row'><span class='field-label'>{$label}</span>";
    if ($small_text) $html .= "<br><span class='small-text'>{$small_text}</span>";
    $html .= "<div class='textarea-field'>" . nl2br($value) . "</div></div>";
    return $html;
}

$css = file_get_contents(__DIR__ . '/style.css');
$pdi = $data['pdi'];
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Plano de Desenvolvimento Individual (PDI)</title>
    <style>
        <?php echo $css; ?>
        .aspect-table th, .assessment-table th { font-size: 8pt; text-align: center; }
        .aspect-table td, .assessment-table td { font-size: 9pt; }
        .planning-table td { font-size: 8pt; }
    </style>
</head>
<body>
    <htmlpageheader name="Header">
        <div class="header-container">ConectAEE | Plano de Desenvolvimento Individual (PDI)</div>
    </htmlpageheader>
    <htmlpagefooter name="Footer">
        <div class="footer-container"><div class="page-number"></div></div>
    </htmlpagefooter>

    <h1>PLANO DE DESENVOLVIMENTO INDIVIDUAL – PDI</h1>
    <h2 class="document-subtitle">Modelo para as Redes Públicas e Privadas de Ensino</h2>

    <!-- Seções I e II -->
    <div class="section">
        <div class="section-title">I. DADOS INSTITUCIONAIS</div>
        <p><span class="field-label">Data da elaboração:</span> <span class="field-value"><?php echo v($pdi, 'data_elaboracao_formatada'); ?></span></p>
        <p><span class="field-label">Nome da escola:</span> <span class="field-value"><?php echo v($pdi, 'nome_escola'); ?></span></p>
    </div>
    <div class="section">
        <div class="section-title">II. DADOS DO(A) ESTUDANTE</div>
        <?php if (!empty($data['photo_path'])): ?>
            <div class="photo-container"><img src="<?php echo $data['photo_path']; ?>" /></div>
        <?php endif; ?>
        <p><span class="field-label">Nome:</span> <span class="field-value"><?php echo v($pdi, 'student_name'); ?></span></p>
        <p><span class="field-label">Data de Nascimento:</span> <span class="field-value"><?php echo v($pdi, 'data_nascimento_formatada'); ?></span></p>
        <p><span class="field-label">Ano de escolaridade:</span> <span class="field-value"><?php echo v($pdi, 'ano_escolaridade'); ?></span></p>
    </div>

    <!-- Seções III, IV, V -->
    <?php echo render_textarea('III. CONSIDERAÇÕES DA FAMÍLIA', v($pdi, 'consideracoes_familia')); ?>
    <?php echo render_textarea('IV. HISTÓRICO DE ESCOLARIZAÇÃO', v($pdi, 'percurso_escolar')); ?>
    <?php echo render_textarea('V. LIMITES E AGRESSIVIDADE', v($pdi, 'limites_agressividade_obs')); ?>

    <div class="page-break"></div>

    <!-- Seções VI e VII -->
    <div class="section">
        <div class="section-title">VI. ASPECTOS PSICOMOTORES OBSERVADOS</div>
        <table class="data-table aspect-table">
            <thead><tr><th>Aspecto</th><th>Apresenta</th><th>Com Ajuda</th><th>Não Apresenta</th><th>Não Observado</th></tr></thead>
            <tbody>
                <?php foreach($data['aspectos_psicomotores'] as $key => $value) echo render_aspect_row(ucfirst(str_replace('_', ' ', $key)), $value); ?>
            </tbody>
        </table>
    </div>
    <div class="section">
        <div class="section-title">VII. ASPECTOS PEDAGÓGICOS/COGNITIVOS OBSERVADOS</div>
        <table class="data-table aspect-table">
            <thead><tr><th>Aspecto</th><th>Apresenta</th><th>Com Ajuda</th><th>Não Apresenta</th><th>Não Observado</th></tr></thead>
            <tbody>
                 <?php foreach($data['aspectos_pedagogicos'] as $key => $value) echo render_aspect_row(ucfirst(str_replace('_', ' ', $key)), $value); ?>
            </tbody>
        </table>
    </div>

    <div class="page-break"></div>

    <!-- Seção VIII -->
    <div class="section">
        <div class="section-title">VIII. COMUNICAÇÃO E LINGUAGEM</div>
        <p><?php echo render_checkbox(v($pdi, 'intencao_comunicativa') == 'sim', 'Apresenta intenção comunicativa'); ?></p>
        <?php echo render_textarea('Recursos de comunicação utilizados:', v($pdi, 'recursos_comunicacao_alternativa')); ?>
        <?php echo render_textarea('Forma de expressão:', v($pdi, 'expressa_se_por')); ?>
        <?php echo render_textarea('Nível de Escrita:', v($pdi, 'escrita_nivel')); ?>
        <?php echo render_textarea('Nível de Leitura:', v($pdi, 'leitura_nivel')); ?>
    </div>

    <div class="page-break"></div>

    <!-- Seção IX - Planejamento Bimestral -->
    <div class="section">
        <div class="section-title">IX. PLANEJAMENTO BIMESTRAL</div>
        <?php foreach ($data['planejamento_bimestral'] as $bimestre => $disciplinas): ?>
            <h3 style="text-align: center; background: #eee; padding: 5px;">BIMESTRE: <?php echo $bimestre; ?></h3>
            <?php foreach($disciplinas as $disciplina => $dados): ?>
                <table class="data-table planning-table" style="margin-bottom: 15px;">
                    <thead><tr><th colspan="2">DISCIPLINA: <?php echo htmlspecialchars(strtoupper($disciplina)); ?></th></tr></thead>
                    <tbody>
                        <tr><td style="width: 30%;" class="field-label">Objetivo para a turma</td><td><?php echo nl2br(v($dados, 'objetivo_turma')); ?></td></tr>
                        <tr><td class="field-label">Objetivo para o estudante</td><td><?php echo nl2br(v($dados, 'objetivo_estudante')); ?></td></tr>
                        <tr><td class="field-label">Metodologia e materiais</td><td><?php echo nl2br(v($dados, 'metodologia')); ?></td></tr>
                        <tr><td class="field-label">Habilidade adquirida</td><td><?php echo nl2br(v($dados, 'aprendizado')); ?></td></tr>
                    </tbody>
                </table>
            <?php endforeach; ?>
            <div class="page-break"></div>
        <?php endforeach; ?>
    </div>

    <!-- Seção X - Avaliações Bimestrais -->
    <div class="section">
        <div class="section-title">X. AVALIAÇÕES BIMESTRAIS</div>
        <?php foreach ($data['avaliacoes_bimestrais'] as $bimestre => $disciplinas): ?>
            <h3 style="text-align: center; background: #eee; padding: 5px;">BIMESTRE: <?php echo $bimestre; ?></h3>
            <table class="data-table assessment-table" style="margin-bottom: 15px;">
                <thead>
                    <tr><th>Disciplina</th><th>Valor</th><th>Nota</th><th>Grau de Autonomia</th><th>Metodologia</th><th>Diagnóstico Pedagógico</th></tr>
                </thead>
                <tbody>
                    <?php foreach ($disciplinas as $disciplina => $aval): ?>
                        <tr>
                            <td><?php echo htmlspecialchars(strtoupper($disciplina)); ?></td>
                            <td class="text-center"><?php echo v($aval, 'valor'); ?></td>
                            <td class="text-center"><?php echo v($aval, 'nota'); ?></td>
                            <td><?php echo v($aval, 'autonomia'); ?></td>
                            <td><?php echo v($aval, 'metodologia'); ?></td>
                            <td><?php echo v($aval, 'diagnostico'); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endforeach; ?>
    </div>

    <div class="page-break"></div>

    <!-- Seção XI - Relatório Semestral -->
    <div class="section">
        <div class="section-title">XI. RELATÓRIO PEDAGÓGICO DO DESENVOLVIMENTO DO ESTUDANTE / SEMESTRAL</div>
        <?php echo render_textarea('1º Semestre', v($pdi, 'relatorio_semestre_1'), 'Relatório descritivo elencando os aspectos cognitivos, sociais, comunicacionais e motores.'); ?>
        <?php echo render_textarea('2º Semestre', v($pdi, 'relatorio_semestre_2'), 'Relatório descritivo elencando os aspectos cognitivos, sociais, comunicacionais e motores.'); ?>
    </div>

</body>
</html>
