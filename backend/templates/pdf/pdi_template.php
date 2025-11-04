<?php
/**
 * Template PDF: Plano de Desenvolvimento Individual (PDI)
 */

// Helpers
function v($data, $key, $default = '') {
    return htmlspecialchars($data[$key] ?? $default, ENT_QUOTES, 'UTF-8');
}
function render_checkbox($value) {
    return '<span class="checkbox">' . ($value ? '&#9745;' : '&#9744;') . '</span>';
}
function render_aspect_row($label, $value) {
    $html = '<tr><td>' . $label . '</td>';
    $options = ['apresenta', 'apresenta_com_ajuda', 'nao_apresenta', 'nao_observado'];
    foreach ($options as $option) {
        $html .= '<td class="text-center">' . ($value == $option ? 'X' : '') . '</td>';
    }
    $html .= '</tr>';
    return $html;
}

$css = file_get_contents(__DIR__ . '/style.css');
$pdi = $data['pdi'];
$aspectos_psicomotores = $data['aspectos_psicomotores'];
$aspectos_pedagogicos = $data['aspectos_pedagogicos'];
$planejamento_bimestral = $data['planejamento_bimestral'];
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Plano de Desenvolvimento Individual (PDI)</title>
    <style>
        <?php echo $css; ?>
        .aspect-table th { font-size: 8pt; }
        .aspect-table td { font-size: 9pt; }
    </style>
</head>
<body>
    <htmlpageheader name="Header">
        <div class="header-container">
            ConectAEE | Plano de Desenvolvimento Individual (PDI)
        </div>
    </htmlpageheader>
    <htmlpagefooter name="Footer">
        <div class="footer-container">
            <div class="page-number"></div>
        </div>
    </htmlpagefooter>

    <h1>PLANO DE DESENVOLVIMENTO INDIVIDUAL – PDI</h1>
    <h2 class="document-subtitle">Modelo para as Redes Públicas e Privadas de Ensino</h2>

    <!-- SEÇÃO I - DADOS INSTITUCIONAIS -->
    <div class="section">
        <div class="section-title">I. DADOS INSTITUCIONAIS</div>
        <p><span class="field-label">Data da elaboração:</span> <span class="field-value"><?php echo v($pdi, 'data_elaboracao_formatada'); ?></span></p>
        <p><span class="field-label">Nome da escola:</span> <span class="field-value"><?php echo v($pdi, 'nome_escola'); ?></span></p>
        <p><span class="field-label">Diretor(a):</span> <span class="field-value"><?php echo v($pdi, 'diretor'); ?></span></p>
        <p class="field-label">Responsáveis pela elaboração do PDI:</p>
        <div class="textarea-field"><?php echo nl2br(v($pdi, 'responsaveis_elaboracao')); ?></div>
    </div>

    <!-- SEÇÃO II - DADOS DO ESTUDANTE -->
    <div class="section">
        <div class="section-title">II. DADOS DO(A) ESTUDANTE</div>
        <?php if (!empty($data['photo_path'])): ?>
            <div class="photo-container"><img src="<?php echo $data['photo_path']; ?>" /></div>
        <?php endif; ?>
        <p><span class="field-label">Nome:</span> <span class="field-value"><?php echo v($pdi, 'student_name'); ?></span></p>
        <p><span class="field-label">Data de Nascimento:</span> <span class="field-value"><?php echo v($pdi, 'data_nascimento_formatada'); ?></span></p>
        <p><span class="field-label">Ano de escolaridade:</span> <span class="field-value"><?php echo v($pdi, 'ano_escolaridade'); ?></span></p>
        <p><span class="field-label">Deficiência informada:</span> <span class="field-value"><?php echo v($pdi, 'deficiencia_informada'); ?></span></p>
    </div>

    <!-- SEÇÃO III - CONSIDERAÇÕES DA FAMÍLIA -->
    <div class="section">
        <div class="section-title">III. CONSIDERAÇÕES DA FAMÍLIA</div>
        <div class="textarea-field"><?php echo nl2br(v($pdi, 'consideracoes_familia')); ?></div>
    </div>

    <div class="page-break"></div>

    <!-- SEÇÃO VI - ASPECTOS PSICOMOTORES -->
    <div class="section">
        <div class="section-title">VI. ASPECTOS PSICOMOTORES OBSERVADOS</div>
        <table class="data-table aspect-table">
            <thead>
                <tr>
                    <th style="width: 55%;">Aspecto</th>
                    <th>Apresenta</th>
                    <th>Com Ajuda</th>
                    <th>Não Apresenta</th>
                    <th>Não Observado</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $psicomotores = [
                    'Esquema corporal' => 'esquema_corporal', 'Consciência corporal' => 'consciencia_corporal',
                    'Expressão corporal' => 'expressao_corporal', 'Equilíbrio dinâmico' => 'equilibrio_dinamico',
                    'Equilíbrio estático' => 'equilibrio_estatico', 'Lateralidade' => 'lateralidade'
                ];
                foreach ($psicomotores as $label => $key) {
                    echo render_aspect_row($label, v($aspectos_psicomotores, $key));
                }
                ?>
            </tbody>
        </table>
    </div>

    <!-- SEÇÃO VII - ASPECTOS PEDAGÓGICOS/COGNITIVOS -->
    <div class="section">
        <div class="section-title">VII. ASPECTOS PEDAGÓGICOS/COGNITIVOS OBSERVADOS</div>
        <table class="data-table aspect-table">
             <thead>
                <tr>
                    <th style="width: 55%;">Aspecto</th>
                    <th>Apresenta</th>
                    <th>Com Ajuda</th>
                    <th>Não Apresenta</th>
                    <th>Não Observado</th>
                </tr>
            </thead>
            <tbody>
                 <?php
                $pedagogicos = [
                    'Memória de Curto Prazo' => 'memoria_curto_prazo', 'Memória de Longo Prazo' => 'memoria_longo_prazo',
                    'Percepção Auditiva' => 'percepcao_auditiva', 'Percepção Visual' => 'percepcao_visual',
                    'Atenção Seletiva' => 'atencao_seletiva', 'Atenção Sustentada' => 'atencao_sustentada',
                    'Raciocínio Lógico' => 'raciocinio_logico', 'Pensamento Criativo' => 'pensamento_criativo'
                ];
                foreach ($pedagogicos as $label => $key) {
                    echo render_aspect_row($label, v($aspectos_pedagogicos, $key));
                }
                ?>
            </tbody>
        </table>
    </div>

    <div class="page-break"></div>

    <!-- SEÇÃO IX - PLANEJAMENTO BIMESTRAL -->
    <div class="section">
        <div class="section-title">IX. PLANEJAMENTO BIMESTRAL</div>
        <?php foreach ($planejamento_bimestral as $bimestre => $disciplinas): ?>
            <h3><?php echo $bimestre; ?>º Bimestre</h3>
            <?php foreach($disciplinas as $disciplina => $dados): ?>
                <table class="data-table">
                    <thead>
                        <tr><th colspan="2">Disciplina: <?php echo htmlspecialchars($disciplina); ?></th></tr>
                    </thead>
                    <tbody>
                        <tr><td style="width: 30%;" class="field-label">Objetivo para a turma</td><td><?php echo nl2br(v($dados, 'objetivo_turma')); ?></td></tr>
                        <tr><td class="field-label">Objetivo para o estudante</td><td><?php echo nl2br(v($dados, 'objetivo_estudante')); ?></td></tr>
                        <tr><td class="field-label">Metodologia e materiais</td><td><?php echo nl2br(v($dados, 'metodologia')); ?></td></tr>
                        <tr><td class="field-label">Habilidade adquirida</td><td><?php echo nl2br(v($dados, 'aprendizado')); ?></td></tr>
                    </tbody>
                </table>
            <?php endforeach; ?>
        <?php endforeach; ?>
    </div>

</body>
</html>
